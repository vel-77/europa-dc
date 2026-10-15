package com.europadc.backend.site;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.function.Function;
import java.util.function.Predicate;

import com.europadc.backend.ApiException;
import com.europadc.backend.FileStorage;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** Solutions, featured projects and testimonials: the editorial content of the home page. */
@Service
public class ContentService {

	static final long IMAGE_LIMIT = 8 * FileStorage.MB;
	static final String IMAGE_TOO_LARGE = "Images must be smaller than 8 MB.";
	static final int GALLERY_LIMIT = 12;

	/** A room. `slug` is its address, as in /catalog/kitchens; `intro` heads its catalog page. */
	public record SolutionDto(String id, String title, String description, String image, String slug, String intro) {
	}

	public record ProjectDto(String id, String title, String tags, String location, String cover, List<String> gallery) {
	}

	public record TestimonialDto(String id, String quote, String author) {
	}

	public record TestimonialRequest(String quote, String author) {
	}

	private final SolutionRepository solutions;
	private final ProjectRepository projects;
	private final TestimonialRepository testimonials;
	private final CatalogItemRepository catalog;
	private final FileStorage files;

	ContentService(SolutionRepository solutions, ProjectRepository projects, TestimonialRepository testimonials,
			CatalogItemRepository catalog, FileStorage files) {
		this.solutions = solutions;
		this.projects = projects;
		this.testimonials = testimonials;
		this.catalog = catalog;
		this.files = files;
	}

	/* ---------- Reading ---------- */

	public List<SolutionDto> solutions() {
		return solutions.findAllByOrderBySortOrderAsc().stream()
			.map(s -> new SolutionDto(s.getId(), s.getTitle(), s.getDescription(), s.getImage(), s.getSlug(),
					s.getIntro() == null ? "" : s.getIntro()))
			.toList();
	}

	public List<ProjectDto> projects() {
		return projects.findAllByOrderBySortOrderAsc().stream()
			.map(p -> new ProjectDto(p.getId(), p.getTitle(), p.getTags(), p.getLocation(), p.getCover(), lines(p.getGallery())))
			.toList();
	}

	public List<TestimonialDto> testimonials() {
		return testimonials.findAllByOrderBySortOrderAsc().stream()
			.map(t -> new TestimonialDto(t.getId(), t.getQuote(), t.getAuthor()))
			.toList();
	}

	/* ---------- Solutions ---------- */

	@Transactional
	public void saveSolution(String id, String title, String description, String slug, String intro, boolean removeImage,
			MultipartFile image) {
		Solution solution = id.isEmpty() ? null
				: solutions.findById(id).orElseThrow(() -> ApiException.notFound("That solution no longer exists."));
		if (solution == null) {
			solution = new Solution();
			solution.setId(UUID.randomUUID().toString());
			solution.setSortOrder(nextOrder(solutions.findAllByOrderBySortOrderAsc(), Solution::getSortOrder));
		}
		String cleanTitle = clean(title, 80);
		if (cleanTitle.isEmpty()) {
			throw ApiException.badRequest("Enter a title.");
		}
		solution.setTitle(cleanTitle);
		solution.setDescription(clean(description, 200));
		solution.setIntro(clean(intro, 1000));
		solution.setSlug(roomSlug(solution, clean(slug, 80)));
		if (hasFile(image) || removeImage) {
			String previous = solution.getImage();
			solution.setImage(hasFile(image) ? files.storeUpload(image, FileStorage.IMAGE_TYPES, IMAGE_LIMIT, IMAGE_TOO_LARGE) : null);
			files.deleteUpload(previous);
		}
		solutions.save(solution);
	}

	/**
	 * Works out the room's address. Typed by the admin: cleaned up and checked
	 * for clashes. Left empty: made from the title, numbered if already taken.
	 */
	private String roomSlug(Solution room, String requested) {
		Predicate<String> taken = slug -> solutions.findAll().stream()
			.anyMatch(other -> slug.equals(other.getSlug()) && !other.getId().equals(room.getId()));
		if (requested.isEmpty()) {
			return uniqueSlug(room.getTitle(), taken);
		}
		String slug = slugify(requested);
		if (slug.isEmpty()) {
			throw ApiException.badRequest("The address can only use letters, numbers and dashes.");
		}
		if (taken.test(slug)) {
			throw ApiException.badRequest("Another room already uses the address /catalog/" + slug + ".");
		}
		return slug;
	}

