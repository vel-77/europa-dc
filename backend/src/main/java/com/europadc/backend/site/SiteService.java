package com.europadc.backend.site;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import com.europadc.backend.ApiException;
import com.europadc.backend.FileStorage;
import com.europadc.backend.inquiry.InquiryService;
import com.europadc.backend.inquiry.InquiryService.InquiryDto;
import com.europadc.backend.instagram.InstagramService;
import com.europadc.backend.instagram.InstagramService.PostDto;
import com.europadc.backend.instagram.InstagramService.StatusDto;
import com.europadc.backend.site.ContentService.ProjectDto;
import com.europadc.backend.site.ContentService.SolutionDto;
import com.europadc.backend.site.ContentService.TestimonialDto;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** Reads and changes everything the admin panel can edit: brands, services and settings. */
@Service
public class SiteService {

	static final long SETTINGS_ID = 1L;

	public record SettingsDto(String siteName, String address, String mapUrl, String phone, String email, String hours,
			String instagramHandle) {
	}

	public record CategoryDto(String id, String name, String blurb, List<String> items) {
	}

	public record BrandDto(String id, String name, String categoryId, String url, String logo, boolean visible) {
	}

	/** What the public home page needs. Hidden brands are left out. */
	public record SiteDto(SettingsDto settings, List<SolutionDto> solutions, List<ProjectDto> projects,
			List<TestimonialDto> testimonials, List<CategoryDto> categories, List<BrandDto> brands, List<PostDto> posts) {
	}

	/** What the admin panel needs: everything, plus Instagram state and inquiries. */
	public record AdminSiteDto(SettingsDto settings, List<SolutionDto> solutions, List<ProjectDto> projects,
			List<TestimonialDto> testimonials, List<CategoryDto> categories, List<BrandDto> brands, List<PostDto> posts,
			StatusDto instagram, List<InquiryDto> inquiries) {
	}

	public record CategoryRequest(String name, String blurb, List<String> items) {
	}

	private final SiteSettingsRepository settings;
	private final CategoryRepository categories;
	private final BrandRepository brands;
	private final FileStorage files;
	private final ContentService content;
	private final InstagramService instagram;
	private final InquiryService inquiries;

	SiteService(SiteSettingsRepository settings, CategoryRepository categories, BrandRepository brands,
			FileStorage files, ContentService content, InstagramService instagram, InquiryService inquiries) {
		this.settings = settings;
		this.categories = categories;
		this.brands = brands;
		this.files = files;
		this.content = content;
		this.instagram = instagram;
		this.inquiries = inquiries;
	}

	/* ---------- Reading ---------- */

	@Transactional(readOnly = true)
	public SiteDto publicSite() {
		List<BrandDto> visible = brandDtos().stream().filter(BrandDto::visible).toList();
		return new SiteDto(settingsDto(), content.solutions(), content.projects(), content.testimonials(), categoryDtos(),
				visible, instagram.posts());
	}

	@Transactional(readOnly = true)
	public AdminSiteDto adminSite() {
		return new AdminSiteDto(settingsDto(), content.solutions(), content.projects(), content.testimonials(),
				categoryDtos(), brandDtos(), instagram.posts(), instagram.status(), inquiries.all());
	}

	private SettingsDto settingsDto() {
		SiteSettings row = settings.findById(SETTINGS_ID).orElseThrow();
		return new SettingsDto(row.getSiteName(), row.getAddress(), row.getMapUrl(), row.getPhone(), row.getEmail(),
				row.getHours(), row.getInstagramHandle());
	}

	private List<CategoryDto> categoryDtos() {
		return categories.findAllByOrderBySortOrderAsc().stream()
			.map(category -> new CategoryDto(category.getId(), category.getName(), category.getBlurb(),
					category.getItems().isEmpty() ? List.of() : List.of(category.getItems().split("\n"))))
			.toList();
	}

	private List<BrandDto> brandDtos() {
		return brands.findAllByOrderBySortOrderAsc().stream()
			.map(brand -> new BrandDto(brand.getId(), brand.getName(), brand.getCategoryId(), brand.getUrl(),
					brand.getLogo(), brand.isVisible()))
			.toList();
	}

	/* ---------- Brands ---------- */

	@Transactional
	public void createBrand(String name, String categoryId, String url, MultipartFile logo) {
		Brand brand = new Brand();
		brand.setId(UUID.randomUUID().toString());
		brand.setVisible(true);
		brand.setSortOrder(brands.findAllByOrderBySortOrderAsc().stream().mapToInt(Brand::getSortOrder).max().orElse(-1) + 1);
		applyBrandFields(brand, name, categoryId, url);
		if (hasFile(logo)) {
			brand.setLogo(storeLogo(logo));
		}
		brands.save(brand);
	}

	@Transactional
	public void updateBrand(String id, String name, String categoryId, String url, boolean visible, boolean removeLogo,
			MultipartFile logo) {
		Brand brand = brands.findById(id).orElseThrow(() -> ApiException.notFound("That brand no longer exists."));
		applyBrandFields(brand, name, categoryId, url);
		brand.setVisible(visible);
		if (hasFile(logo) || removeLogo) {
			String previous = brand.getLogo();
			brand.setLogo(hasFile(logo) ? storeLogo(logo) : null);
			files.deleteUpload(previous);
		}
		brands.save(brand);
	}

