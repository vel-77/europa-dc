package com.europadc.backend.site;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import com.europadc.backend.FileStorage;

import org.springframework.context.SmartLifecycle;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Fills an empty database with Europa DC's starting content on first launch,
 * and upgrades databases created by earlier versions (see CONTENT_VERSION).
 * Projects, testimonials and catalog items are sample content, meant to be
 * replaced in the admin panel.
 */
@Component
class SiteSeeder implements SmartLifecycle {

	// A lifecycle bean in an early phase runs before the web server, which
	// starts in one of the last phases, so no request ever sees an empty or
	// half-upgraded database.
	private volatile boolean done;

	@Override
	public int getPhase() {
		return 0;
	}

	@Override
	public boolean isRunning() {
		return done;
	}

	@Override
	public void stop() {
		done = false;
	}


	private final SiteSettingsRepository settings;
	private final CategoryRepository categories;
	private final BrandRepository brands;
	private final SolutionRepository solutions;
	private final ProjectRepository projects;
	private final TestimonialRepository testimonials;
	private final CatalogItemRepository catalog;
	private final FileStorage files;

	/**
	 * Content upgrades applied so far. 1: the original site. 2: room addresses,
	 * intros and the catalog. Raise it when adding an upgrade to run().
	 */
	static final int CONTENT_VERSION = 2;

	private static final Map<String, String> INTROS = Map.of(
			"kitchens", "Custom European cabinetry, stone and built-in appliances, planned together around the way you cook and gather.",
			"bathrooms", "Vanities, stone, fixtures and lighting for primary baths, guest baths and powder rooms.",
			"closets", "Walk-in closets and dressing rooms with shelving, drawers and lighting built to fit the room.",
			"outdoor", "Outdoor kitchens and bars in materials made for sun and weather.",
			"surfaces", "Natural stone and ultracompact surfaces for countertops, islands, floors, walls and fireplaces.",
			"details", "Fixtures, glass, wall panels, hardware and the finishing elements that complete a space.");

	SiteSeeder(SiteSettingsRepository settings, CategoryRepository categories, BrandRepository brands,
			SolutionRepository solutions, ProjectRepository projects, TestimonialRepository testimonials,
			CatalogItemRepository catalog, FileStorage files) {
		this.settings = settings;
		this.categories = categories;
		this.brands = brands;
		this.solutions = solutions;
		this.projects = projects;
		this.testimonials = testimonials;
		this.catalog = catalog;
		this.files = files;
	}

	@Override
	@Transactional
	public void start() {
		seed();
		done = true;
	}

	private void seed() {
		SiteSettings existing = settings.findById(SiteService.SETTINGS_ID).orElse(null);
		if (existing == null) {
			seedNewSite();
			return;
		}
		int version = existing.getContentVersion() == null ? 1 : existing.getContentVersion();
		if (version < 2) {
			addRoomAddressesAndCatalog();
		}
		if (version < CONTENT_VERSION) {
			existing.setContentVersion(CONTENT_VERSION);
			settings.save(existing);
		}
	}

	/** Upgrade 2: gives every room an address and an intro, and adds sample catalog items. */
	private void addRoomAddressesAndCatalog() {
		for (Solution room : solutions.findAllByOrderBySortOrderAsc()) {
			if (room.getSlug() == null || room.getSlug().isBlank()) {
				room.setSlug(ContentService.uniqueSlug(room.getTitle(), this::slugInUse));
			}
			if (room.getIntro() == null) {
				room.setIntro(INTROS.getOrDefault(room.getSlug(), ""));
			}
			solutions.save(room);
		}
		if (catalog.count() == 0) {
			seedCatalog();
		}
	}

	private boolean slugInUse(String slug) {
		return solutions.findAll().stream().anyMatch(room -> slug.equals(room.getSlug()));
	}

