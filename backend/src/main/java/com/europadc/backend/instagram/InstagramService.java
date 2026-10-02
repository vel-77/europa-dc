package com.europadc.backend.instagram;

import java.net.http.HttpClient;
import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonProperty;

import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;

/**
 * Keeps a copy of the company's latest Instagram posts.
 *
 * Uses the official Instagram API with Instagram Login (graph.instagram.com).
 * It needs a long-lived access token for the professional account, pasted once
 * in the admin panel. Tokens last 60 days and are renewed here automatically,
 * so the feed keeps working without anyone touching it.
 */
@Service
public class InstagramService {

	private static final long ACCOUNT_ID = 1L;
	private static final int DEFAULT_POST_COUNT = 8;
	private static final Duration TOKEN_REFRESH_AFTER = Duration.ofDays(7);
	private static final String FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp";

	public record PostDto(String id, String caption, String image, String permalink,
			@JsonProperty("isVideo") boolean isVideo, String timestamp) {
	}

	public record StatusDto(boolean connected, String tokenUpdatedAt, int postCount, String fetchedAt, String lastError) {
	}

	record MediaPage(List<Media> data) {
	}

	record Media(String id, String caption, @JsonProperty("media_type") String mediaType,
			@JsonProperty("media_url") String mediaUrl, @JsonProperty("thumbnail_url") String thumbnailUrl,
			String permalink, String timestamp) {
	}

	record RefreshedToken(@JsonProperty("access_token") String accessToken) {
	}

	record ErrorBody(ErrorDetail error) {
	}

	record ErrorDetail(String message) {
	}

	private final InstagramAccountRepository accounts;
	private final InstagramPostRepository posts;
	private final TransactionTemplate transaction;
	private final RestClient http;

	InstagramService(InstagramAccountRepository accounts, InstagramPostRepository posts,
			PlatformTransactionManager transactionManager) {
		this.accounts = accounts;
		this.posts = posts;
		this.transaction = new TransactionTemplate(transactionManager);
		JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(
				HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(10)).build());
		factory.setReadTimeout(Duration.ofSeconds(10));
		this.http = RestClient.builder().requestFactory(factory).baseUrl("https://graph.instagram.com").build();
	}

	public List<PostDto> posts() {
		return posts.findAllByOrderBySortOrderAsc().stream()
			.map(post -> new PostDto(post.getId(), post.getCaption(), post.getImage(), post.getPermalink(),
					post.isVideo(), post.getPostedAt()))
			.toList();
	}

	public StatusDto status() {
		InstagramAccount account = account();
		return new StatusDto(!account.getAccessToken().isEmpty(), text(account.getTokenUpdatedAt()),
				account.getPostCount(), text(account.getFetchedAt()), account.getLastError());
	}

	/** Saves the connection settings and fetches straight away so the admin sees the result. */
	public synchronized void connect(String accessToken, int postCount) {
		InstagramAccount account = account();
		account.setPostCount(Math.min(24, Math.max(3, postCount)));
		// An empty token means "keep the one that is saved".
		if (accessToken != null && !accessToken.isBlank()) {
			account.setAccessToken(accessToken.trim());
			account.setTokenUpdatedAt(Instant.now());
		}
		accounts.save(account);
		refresh();
	}

	public synchronized void disconnect() {
		InstagramAccount account = account();
		account.setAccessToken("");
		account.setTokenUpdatedAt(null);
		account.setFetchedAt(null);
		account.setLastError(null);
		transaction.executeWithoutResult(status -> {
			accounts.save(account);
			posts.deleteAllInBatch();
		});
	}

	/** Runs every 15 minutes. If Instagram is unreachable the last good copy is kept. */
	@Scheduled(initialDelayString = "PT15S", fixedDelayString = "PT15M")
	public synchronized void refresh() {
		InstagramAccount account = account();
		if (account.getAccessToken().isEmpty()) {
			return;
		}

		Instant renewedAt = account.getTokenUpdatedAt();
		if (renewedAt != null && renewedAt.plus(TOKEN_REFRESH_AFTER).isBefore(Instant.now())) {
			try {
				RefreshedToken renewed = http.get()
					.uri("/refresh_access_token?grant_type=ig_refresh_token&access_token={token}", account.getAccessToken())
					.retrieve()
					.body(RefreshedToken.class);
				if (renewed != null && renewed.accessToken() != null) {
					account.setAccessToken(renewed.accessToken());
					account.setTokenUpdatedAt(Instant.now());
				}
			}
			catch (RestClientException exception) {
				// Keep using the current token; the feed request below reports real failures.
			}
		}

		account.setFetchedAt(Instant.now());
		try {
			List<InstagramPost> latest = fetch(account.getAccessToken(), account.getPostCount());
			account.setLastError(null);
			transaction.executeWithoutResult(status -> {
				accounts.save(account);
				posts.deleteAllInBatch();
				posts.saveAll(latest);
			});
		}
		catch (RestClientResponseException exception) {
			account.setLastError(describe(exception));
			accounts.save(account);
		}
		catch (RestClientException exception) {
			// Never store the raw message: it can contain the URL, which holds the token.
			account.setLastError("Could not reach Instagram.");
			accounts.save(account);
		}
	}

	private List<InstagramPost> fetch(String token, int count) {
		MediaPage page = http.get()
			.uri("/me/media?fields={fields}&limit={limit}&access_token={token}", FIELDS, count, token)
			.retrieve()
			.body(MediaPage.class);
		List<InstagramPost> result = new ArrayList<>();
		if (page == null || page.data() == null) {
			return result;
		}
		for (Media media : page.data()) {
			boolean video = "VIDEO".equals(media.mediaType());
			// Videos expose a still frame as thumbnail_url; media_url would be the video file.
			String image = video ? media.thumbnailUrl() : media.mediaUrl();
			if (image == null) {
				continue;
			}
			InstagramPost post = new InstagramPost();
			post.setId(media.id());
			post.setCaption(shorten(media.caption() == null ? "" : media.caption(), 4000));
			post.setImage(image);
			post.setPermalink(media.permalink());
			post.setVideo(video);
			post.setPostedAt(media.timestamp());
			post.setSortOrder(result.size());
			result.add(post);
		}
		return result;
	}

	private static String describe(RestClientResponseException exception) {
		try {
			ErrorBody body = exception.getResponseBodyAs(ErrorBody.class);
			if (body != null && body.error() != null && body.error().message() != null) {
				return shorten(body.error().message(), 1000);
			}
		}
		catch (RuntimeException unreadable) {
			// Fall through to the generic message.
		}
		return "Instagram returned status " + exception.getStatusCode().value() + ".";
	}

	private InstagramAccount account() {
		return accounts.findById(ACCOUNT_ID).orElseGet(() -> {
			InstagramAccount account = new InstagramAccount();
			account.setId(ACCOUNT_ID);
			account.setAccessToken("");
			account.setPostCount(DEFAULT_POST_COUNT);
			return account;
		});
	}

	private static String shorten(String value, int max) {
		return value.length() <= max ? value : value.substring(0, max);
	}

	private static String text(Instant instant) {
		return instant == null ? null : instant.toString();
	}

}