	/** Addresses are stored in 80 characters; this leaves room for a "-99" suffix. */
	private static final int SLUG_BASE_LIMIT = 76;

	/**
	 * An unused address made from free text, numbered "-2", "-3"... if taken.
	 * Text without Latin letters or digits (an Armenian title, say) becomes
	 * "room", so a room can always be saved; the admin can type a better one.
	 */
	static String uniqueSlug(String text, Predicate<String> taken) {
		String base = slugify(text);
		if (base.length() > SLUG_BASE_LIMIT) {
			base = base.substring(0, SLUG_BASE_LIMIT).replaceAll("-+$", "");
		}
		if (base.isEmpty()) {
			base = "room";
		}
		String candidate = base;
		for (int number = 2; taken.test(candidate); number += 1) {
			candidate = base + "-" + number;
		}
		return candidate;
	}

	/** Lower-case letters, digits and single dashes: "Walk-in Closets" becomes "walk-in-closets". */
	static String slugify(String text) {
		return text.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
	}

	@Transactional
	public void deleteSolution(String id) {
		long items = catalog.countBySolutionId(id);
		if (items > 0) {
			throw new ApiException(HttpStatus.CONFLICT, "This room still has " + items
					+ (items == 1 ? " catalog item" : " catalog items") + ". Move or remove them first.");
		}
		solutions.findById(id).ifPresent(solution -> {
			solutions.delete(solution);
			files.deleteUpload(solution.getImage());
		});
	}

	@Transactional
	public void moveSolution(String id, boolean up) {
		reorder(solutions, solutions.findAllByOrderBySortOrderAsc(), id, up, Solution::getId, Solution::setSortOrder);
	}

	/* ---------- Projects ---------- */

	@Transactional
	public void saveProject(String id, String title, String tags, String location, boolean removeCover, MultipartFile cover,
			List<MultipartFile> newPhotos, List<String> removePhotos) {
		Project project = id.isEmpty() ? null
				: projects.findById(id).orElseThrow(() -> ApiException.notFound("That project no longer exists."));
		if (project == null) {
			project = new Project();
			project.setId(UUID.randomUUID().toString());
			project.setGallery("");
			project.setSortOrder(nextOrder(projects.findAllByOrderBySortOrderAsc(), Project::getSortOrder));
		}
		String cleanTitle = clean(title, 120);
		if (cleanTitle.isEmpty()) {
			throw ApiException.badRequest("Enter a project title.");
		}
		project.setTitle(cleanTitle);
		project.setTags(clean(tags, 200));
		project.setLocation(clean(location, 120));

		PhotoEdit edit = new PhotoEdit();
		try {
			project.setGallery(editGallery(project.getGallery(), removePhotos, newPhotos, edit,
					"A project can have at most " + GALLERY_LIMIT + " gallery photos."));
			project.setCover(editCover(project.getCover(), removeCover, cover, edit));
			projects.save(project);
		}
		catch (RuntimeException exception) {
			abandon(edit);
			throw exception;
		}
		finish(edit);
	}

	/* ---------- Photos of projects and catalog items ---------- */

	/** Photo files touched by one save: new uploads, and old files to delete once it succeeds. */
	static final class PhotoEdit {

		private final List<String> added = new ArrayList<>();

		private final List<String> removed = new ArrayList<>();

	}

	/** Drops the gallery photos the admin ticked and stores the new uploads. */
	String editGallery(String current, List<String> removePhotos, List<MultipartFile> newPhotos, PhotoEdit edit, String tooMany) {
		List<String> gallery = new ArrayList<>(lines(current));
		if (removePhotos != null) {
			for (String name : removePhotos) {
				if (gallery.remove(name)) {
					edit.removed.add(name);
				}
			}
		}
		List<MultipartFile> uploads = newPhotos == null ? List.of() : newPhotos.stream().filter(ContentService::hasFile).toList();
		if (gallery.size() + uploads.size() > GALLERY_LIMIT) {
			throw ApiException.badRequest(tooMany);
		}
		for (MultipartFile photo : uploads) {
			gallery.add(storeImage(photo, edit));
		}
		return String.join("\n", gallery);
	}

