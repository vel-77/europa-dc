package com.europadc.backend.site;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A brand shown on the home page under its category. */
@Entity
@Table(name = "brand")
public class Brand {

	@Id
	private String id;

	@Column(nullable = false, length = 80)
	private String name;

	@Column(nullable = false)
	private String categoryId;

	@Column(nullable = false, length = 500)
	private String url;

	/** File name inside the uploads folder, or null to show the name as text. */
	private String logo;

	@Column(nullable = false)
	private boolean visible;

	/** Display order within the category, lowest first. */
	@Column(nullable = false)
	private int sortOrder;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public String getCategoryId() {
		return categoryId;
	}

	public void setCategoryId(String categoryId) {
		this.categoryId = categoryId;
	}

	public String getUrl() {
		return url;
	}

	public void setUrl(String url) {
		this.url = url;
	}

	public String getLogo() {
		return logo;
	}

	public void setLogo(String logo) {
		this.logo = logo;
	}

	public boolean isVisible() {
		return visible;
	}

	public void setVisible(boolean visible) {
		this.visible = visible;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}

}
