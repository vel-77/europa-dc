package com.europadc.backend.auth;

import java.time.Duration;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

import com.europadc.backend.ApiException;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
class LoginController {

	// Slow down password guessing: five failed attempts per client, then a 15 minute wait.
	private static final int MAX_FAILURES = 5;
	private static final Duration WINDOW = Duration.ofMinutes(15);

	private record Failures(int count, Instant resetAt) {
	}

	/** @param client an identifier for whoever is signing in, normally their IP address */
	record LoginRequest(String password, String client) {
	}

	record LoginResponse(String token, long maxAgeSeconds) {
	}

	private final Map<String, Failures> failures = new ConcurrentHashMap<>();

	private final TokenService tokens;

	LoginController(TokenService tokens) {
		this.tokens = tokens;
	}

	@PostMapping("/api/admin/login")
	LoginResponse login(@RequestBody LoginRequest request) {
		String client = (request.client() == null || request.client().isBlank()) ? "unknown" : request.client();
		Instant now = Instant.now();
		Failures current = failures.get(client);
		if (current != null && current.resetAt().isBefore(now)) {
			failures.remove(client);
			current = null;
		}
		if (current != null && current.count() >= MAX_FAILURES) {
			throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "Too many attempts. Try again in 15 minutes.");
		}
		if (!tokens.passwordMatches(request.password())) {
			failures.merge(client, new Failures(1, now.plus(WINDOW)),
					(old, fresh) -> new Failures(old.count() + 1, old.resetAt()));
			throw new ApiException(HttpStatus.UNAUTHORIZED, "That password is not correct.");
		}
		failures.remove(client);
		return new LoginResponse(tokens.issue(), TokenService.LIFETIME.toSeconds());
	}

}
