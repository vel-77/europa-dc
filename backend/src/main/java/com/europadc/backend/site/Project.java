package com.europadc.backend.site;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A featured project in the carousel, with a cover photo and a gallery. */
@Entity
@Table(name = "project")
public class Project {

	@Id
	private String id;

	@Column(nullable = false, length = 120)
	private String title;

	/** Short descriptor line, e.g. "Kitchen / Dekton / Walnut". */
	@Column(nullable = false, length = 200)
	private String tags;

	@Column(nullable = false, length = 120)
	private String location;

	/** File name inside the uploads folder, or null. */
	private String cover;

	/** Gallery file names, one per line. */
	@Column(nullable = false, length = 4000)
	private String gallery;

	@Column(nullable = false)
	private int sortOrder;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getTags() {
		return tags;
	}

	public void setTags(String tags) {
		this.tags = tags;
	}

	public String getLocation() {
		return location;
	}

	public void setLocation(String location) {
		this.location = location;
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