	private void seedNewSite() {
		SiteSettings row = new SiteSettings();
		row.setId(SiteService.SETTINGS_ID);
		row.setSiteName("Europa Design Center");
		row.setAddress("1217 West Glenoaks Blvd.\nGlendale, CA 91201");
		row.setMapUrl("https://www.google.com/maps/search/?api=1&query=1217+West+Glenoaks+Blvd+Glendale+CA+91201");
		row.setPhone("+1 (818) 696-2600");
		row.setEmail("Admin@EuropaDC.pro");
		row.setHours("");
		row.setInstagramHandle("europa.dc");
		row.setContentVersion(CONTENT_VERSION);
		settings.save(row);

		solution("Kitchens", "kitchens", "Custom kitchen design and cabinetry", "sol-kitchens");
		solution("Bathrooms", "bathrooms", "Vanities, fixtures, surfaces, and details", "sol-bathrooms");
		solution("Closets", "closets", "Storage solutions designed around your lifestyle", "sol-closets");
		solution("Outdoor", "outdoor", "Outdoor kitchens and architectural solutions", "sol-outdoor");
		solution("Surfaces", "surfaces", "Premium stone and architectural surfaces", "sol-surfaces");
		solution("Details", "details", "Fixtures, glass, wall panels, hardware, and finishing elements", "sol-details");
		seedCatalog();

		project("Pasadena Modern", "Complete interior / Kitchen / Bath / Closets / Wall panels", "Pasadena", "proj-1");
		project("Glendale Dressing Room", "Closet / Smoked glass / Oak / Integrated lighting", "Glendale", "proj-2");
		project("Silver Lake Primary Bath", "Bathroom / Stone vanity / Brushed brass", "Los Angeles", "proj-3");

		testimonial("They understood how we cook, how we host, and how the light moves through the house. The kitchen feels like it was always meant to be there.", "Homeowner");
		testimonial("Every selection was explained and every detail was resolved before installation. The process was calm from start to finish.", "Homeowner");
		testimonial("The entire experience felt thoughtful from the first conversation to the final detail.", "Homeowner");
		testimonial("Seeing the Dekton slabs in the showroom made the decision easy.", "Architect");

		category("cabinets", "Cabinets", "Custom European cabinetry.", "Kitchens", "Closets", "Vanities");
		category("stonework", "Stonework", "Natural and engineered stone for every surface.",
				"Countertops", "Flooring", "Wall cladding", "Fireplaces");
		category("appliances", "Appliances", "Built-in appliances, planned together with the cabinetry.");
		category("hardware", "Hardware", "Custom handles and pulls.", "Custom hardware");
		category("doors", "Doors", "Exterior and interior doors.", "Exterior, custom", "Interior");
		category("decorative-panels", "Decorative panels", "Wall panels as a finished surface.");
		category("custom-mirrors", "Custom mirrors", "Mirrors made to size.");
		category("plumbing-fixtures", "Plumbing fixtures", "Faucets, sinks and shower fittings.");

		brand("Miele", "appliances", "https://www.mieleusa.com");
		brand("Gaggenau", "appliances", "https://www.gaggenau.com/us");
		brand("SMEG", "appliances", "https://www.smegusa.com");
		brand("PITT", "appliances", "https://www.pittcooking.com");
		brand("Invisacook", "appliances", "https://invisacook.com");
		brand("Fisher & Paykel", "appliances", "https://www.fisherpaykel.com/us");
		brand("Graff", "plumbing-fixtures", "https://www.graff-designs.com");
		brand("Grohe", "plumbing-fixtures", "https://www.grohe.us");
		brand("Hansgrohe", "plumbing-fixtures", "https://www.hansgrohe-usa.com");
		brand("Ruvati", "plumbing-fixtures", "https://www.ruvati.com");
	}

	/** Copies a bundled image from src/main/resources/seed into the uploads folder. */
	private String image(String name) {
		try (InputStream content = new ClassPathResource("seed/" + name + ".webp").getInputStream()) {
			return files.storeSeed(content, "webp");
		}
		catch (IOException exception) {
			throw new UncheckedIOException(exception);
		}
	}

