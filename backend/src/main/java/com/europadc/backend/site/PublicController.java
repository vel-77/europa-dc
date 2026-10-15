package com.europadc.backend.site;

import java.time.Duration;

import java.util.List;

import com.europadc.backend.FileStorage;
import com.europadc.backend.site.CatalogService.CatalogItemDto;
import com.europadc.backend.site.SiteService.SiteDto;

import org.springframework.core.io.Resource;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
class PublicController {

	/** Catalog items for every room; the rooms themselves come with /api/site. */
	record CatalogDto(List<CatalogItemDto> items) {
	}

	private final SiteService site;
	private final CatalogService catalog;
	private final FileStorage files;

	PublicController(SiteService site, CatalogService catalog, FileStorage files) {
		this.site = site;
		this.catalog = catalog;
		this.files = files;
	}

	@GetMapping("/api/site")
	SiteDto site() {
		return site.publicSite();
	}

	@GetMapping("/api/catalog")
	CatalogDto catalog() {
		return new CatalogDto(catalog.items());
	}

	@GetMapping("/uploads/{name}")
	ResponseEntity<Resource> upload(@PathVariable String name) {
		String contentType = FileStorage.contentType(name);
		Resource file = contentType == null ? null : files.loadUpload(name);
		if (file == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok()
			.contentType(MediaType.parseMediaType(contentType))
			// File names are random and never reused, so the response can be cached for good.
			.cacheControl(CacheControl.maxAge(Duration.ofDays(365)).cachePublic().immutable())
			.header("X-Content-Type-Options", "nosniff")
			// Uploaded SVGs must never run scripts when opened directly.
			.header("Content-Security-Policy", "default-src 'none'; style-src 'unsafe-inline'; sandbox")
			.body(file);
	}

}
