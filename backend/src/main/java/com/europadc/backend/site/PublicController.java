package com.europadc.backend.site;

import java.time.Duration;

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

	private final SiteService site;
	private final LogoStorage logos;

	PublicController(SiteService site, LogoStorage logos) {
		this.site = site;
		this.logos = logos;
	}

	@GetMapping("/api/site")
	SiteDto site() {
		return site.publicSite();
	}

	@GetMapping("/uploads/{name}")
	ResponseEntity<Resource> upload(@PathVariable String name) {
		String contentType = logos.contentType(name);
		Resource file = contentType == null ? null : logos.load(name);
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