	/** Sample items, described from what each photo shows. Rooms that do not exist are skipped. */
	private void seedCatalog() {
		item("kitchens", "Walnut kitchen with curved island", "Walnut veneer / Stone / Herringbone oak floor",
				"Warm walnut cabinetry wraps the room, with a curved, fluted island and a stone top that seats four.", "sol-kitchens");
		item("kitchens", "Black stone kitchen with waterfall island", "Dekton / Matte black lacquer / Integrated lighting",
				"Full-height black cabinetry, a Dekton backsplash and an island with waterfall ends, lit beneath the wall units.",
				"catalog-dekton-kitchen");
		item("kitchens", "Sage lacquer kitchen with brass trim", "Sage lacquer / Blue stone / Brass",
				"Soft sage cabinetry with brass trim, a blue stone backsplash and an island facing the view.", "catalog-sage-kitchen");
		item("kitchens", "Dark oak kitchen with dining island", "Dark oak / Charcoal lacquer / Lit open shelving",
				"Dark oak and charcoal cabinetry with lit open shelving and an island that extends into a dining table.",
				"catalog-oak-kitchen");
		item("kitchens", "Open kitchen in black and white lacquer", "Gloss lacquer / Stone wall / Integrated appliances",
				"A long run of black and white lacquer with integrated appliances, opening onto the garden.", "proj-1");
		item("kitchens", "Walnut tall units with built-in ovens", "Walnut veneer / Stone island / Lit niches",
				"Tall walnut units with built-in ovens and lit display niches beside a stone island.", "catalog-walnut-cabinetry");
		item("bathrooms", "Travertine vanity with brass fittings", "Travertine / Oak / Brushed brass",
				"A floating travertine vanity with an integrated basin, wall-mounted brass fittings and a backlit arched mirror.",
				"sol-bathrooms");
		item("bathrooms", "Powder room with marble pedestal basin", "Green marble / Walnut / Brass",
				"A sculpted green marble basin set against walnut panelling and lit niches.", "proj-3");
		item("bathrooms", "Marble vanity with brass faucet", "Marble / Brushed brass / Undermount basin",
				"A veined marble vanity with an undermount basin and a brushed brass faucet.", "catalog-brass-fixtures");
		item("closets", "Walk-in closet with center island", "Wood / Glass shelving / Integrated lighting",
				"Hanging space and shelving on every wall, lit from within, around a central island with drawers.", "sol-closets");
		item("closets", "Dressing room with framed shelving", "Walnut / Black metal frames / Integrated lighting",
				"Walnut shelving in slim black frames, with a dressing area and seating by the window.", "proj-2");
		item("outdoor", "Outdoor bar with stone counter", "Stone / Teak deck / Woven seating",
				"A stone-clad bar with seating for four on a hillside terrace.", "sol-outdoor");
		item("surfaces", "Marble island with fluted base", "Marble / Fluted base",
				"A veined marble top with a waterfall end over a fluted base.", "sol-surfaces");
		item("surfaces", "Dekton slab with copper veining", "Dekton / Ultracompact surface",
				"A black ultracompact surface with copper veining, shown on a mitred edge.", "catalog-dekton-slab");
		item("details", "Stone fireplace wall with lit shelving", "Stone cladding / Oak / Linear fireplace",
				"A linear fireplace set into stone cladding, with lit floating shelves and oak storage.", "sol-details");
	}

	private void item(String roomSlug, String title, String details, String description, String imageName) {
		Solution room = solutions.findAll().stream().filter(r -> roomSlug.equals(r.getSlug())).findFirst().orElse(null);
		if (room == null) {
			return;
		}
		CatalogItem item = new CatalogItem();
		item.setId(UUID.randomUUID().toString());
		item.setSolutionId(room.getId());
		item.setTitle(title);
		item.setDetails(details);
		item.setDescription(description);
		item.setCover(image(imageName));
		item.setGallery("");
		item.setSortOrder((int) catalog.countBySolutionId(room.getId()));
		catalog.save(item);
	}

	private void solution(String title, String slug, String description, String imageName) {
		Solution solution = new Solution();
		solution.setId(UUID.randomUUID().toString());
		solution.setTitle(title);
		solution.setSlug(slug);
		solution.setIntro(INTROS.getOrDefault(slug, ""));
		solution.setDescription(description);
		solution.setImage(image(imageName));
		solution.setSortOrder((int) solutions.count());
		solutions.save(solution);
	}

	private void project(String title, String tags, String location, String coverName) {
		Project project = new Project();
		project.setId(UUID.randomUUID().toString());
		project.setTitle(title);
		project.setTags(tags);
		project.setLocation(location);
		project.setCover(image(coverName));
		project.setGallery("");
		project.setSortOrder((int) projects.count());
		projects.save(project);
	}

	private void testimonial(String quote, String author) {
		Testimonial testimonial = new Testimonial();
		testimonial.setId(UUID.randomUUID().toString());
		testimonial.setQuote(quote);
		testimonial.setAuthor(author);
		testimonial.setSortOrder((int) testimonials.count());
		testimonials.save(testimonial);
	}

	private void category(String id, String name, String blurb, String... items) {
		Category category = new Category();
		category.setId(id);
		category.setName(name);
		category.setBlurb(blurb);
		category.setItems(String.join("\n", List.of(items)));
		category.setSortOrder((int) categories.count());
		categories.save(category);
	}

	private void brand(String name, String categoryId, String url) {
		Brand brand = new Brand();
		brand.setId(UUID.randomUUID().toString());
		brand.setName(name);
		brand.setCategoryId(categoryId);
		brand.setUrl(url);
		brand.setVisible(true);
		brand.setSortOrder((int) brands.count());
		brands.save(brand);
	}

}
