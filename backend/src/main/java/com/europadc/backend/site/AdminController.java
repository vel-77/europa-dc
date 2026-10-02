package com.europadc.backend.site;

import com.europadc.backend.instagram.InstagramService;
import com.europadc.backend.site.SiteService.AdminSiteDto;
import com.europadc.backend.site.SiteService.CategoryRequest;
import com.europadc.backend.site.SiteService.SettingsDto;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/** Everything under /api/admin requires a session token (see AdminAuthFilter). */
@RestController
@RequestMapping("/api/admin")
class AdminController {

	record MoveRequest(String direction) {

		boolean up() {
			return "up".equals(direction);
		}

	}

	record InstagramRequest(String accessToken, Integer postCount) {
	}

	private final SiteService site;
	private final InstagramService instagram;

	AdminController(SiteService site, InstagramService instagram) {
		this.site = site;
		this.instagram = instagram;
	}

	@GetMapping("/site")
	AdminSiteDto site() {
		return site.adminSite();
	}

	/* ---------- Brands (sent as multipart forms because of the logo file) ---------- */

	@PostMapping("/brands")
	void createBrand(@RequestParam String name, @RequestParam String categoryId,
			@RequestParam(defaultValue = "") String url, @RequestParam(required = false) MultipartFile logo) {
		site.createBrand(name, categoryId, url, logo);
	}

	@PostMapping("/brands/{id}")
	void updateBrand(@PathVariable String id, @RequestParam String name, @RequestParam String categoryId,
			@RequestParam(defaultValue = "") String url, @RequestParam(defaultValue = "false") boolean visible,
			@RequestParam(defaultValue = "false") boolean removeLogo,
			@RequestParam(required = false) MultipartFile logo) {
		site.updateBrand(id, name, categoryId, url, visible, removeLogo, logo);
	}

	@DeleteMapping("/brands/{id}")
	void deleteBrand(@PathVariable String id) {
		site.deleteBrand(id);
	}

	@PostMapping("/brands/{id}/move")
	void moveBrand(@PathVariable String id, @RequestBody MoveRequest request) {
		site.moveBrand(id, request.up());
	}

	/* ---------- Services ---------- */

	@PostMapping("/categories")
	void createCategory(@RequestBody CategoryRequest request) {
		site.createCategory(request);
	}

	@PutMapping("/categories/{id}")
	void updateCategory(@PathVariable String id, @RequestBody CategoryRequest request) {
		site.updateCategory(id, request);
	}

	@DeleteMapping("/categories/{id}")
	void deleteCategory(@PathVariable String id) {
		site.deleteCategory(id);
	}

	@PostMapping("/categories/{id}/move")
	void moveCategory(@PathVariable String id, @RequestBody MoveRequest request) {
		site.moveCategory(id, request.up());
	}

	/* ---------- Settings and Instagram ---------- */

	@PutMapping("/settings")
	void updateSettings(@RequestBody SettingsDto request) {
		site.updateSettings(request);
	}

	@PutMapping("/instagram")
	void connectInstagram(@RequestBody InstagramRequest request) {
		instagram.connect(request.accessToken(), request.postCount() == null ? 8 : request.postCount());
	}

	@PostMapping("/instagram/refresh")
	void refreshInstagram() {
		instagram.refresh();
	}

	@DeleteMapping("/instagram")
	void disconnectInstagram() {
		instagram.disconnect();
	}

}
