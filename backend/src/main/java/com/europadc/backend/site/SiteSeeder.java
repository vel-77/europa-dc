package com.europadc.backend.site;

import java.util.List;
import java.util.UUID;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Fills an empty database with Europa DC's starting content on first launch. */
@Component
class SiteSeeder implements ApplicationRunner {

	private final SiteSettingsRepository settings;
	private final CategoryRepository categories;
	private final BrandRepository brands;

	SiteSeeder(SiteSettingsRepository settings, CategoryRepository categories, BrandRepository brands) {
		this.settings = settings;
		this.categories = categories;
		this.brands = brands;
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
		row.setHeroTitle("Your kitchen starts as a drawing.");
		row.setHeroText("Europa DC designs, supplies and installs European kitchens, baths and closets from our showroom in Glendale.");
		row.setAddress("1217 West Glenoaks Blvd.\nGlendale, CA 91201");
		row.setMapUrl("https://www.google.com/maps/search/?api=1&query=1217+West+Glenoaks+Blvd+Glendale+CA+91201");
		row.setPhone("+1 (818) 696-2600");
		row.setEmail("Admin@EuropaDC.pro");
		row.setHours("");
		row.setInstagramHandle("europa.dc");
		settings.save(row);

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
