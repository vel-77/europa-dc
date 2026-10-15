package com.europadc.backend.site;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A room type Europa DC designs, shown in the Solutions list with a photo. */
@Entity
@Table(name = "solution")
public class Solution {

	@Id
	private String id;

	@Column(nullable = false, length = 80)
	private String title;

	@Column(nullable = false, length = 200)
	private String description;

	/** File name inside the uploads folder, or null. */
	private String image;

	/** The room's address on the site, as in /catalog/kitchens. Always set; nullable only so older databases can be upgraded. */
	@Column(length = 80, unique = true)
	private String slug;

	/** A paragraph shown at the top of the room's catalog page. */
	@Column(length = 1000)
	private String intro;

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

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}

	public String getSlug() {
		return slug;
	}

	public void setSlug(String slug) {
		this.slug = slug;
	}

	public String getIntro() {
		return intro;
	}

	public void setIntro(String intro) {
		this.intro = intro;
	}

}
