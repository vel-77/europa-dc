package com.europadc.backend.site;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** One of the services Europa DC offers; brands are grouped under these. */
@Entity
@Table(name = "category")
public class Category {

	@Id
	private String id;

	@Column(nullable = false, length = 80)
	private String name;

	@Column(nullable = false, length = 200)
	private String blurb;

	/** Sub-items such as "Countertops", one per line. */
	@Column(nullable = false, length = 2000)
	private String items;

	/** Display order, lowest first. */
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

	public String getBlurb() {
		return blurb;
	}

	public void setBlurb(String blurb) {
		this.blurb = blurb;
	}

	public String getItems() {
		return items;
	}

	public void setItems(String items) {
		this.items = items;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}

}
