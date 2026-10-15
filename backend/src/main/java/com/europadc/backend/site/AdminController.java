package com.europadc.backend.site;

import java.util.List;

import com.europadc.backend.instagram.InstagramService;
import com.europadc.backend.site.ContentService.TestimonialRequest;
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
	private final ContentService content;
	private final CatalogService catalog;
	private final InstagramService instagram;

	AdminController(SiteService site, ContentService content, CatalogService catalog, InstagramService instagram) {
		this.site = site;
		this.content = content;
		this.catalog = catalog;
		this.instagram = instagram;
	}

	@GetMapping("/site")
	AdminSiteDto site() {
		return site.adminSite();
	}

	/* ---------- Brands (multipart forms because of the logo file) ---------- */

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

	/* ---------- Brand categories ---------- */

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

	/* ---------- Solutions ---------- */

	@PostMapping({ "/solutions", "/solutions/{id}" })
	void saveSolution(@PathVariable(required = false) String id, @RequestParam String title,
			@RequestParam(defaultValue = "") String description, @RequestParam(defaultValue = "") String slug,
			@RequestParam(defaultValue = "") String intro, @RequestParam(defaultValue = "false") boolean removeImage,
			@RequestParam(required = false) MultipartFile image) {
		content.saveSolution(id == null ? "" : id, title, description, slug, intro, removeImage, image);
	}

	@DeleteMapping("/solutions/{id}")
	void deleteSolution(@PathVariable String id) {
		content.deleteSolution(id);
	}

	@PostMapping("/solutions/{id}/move")
	void moveSolution(@PathVariable String id, @RequestBody MoveRequest request) {
		content.moveSolution(id, request.up());
	}

	/* ---------- Catalog ---------- */

	@PostMapping({ "/catalog", "/catalog/{id}" })
	void saveCatalogItem(@PathVariable(required = false) String id, @RequestParam String roomId, @RequestParam String title,
			@RequestParam(defaultValue = "") String details, @RequestParam(defaultValue = "") String description,
			@RequestParam(defaultValue = "false") boolean removeCover, @RequestParam(required = false) MultipartFile cover,
			@RequestParam(required = false) List<MultipartFile> photos,
			@RequestParam(required = false) List<String> removePhotos) {
		catalog.save(id == null ? "" : id, roomId, title, details, description, removeCover, cover, photos, removePhotos);
	}

	@DeleteMapping("/catalog/{id}")
	void deleteCatalogItem(@PathVariable String id) {
		catalog.delete(id);
	}

	@PostMapping("/catalog/{id}/move")
	void moveCatalogItem(@PathVariable String id, @RequestBody MoveRequest request) {
		catalog.move(id, request.up());
	}

	/* ---------- Projects ---------- */

	@PostMapping({ "/projects", "/projects/{id}" })
	void saveProject(@PathVariable(required = false) String id, @RequestParam String title,
			@RequestParam(defaultValue = "") String tags, @RequestParam(defaultValue = "") String location,
			@RequestParam(defaultValue = "false") boolean removeCover, @RequestParam(required = false) MultipartFile cover,
			@RequestParam(required = false) List<MultipartFile> photos,
			@RequestParam(required = false) List<String> removePhotos) {
		content.saveProject(id == null ? "" : id, title, tags, location, removeCover, cover, photos, removePhotos);
	}

	@DeleteMapping("/projects/{id}")
	void deleteProject(@PathVariable String id) {
		content.deleteProject(id);
	}

	@PostMapping("/projects/{id}/move")
	void moveProject(@PathVariable String id, @RequestBody MoveRequest request) {
		content.moveProject(id, request.up());
	}

	/* ---------- Testimonials ---------- */

	@PostMapping("/testimonials")
	void createTestimonial(@RequestBody TestimonialRequest request) {
		content.saveTestimonial("", request);
	}

	@PutMapping("/testimonials/{id}")
	void updateTestimonial(@PathVariable String id, @RequestBody TestimonialRequest request) {
		content.saveTestimonial(id, request);
	}

	@DeleteMapping("/testimonials/{id}")
	void deleteTestimonial(@PathVariable String id) {
		content.deleteTestimonial(id);
	}

	@PostMapping("/testimonials/{id}/move")
	void moveTestimonial(@PathVariable String id, @RequestBody MoveRequest request) {
		content.moveTestimonial(id, request.up());
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
