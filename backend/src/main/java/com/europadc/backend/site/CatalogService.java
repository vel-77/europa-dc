package com.europadc.backend.site;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import com.europadc.backend.ApiException;
import com.europadc.backend.FileStorage;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/** The designs shown on each room's catalog page. */
@Service
public class CatalogService {

	public record CatalogItemDto(String id, String roomId, String title, String details, String description, String cover,
			List<String> gallery) {
	}

	private final CatalogItemRepository items;
	private final SolutionRepository rooms;
	private final FileStorage files;

	CatalogService(CatalogItemRepository items, SolutionRepository rooms, FileStorage files) {
		this.items = items;
		this.rooms = rooms;
		this.files = files;
	}

	/** Every item, in display order within its room. */
	public List<CatalogItemDto> items() {
		return items.findAllByOrderBySortOrderAsc().stream()
			.map(item -> new CatalogItemDto(item.getId(), item.getSolutionId(), item.getTitle(), item.getDetails(),
					item.getDescription(), item.getCover(), ContentService.lines(item.getGallery())))
			.toList();
	}

	@Transactional
	public void save(String id, String roomId, String title, String details, String description, boolean removeCover,
			MultipartFile cover, List<MultipartFile> newPhotos, List<String> removePhotos) {
		if (roomId == null || !rooms.existsById(roomId)) {
			throw ApiException.badRequest("Choose a room for this item.");
		}
		CatalogItem item = id.isEmpty() ? null
				: items.findById(id).orElseThrow(() -> ApiException.notFound("That catalog item no longer exists."));
		if (item == null) {
			item = new CatalogItem();
			item.setId(UUID.randomUUID().toString());
			item.setGallery("");
		}
		if (item.getSolutionId() == null || !item.getSolutionId().equals(roomId)) {
			// New, or moved to another room: it goes to the end of that room.
			item.setSolutionId(roomId);
			item.setSortOrder(ContentService.nextOrder(items.findBySolutionIdOrderBySortOrderAsc(roomId), CatalogItem::getSortOrder));
		}
		String cleanTitle = ContentService.clean(title, 120);
		if (cleanTitle.isEmpty()) {
			throw ApiException.badRequest("Enter a name for the item.");
		}
		item.setTitle(cleanTitle);
		item.setDetails(ContentService.clean(details, 200));
		item.setDescription(ContentService.clean(description, 2000));

		List<String> gallery = new ArrayList<>(ContentService.lines(item.getGallery()));
		List<String> toDelete = new ArrayList<>();
		if (removePhotos != null) {
			for (String name : removePhotos) {
				if (gallery.remove(name)) {
					toDelete.add(name);
				}
			}
		}
		List<MultipartFile> added = newPhotos == null ? List.of() : newPhotos.stream().filter(ContentService::hasFile).toList();
		if (gallery.size() + added.size() > ContentService.GALLERY_LIMIT) {
			throw ApiException.badRequest("An item can have at most " + ContentService.GALLERY_LIMIT + " photos.");
		}
		for (MultipartFile photo : added) {
			gallery.add(files.storeUpload(photo, FileStorage.IMAGE_TYPES, ContentService.IMAGE_LIMIT, ContentService.IMAGE_TOO_LARGE));
		}
		item.setGallery(String.join("\n", gallery));

		if (ContentService.hasFile(cover) || removeCover) {
			toDelete.add(item.getCover());
			item.setCover(ContentService.hasFile(cover)
					? files.storeUpload(cover, FileStorage.IMAGE_TYPES, ContentService.IMAGE_LIMIT, ContentService.IMAGE_TOO_LARGE)
					: null);
		}
		items.save(item);
		toDelete.forEach(files::deleteUpload);
	}

	@Transactional
	public void delete(String id) {
		items.findById(id).ifPresent(item -> {
			items.delete(item);
			files.deleteUpload(item.getCover());
			ContentService.lines(item.getGallery()).forEach(files::deleteUpload);
		});
	}

	/** Swaps the item with its neighbour in the same room. */
	@Transactional
	public void move(String id, boolean up) {
		CatalogItem item = items.findById(id).orElseThrow(() -> ApiException.notFound("That catalog item no longer exists."));
		ContentService.reorder(items, items.findBySolutionIdOrderBySortOrderAsc(item.getSolutionId()), id, up, CatalogItem::getId,
				CatalogItem::setSortOrder);
	}

}
