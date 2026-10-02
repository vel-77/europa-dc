package com.europadc.backend.site;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** Editable text and contact details. There is exactly one row, with id 1. */
@Entity
@Table(name = "site_settings")
public class SiteSettings {

	@Id
	private Long id;

	@Column(nullable = false, length = 80)
	private String siteName;

	@Column(nullable = false, length = 120)
	private String heroTitle;

	@Column(nullable = false, length = 400)
	private String heroText;

	@Column(nullable = false, length = 300)
	private String address;

	@Column(nullable = false, length = 1000)
	private String mapUrl;

	@Column(nullable = false, length = 40)
	private String phone;

	@Column(nullable = false, length = 120)
	private String email;

	@Column(nullable = false, length = 400)
	private String hours;

	@Column(nullable = false, length = 60)
	private String instagramHandle;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getSiteName() {
		return siteName;
	}

	public void setSiteName(String siteName) {
		this.siteName = siteName;
	}

	public String getHeroTitle() {
		return heroTitle;
	}

	public void setHeroTitle(String heroTitle) {
		this.heroTitle = heroTitle;
	}

	public String getHeroText() {
		return heroText;
	}

	public void setHeroText(String heroText) {
		this.heroText = heroText;
	}

	public String getAddress() {
		return address;
	}

	public void setAddress(String address) {
		this.address = address;
	}

	public String getMapUrl() {
		return mapUrl;
	}

	public void setMapUrl(String mapUrl) {
		this.mapUrl = mapUrl;
	}

	public String getPhone() {
		return phone;
	}

	public void setPhone(String phone) {
		this.phone = phone;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getHours() {
		return hours;
	}

	public void setHours(String hours) {
		this.hours = hours;
	}

	public String getInstagramHandle() {
		return instagramHandle;
	}

	public void setInstagramHandle(String instagramHandle) {
		this.instagramHandle = instagramHandle;
	}

}
