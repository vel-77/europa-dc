package com.europadc.backend.site;

import java.io.IOException;
import java.io.InputStream;
import java.io.UncheckedIOException;
import java.util.List;
import java.util.UUID;

import com.europadc.backend.FileStorage;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Fills an empty database with Europa DC's starting content on first launch.
 * Projects and testimonials are sample content from the design mock-up and
 * are meant to be replaced in the admin panel.
 */
@Component
class SiteSeeder implements ApplicationRunner {

	private final SiteSettingsRepository settings;
	private final CategoryRepository categories;
	private final BrandRepository brands;
	private final SolutionRepository solutions;
	private final ProjectRepository projects;
	private final TestimonialRepository testimonials;
	private final FileStorage files;

	SiteSeeder(SiteSettingsRepository settings, CategoryRepository categories, BrandRepository brands,
			SolutionRepository solutions, ProjectRepository projects, TestimonialRepository testimonials,
			FileStorage files) {
		this.settings = settings;
		this.categories = categories;
		this.brands = brands;
		this.solutions = solutions;
		this.projects = projects;
		this.testimonials = testimonials;
		this.files = files;
	}

	@Override
	@Transactional
	public void run(ApplicationArguments args) {
		if (settings.existsById(SiteService.SETTINGS_ID)) {
			return;
		}

		SiteSettings row = new SiteSettings();
		row.setId(SiteService.SETTINGS_ID);
		row.setSiteName("Europa Design Center");
		row.setAddress("1217 West Glenoaks Blvd.\nGlendale, CA 91201");
		row.setMapUrl("https://www.google.com/maps/search/?api=1&query=1217+West+Glenoaks+Blvd+Glendale+CA+91201");
		row.setPhone("+1 (818) 696-2600");
		row.setEmail("Admin@EuropaDC.pro");
		row.setHours("");
		row.setInstagramHandle("europa.dc");
		settings.save(row);

		solution("Kitchens", "Custom kitchen design and cabinetry", "sol-kitchens");
		solution("Bathrooms", "Vanities, fixtures, surfaces, and details", "sol-bathrooms");
		solution("Closets", "Storage solutions designed around your lifestyle", "sol-closets");
		solution("Outdoor", "Outdoor kitchens and architectural solutions", "sol-outdoor");
		solution("Surfaces", "Premium stone and architectural surfaces", "sol-surfaces");
		solution("Details", "Fixtures, glass, wall panels, hardware, and finishing elements", "sol-details");

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

	private void solution(String title, String description, String imageName) {
		Solution solution = new Solution();
		solution.setId(UUID.randomUUID().toString());
		solution.setTitle(title);
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