	@Transactional
	public void deleteBrand(String id) {
		brands.findById(id).ifPresent(brand -> {
			brands.delete(brand);
			files.deleteUpload(brand.getLogo());
		});
	}

	/** Swaps the brand with its neighbour inside the same category. */
	@Transactional
	public void moveBrand(String id, boolean up) {
		Brand brand = brands.findById(id).orElseThrow(() -> ApiException.notFound("That brand no longer exists."));
		List<Brand> group = brands.findByCategoryIdOrderBySortOrderAsc(brand.getCategoryId());
		int from = group.stream().map(Brand::getId).toList().indexOf(id);
		int to = from + (up ? -1 : 1);
		if (to < 0 || to >= group.size()) {
			return;
		}
		Brand neighbour = group.get(to);
		int order = brand.getSortOrder();
		brand.setSortOrder(neighbour.getSortOrder());
		neighbour.setSortOrder(order);
		brands.saveAll(List.of(brand, neighbour));
	}

	private void applyBrandFields(Brand brand, String name, String categoryId, String url) {
		String cleanName = clean(name, 80);
		if (cleanName.isEmpty()) {
			throw ApiException.badRequest("Enter a brand name.");
		}
		if (categoryId == null || !categories.existsById(categoryId)) {
			throw ApiException.badRequest("Choose a service for the brand.");
		}
		brand.setName(cleanName);
		brand.setCategoryId(categoryId);
		brand.setUrl(webUrl(clean(url, 500), "The website address is not valid."));
	}

	/* ---------- Services (categories) ---------- */

	@Transactional
	public void createCategory(CategoryRequest request) {
		Category category = new Category();
		String id = slug(clean(request.name(), 80));
		while (categories.existsById(id)) {
			id += "-2";
		}
		category.setId(id);
		category.setSortOrder(categories.findAllByOrderBySortOrderAsc().stream().mapToInt(Category::getSortOrder).max().orElse(-1) + 1);
		applyCategoryFields(category, request);
		categories.save(category);
	}

	@Transactional
	public void updateCategory(String id, CategoryRequest request) {
		Category category = categories.findById(id)
			.orElseThrow(() -> ApiException.notFound("That service no longer exists."));
		applyCategoryFields(category, request);
		categories.save(category);
	}

	@Transactional
	public void deleteCategory(String id) {
		long count = brands.countByCategoryId(id);
		if (count > 0) {
			throw new ApiException(HttpStatus.CONFLICT, "This service still has " + count
					+ (count == 1 ? " brand" : " brands") + ". Move or remove them first.");
		}
		categories.deleteById(id);
	}

	@Transactional
	public void moveCategory(String id, boolean up) {
		List<Category> all = categories.findAllByOrderBySortOrderAsc();
		int from = all.stream().map(Category::getId).toList().indexOf(id);
		int to = from + (up ? -1 : 1);
		if (from < 0 || to < 0 || to >= all.size()) {
			return;
		}
		Collections.swap(all, from, to);
		for (int index = 0; index < all.size(); index++) {
			all.get(index).setSortOrder(index);
		}
		categories.saveAll(all);
	}

	private void applyCategoryFields(Category category, CategoryRequest request) {
		String name = clean(request.name(), 80);
		if (name.isEmpty()) {
			throw ApiException.badRequest("Enter a name for the service.");
		}
		List<String> items = request.items() == null ? List.of()
				: request.items().stream().map(item -> clean(item, 100)).filter(item -> !item.isEmpty()).toList();
		category.setName(name);
		category.setBlurb(clean(request.blurb(), 200));
		category.setItems(clean(String.join("\n", items), 2000));
	}

	/* ---------- Settings ---------- */

	@Transactional
	public void updateSettings(SettingsDto request) {
		SiteSettings row = settings.findById(SETTINGS_ID).orElseThrow();
		String siteName = clean(request.siteName(), 80);
		if (!siteName.isEmpty()) {
			row.setSiteName(siteName);
		}
		row.setAddress(clean(request.address(), 300));
		row.setMapUrl(webUrl(clean(request.mapUrl(), 1000), "The map link is not valid."));
		row.setPhone(clean(request.phone(), 40));
		row.setEmail(clean(request.email(), 120));
		row.setHours(clean(request.hours(), 400));
		row.setInstagramHandle(clean(request.instagramHandle(), 60).replaceFirst("^@", ""));
		settings.save(row);
	}

	/* ---------- Helpers ---------- */

	private String storeLogo(MultipartFile logo) {
		return files.storeUpload(logo, FileStorage.LOGO_TYPES, FileStorage.MB, "Logos must be smaller than 1 MB.");
	}

	private static boolean hasFile(MultipartFile file) {
		return file != null && !file.isEmpty();
	}

	private static String clean(String value, int max) {
		String trimmed = value == null ? "" : value.strip();
		return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
	}

	private static String slug(String name) {
		String slug = name.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
		return slug.isEmpty() ? "service" : slug;
	}

	/** Accepts "example.com" as well as full addresses, and only ever returns http(s) links. */
	private static String webUrl(String value, String error) {
		if (value.isEmpty()) {
			return "";
		}
		String candidate = value.matches("(?i)^https?://.*") ? value : "https://" + value;
		try {
			URI uri = new URI(candidate);
			if (uri.getHost() == null) {
				throw ApiException.badRequest(error);
			}
			return uri.toString();
		}
		catch (URISyntaxException exception) {
			throw ApiException.badRequest(error);
		}
	}

}