	/** Replaces or removes a cover photo; returns the cover to keep. */
	String editCover(String current, boolean remove, MultipartFile cover, PhotoEdit edit) {
		if (!hasFile(cover) && !remove) {
			return current;
		}
		if (current != null) {
			edit.removed.add(current);
		}
		return hasFile(cover) ? storeImage(cover, edit) : null;
	}

	private String storeImage(MultipartFile file, PhotoEdit edit) {
		String name = files.storeUpload(file, FileStorage.IMAGE_TYPES, IMAGE_LIMIT, IMAGE_TOO_LARGE);
		edit.added.add(name);
		return name;
	}

	/** After a successful save: deletes the files that were replaced or removed. */
	void finish(PhotoEdit edit) {
		edit.removed.forEach(files::deleteUpload);
	}

	/** After a failed save: deletes the files uploaded so far, so none are left behind. */
	void abandon(PhotoEdit edit) {
		edit.added.forEach(files::deleteUpload);
	}

	@Transactional
	public void deleteProject(String id) {
		projects.findById(id).ifPresent(project -> {
			projects.delete(project);
			files.deleteUpload(project.getCover());
			lines(project.getGallery()).forEach(files::deleteUpload);
		});
	}

	@Transactional
	public void moveProject(String id, boolean up) {
		reorder(projects, projects.findAllByOrderBySortOrderAsc(), id, up, Project::getId, Project::setSortOrder);
	}

	/* ---------- Testimonials ---------- */

	@Transactional
	public void saveTestimonial(String id, TestimonialRequest request) {
		Testimonial testimonial = id.isEmpty() ? null
				: testimonials.findById(id).orElseThrow(() -> ApiException.notFound("That testimonial no longer exists."));
		if (testimonial == null) {
			testimonial = new Testimonial();
			testimonial.setId(UUID.randomUUID().toString());
			testimonial.setSortOrder(nextOrder(testimonials.findAllByOrderBySortOrderAsc(), Testimonial::getSortOrder));
		}
		String quote = clean(request.quote(), 1000);
		if (quote.isEmpty()) {
			throw ApiException.badRequest("Enter the quote.");
		}
		testimonial.setQuote(quote);
		testimonial.setAuthor(clean(request.author(), 120));
		testimonials.save(testimonial);
	}

	@Transactional
	public void deleteTestimonial(String id) {
		testimonials.deleteById(id);
	}

	@Transactional
	public void moveTestimonial(String id, boolean up) {
		reorder(testimonials, testimonials.findAllByOrderBySortOrderAsc(), id, up, Testimonial::getId, Testimonial::setSortOrder);
	}

	/* ---------- Helpers ---------- */

	interface OrderSetter<T> {

		void set(T entity, int order);

	}

	/** Swaps the entry with its neighbour and renumbers the list. */
	static <T> void reorder(JpaRepository<T, String> repository, List<T> all, String id, boolean up,
			Function<T, String> idOf, OrderSetter<T> setOrder) {
		int from = all.stream().map(idOf).toList().indexOf(id);
		int to = from + (up ? -1 : 1);
		if (from < 0 || to < 0 || to >= all.size()) {
			return;
		}
		Collections.swap(all, from, to);
		for (int index = 0; index < all.size(); index++) {
			setOrder.set(all.get(index), index);
		}
		repository.saveAll(all);
	}

	static <T> int nextOrder(List<T> all, Function<T, Integer> orderOf) {
		return all.stream().map(orderOf).max(Integer::compare).orElse(-1) + 1;
	}

	static List<String> lines(String value) {
		return value == null || value.isEmpty() ? List.of() : List.of(value.split("\n"));
	}

	static boolean hasFile(MultipartFile file) {
		return file != null && !file.isEmpty();
	}

	static String clean(String value, int max) {
		String trimmed = value == null ? "" : value.strip();
		return trimmed.length() <= max ? trimmed : trimmed.substring(0, max);
	}

}
