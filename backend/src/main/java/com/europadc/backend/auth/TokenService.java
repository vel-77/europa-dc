package com.europadc.backend.auth;

import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import com.europadc.backend.EuropaProperties;

import org.springframework.stereotype.Service;

/**
 * Issues and checks admin session tokens. A token is its own expiry time plus
 * an HMAC of that time, so nothing has to be stored on the server.
 */
@Service
public class TokenService {

	static final Duration LIFETIME = Duration.ofDays(7);

	private final EuropaProperties properties;

	TokenService(EuropaProperties properties) {
		this.properties = properties;
	}

	boolean passwordMatches(String candidate) {
		return constantTimeEquals(candidate == null ? "" : candidate, properties.adminPassword());
	}

	String issue() {
		String expires = String.valueOf(Instant.now().plus(LIFETIME).toEpochMilli());
		return expires + "." + sign(expires);
	}

	boolean isValid(String token) {
		if (token == null) {
			return false;
		}
		String[] parts = token.split("\\.", 2);
		if (parts.length != 2 || !constantTimeEquals(parts[1], sign(parts[0]))) {
			return false;
		}
		// The signature matched, so the first part is a number we wrote ourselves.
		return Long.parseLong(parts[0]) > Instant.now().toEpochMilli();
	}

	private String sign(String payload) {
		try {
			Mac mac = Mac.getInstance("HmacSHA256");
			mac.init(new SecretKeySpec(properties.sessionSecret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
			return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(payload.getBytes(StandardCharsets.UTF_8)));
		}
		catch (GeneralSecurityException exception) {
			throw new IllegalStateException(exception);
		}
	}

	private static boolean constantTimeEquals(String a, String b) {
		return MessageDigest.isEqual(a.getBytes(StandardCharsets.UTF_8), b.getBytes(StandardCharsets.UTF_8));
	}

}
