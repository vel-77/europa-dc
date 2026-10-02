package com.europadc.backend.site;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;
import java.util.UUID;

import com.europadc.backend.ApiException;
import com.europadc.backend.EuropaProperties;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

/** Stores uploaded brand logos on disk under random file names. */
@Component
class LogoStorage {

	private static final Map<String, String> EXTENSIONS = Map.of(
			"image/png", "png",
			"image/jpeg", "jpg",
			"image/webp", "webp",
			"image/svg+xml", "svg");

	private static final Map<String, String> CONTENT_TYPES = Map.of(
			"png", "image/png",
			"jpg", "image/jpeg",
			"webp", "image/webp",
			"svg", "image/svg+xml");

	private final Path folder;

	LogoStorage(EuropaProperties properties) {
		this.folder = properties.uploadsDir().toAbsolutePath().normalize();
	}

	/** @return the stored file name */
	String store(MultipartFile file) {
		String extension = EXTENSIONS.get(file.getContentType());
		if (extension == null) {
			throw ApiException.badRequest("Logos must be PNG, JPG, WebP or SVG files.");
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

	void delete(String name) {
		if (name == null) {
			return;
		}
		try {
			Files.deleteIfExists(resolve(name));
		}
		catch (IOException exception) {
			throw new UncheckedIOException(exception);
		}
	}

	/** @return the file, or null if there is no upload with that name */
	Resource load(String name) {
		Path path = resolve(name);
		return Files.isRegularFile(path) ? new FileSystemResource(path) : null;
	}

	/** @return the content type for a stored file name, or null if the extension is not one we write */
	String contentType(String name) {
		int dot = name.lastIndexOf('.');
		return dot < 0 ? null : CONTENT_TYPES.get(name.substring(dot + 1));
	}

	private Path resolve(String name) {
		// Use only the last path segment so a crafted name cannot leave the folder.
		return folder.resolve(Path.of(name).getFileName());
	}

}
