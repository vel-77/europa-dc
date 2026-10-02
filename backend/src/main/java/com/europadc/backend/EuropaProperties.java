package com.europadc.backend;

import java.nio.file.Path;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Settings read from the environment (see application.properties).
 *
 * @param adminPassword password for the admin panel
 * @param sessionSecret key used to sign admin session tokens
 * @param dataDir folder that holds the database file and uploaded logos
 */
@ConfigurationProperties("europa")
public record EuropaProperties(String adminPassword, String sessionSecret, Path dataDir) {

	public EuropaProperties {
		if (adminPassword == null || adminPassword.isBlank()) {
			throw new IllegalStateException("ADMIN_PASSWORD is not set (see backend/.env.example).");
		}
		if (sessionSecret == null || sessionSecret.length() < 32) {
			throw new IllegalStateException("SESSION_SECRET must be at least 32 characters (see backend/.env.example).");
		}
	}

	public Path uploadsDir() {
		return dataDir.resolve("uploads");
	}

}
