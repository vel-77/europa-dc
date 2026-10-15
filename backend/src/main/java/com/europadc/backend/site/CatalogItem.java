package com.europadc.backend.site;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A design shown on a room's catalog page. */
@Entity
@Table(name = "catalog_item")
public class CatalogItem {

	@Id
	private String id;

	/** The room (Solution) this item belongs to. */
	@Column(nullable = false)
	private String solutionId;

	@Column(nullable = false, length = 120)
	private String title;

	/** Short materials line, e.g. "Walnut veneer / Stone / Brass". */
	@Column(nullable = false, length = 200)
	private String details;

	@Column(nullable = false, length = 2000)
	private String description;

	/** File name inside the uploads folder, or null. */
	private String cover;

	/** More photo file names, one per line. */
	@Column(nullable = false, length = 4000)
	private String gallery;

	/** Display order within the room, lowest first. */
	@Column(nullable = false)
	private int sortOrder;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getSolutionId() {
		return solutionId;
	}

	public void setSolutionId(String solutionId) {
		this.solutionId = solutionId;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDetails() {
		return details;
	}

	public void setDetails(String details) {
		this.details = details;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getCover() {
		return cover;
	}

	public void setCover(String cover) {
		this.cover = cover;
	}

	public String getGallery() {
		return gallery;
	}

	public void setGallery(String gallery) {
		this.gallery = gallery;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}

}
