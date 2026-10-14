package com.europadc.backend.site;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A client quote shown in the testimonials rail. */
@Entity
@Table(name = "testimonial")
public class Testimonial {

	@Id
	private String id;

	@Column(nullable = false, length = 1000)
	private String quote;

	@Column(nullable = false, length = 120)
	private String author;

	@Column(nullable = false)
	private int sortOrder;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getQuote() {
		return quote;
	}

	public void setQuote(String quote) {
		this.quote = quote;
	}

	public String getAuthor() {
		return author;
	}

	public void setAuthor(String author) {
		this.author = author;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}

}
