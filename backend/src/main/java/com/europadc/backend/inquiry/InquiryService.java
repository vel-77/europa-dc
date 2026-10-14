package com.europadc.backend.inquiry;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Pattern;

import com.europadc.backend.ApiException;
import com.europadc.backend.FileStorage;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** Project inquiries from the contact form, read by the admin. */
@Service
public class InquiryService {

	static final int MAX_FILES = 5;
	static final long FILE_LIMIT = 10 * FileStorage.MB;
	private static final Pattern EMAIL = Pattern.compile("^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$");
	// A client may send a few inquiries per hour; more than that is almost certainly a bot.
	private static final int PER_HOUR = 5;

	public record Attachment(String stored, String originalName) {
	}

	public record InquiryDto(String id, String name, String email, String projectType, String message,
			List<Attachment> files, String createdAt, boolean read) {
	}

	private record Window(int count, Instant resetAt) {
	}

	private final InquiryRepository inquiries;
	private final FileStorage files;
	private final Map<String, Window> recent = new ConcurrentHashMap<>();

	InquiryService(InquiryRepository inquiries, FileStorage files) {
		this.inquiries = inquiries;
		this.files = files;
	}

	public List<InquiryDto> all() {
		return inquiries.findAllByOrderByCreatedAtDesc().stream().map(InquiryService::dto).toList();
	}

	public long unread() {
		return inquiries.countByReadFalse();
	}

	/** @param client who is sending, normally their IP address, for rate limiting */
	public void submit(String client, String name, String email, String projectType, String message,
			List<MultipartFile> attachments) {
		String cleanName = clean(name, 120);
		String cleanEmail = clean(email, 200);
		String cleanType = clean(projectType, 60);
		String cleanMessage = clean(message, 4000);
		if (cleanName.isEmpty()) {
			throw ApiException.badRequest("Please enter your name.");
		}
		if (!EMAIL.matcher(cleanEmail).matches()) {
			throw ApiException.badRequest("Please enter a valid email address.");
		}
		if (cleanType.isEmpty()) {
			throw ApiException.badRequest("Please choose a project type.");
		}
		if (cleanMessage.isEmpty()) {
			throw ApiException.badRequest("Please tell us a little about your project.");
		}
		List<MultipartFile> present = attachments == null ? List.of()
				: attachments.stream().filter(file -> file != null && !file.isEmpty()).toList();
		if (present.size() > MAX_FILES) {
			throw ApiException.badRequest("You can attach up to " + MAX_FILES + " files.");
		}
		allow(client == null || client.isBlank() ? "unknown" : client);

		List<String> stored = new ArrayList<>();
		for (MultipartFile file : present) {
			String original = clean(file.getOriginalFilename() == null ? "file" : file.getOriginalFilename(), 150)
				.replace('\n', ' ').replace('\t', ' ');
			stored.add(files.storeAttachment(file, FILE_LIMIT, "Each attachment must be smaller than 10 MB.") + "\t" + original);
		}

		Inquiry inquiry = new Inquiry();
		inquiry.setId(UUID.randomUUID().toString());
		inquiry.setName(cleanName);
		inquiry.setEmail(cleanEmail);
		inquiry.setProjectType(cleanType);
		inquiry.setMessage(cleanMessage);
		inquiry.setFiles(String.join("\n", stored));
		inquiry.setCreatedAt(Instant.now());
		inquiry.setRead(false);
		inquiries.save(inquiry);
	}

	@Transactional
	public void markRead(String id, boolean read) {
		Inquiry inquiry = inquiries.findById(id).orElseThrow(() -> ApiException.notFound("That inquiry no longer exists."));
		inquiry.setRead(read);
		inquiries.save(inquiry);
	}

	@Transactional
	public void delete(String id) {
		inquiries.findById(id).ifPresent(inquiry -> {
			inquiries.delete(inquiry);
			attachments(inquiry).forEach(attachment -> files.deleteAttachment(attachment.stored()));
		});
	}

	/** @return the attachment, or null if the inquiry has no such file */
	public Resource attachment(String id, String stored) {
		Inquiry inquiry = inquiries.findById(id).orElse(null);
		if (inquiry == null || attachments(inquiry).stream().noneMatch(a -> a.stored().equals(stored))) {
			return null;
		}
		return files.loadAttachment(stored);
	}

	private void allow(String client) {
		Instant now = Instant.now();
		Window window = recent.compute(client, (key, current) ->
				current == null || current.resetAt().isBefore(now) ? new Window(1, now.plus(Duration.ofHours(1)))
						: new Window(current.count() + 1, current.resetAt()));
		if (window.count() > PER_HOUR) {
			throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many inquiries from this connection. Please try again later.");
		}
	}

	private static InquiryDto dto(Inquiry inquiry) {
		return new InquiryDto(inquiry.getId(), inquiry.getName(), inquiry.getEmail(), inquiry.getProjectType(),
				inquiry.getMessage(), attachments(inquiry), inquiry.getCreatedAt().toString(), inquiry.isRead());
	}

	private static List<Attachment> attachments(Inquiry inquiry) {
		if (inquiry.getFiles().isEmpty()) {
			return List.of();
		}
		List<Attachment> result = new ArrayList<>();
		for (String line : inquiry.getFiles().split("\n")) {
			String[] parts = line.split("\t", 2);
			result.add(new Attachment(parts[0], parts.length > 1 ? parts[1] : parts[0]));
		}
		return result;
	}

	private static String clean(String value, int max) {
		String trimmed = value == null ? "" : value.strip();
		return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
	}

}
