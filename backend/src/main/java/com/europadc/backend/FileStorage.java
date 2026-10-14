package com.europadc.backend;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/**
 * Keeps uploaded files on disk under random names. Public images (logos,
 * project photos) live in the uploads folder and are served by the frontend;
 * inquiry attachments live in a separate folder that only the admin can read.
 */
@Component
public class FileStorage {

	public static final Map<String, String> IMAGE_TYPES = Map.of(
			"image/png", "png",
			"image/jpeg", "jpg",
			"image/webp", "webp");

	public static final Map<String, String> LOGO_TYPES = Map.of(
			"image/png", "png",
			"image/jpeg", "jpg",
			"image/webp", "webp",
			"image/svg+xml", "svg");

	public static final Map<String, String> ATTACHMENT_TYPES = Map.of(
			"image/png", "png",
			"image/jpeg", "jpg",
			"image/webp", "webp",
			"image/heic", "heic",
			"application/pdf", "pdf");

	private static final Map<String, String> CONTENT_TYPES = Map.of(
			"png", "image/png",
			"jpg", "image/jpeg",
			"webp", "image/webp",
			"svg", "image/svg+xml",
			"heic", "image/heic",
			"pdf", "application/pdf");

	public static final long MB = 1024 * 1024;

	private final Path uploads;
	private final Path attachments;

	FileStorage(EuropaProperties properties) {
		this.uploads = properties.uploadsDir().toAbsolutePath().normalize();
		this.attachments = properties.dataDir().resolve("attachments").toAbsolutePath().normalize();
	}

	/** Stores a public image or logo and returns its file name. */
	public String storeUpload(MultipartFile file, Map<String, String> allowed, long maxBytes, String tooLarge) {
		return store(uploads, file, allowed, maxBytes, tooLarge);
	}

	/** Stores a private inquiry attachment and returns its file name. */
	public String storeAttachment(MultipartFile file, long maxBytes, String tooLarge) {
		return store(attachments, file, ATTACHMENT_TYPES, maxBytes, tooLarge);
	}

	/** Copies a bundled seed image into the uploads folder under a fresh name. */
	public String storeSeed(InputStream content, String extension) {
		String name = UUID.randomUUID() + "." + extension;
		try {
			Files.createDirectories(uploads);
			Files.copy(content, uploads.resolve(name), StandardCopyOption.REPLACE_EXISTING);
		}
		catch (IOException exception) {
			throw new UncheckedIOException(exception);
		}
		return name;
	}

	public void deleteUpload(String name) {
		delete(uploads, name);
	}

	public void deleteAttachment(String name) {
		delete(attachments, name);
	}

	/** @return the public file, or null if there is none with that name */
	public Resource loadUpload(String name) {
		return load(uploads, name);
	}

	public Resource loadAttachment(String name) {
		return load(attachments, name);
	}

	/** @return the content type for a stored file name, or null if the extension is not one we write */
	public static String contentType(String name) {
		int dot = name.lastIndexOf('.');
		return dot < 0 ? null : CONTENT_TYPES.get(name.substring(dot + 1));
	}

	private static String store(Path folder, MultipartFile file, Map<String, String> allowed, long maxBytes, String tooLarge) {
		String extension = allowed.get(file.getContentType());
		if (extension == null) {
			throw ApiException.badRequest(describe(allowed.keySet()));
		}
		if (file.getSize() > maxBytes) {
			throw ApiException.badRequest(tooLarge);
		}
		String name = UUID.randomUUID() + "." + extension;
		try {
			Files.createDirectories(folder);
			file.transferTo(folder.resolve(name));
		}
		catch (IOException exception) {
			throw new UncheckedIOException(exception);
		}
		return name;
	}

	private static String describe(Set<String> types) {
		return types.contains("application/pdf") ? "Attachments must be images or PDF files."
				: types.contains("image/svg+xml") ? "Logos must be PNG, JPG, WebP or SVG files."
				: "Images must be PNG, JPG or WebP files.";
	}

	private static void delete(Path folder, String name) {
		if (name == null || name.isEmpty()) {
			return;
		}
		try {
			Files.deleteIfExists(resolve(folder, name));
		}
		catch (IOException exception) {
			throw new UncheckedIOException(exception);
		}
	}

	private static Resource load(Path folder, String name) {
		Path path = resolve(folder, name);
		return Files.isRegularFile(path) ? new FileSystemResource(path) : null;
	}

	private static Path resolve(Path folder, String name) {
		// Use only the last path segment so a crafted name cannot leave the folder.
		return folder.resolve(Path.of(name).getFileName());
	}

}
