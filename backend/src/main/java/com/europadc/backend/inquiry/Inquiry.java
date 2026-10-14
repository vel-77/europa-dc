package com.europadc.backend.inquiry;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A project inquiry sent through the contact form. */
@Entity
@Table(name = "inquiry")
public class Inquiry {

	@Id
	private String id;

	@Column(nullable = false, length = 120)
	private String name;

	@Column(nullable = false, length = 200)
	private String email;

	@Column(nullable = false, length = 60)
	private String projectType;

	@Column(nullable = false, length = 4000)
	private String message;

	/** Attachments, one per line: stored name, a tab, then the original name. */
	@Column(nullable = false, length = 4000)
	private String files;

	@Column(nullable = false)
	private Instant createdAt;

	/** Set by the admin. "read" is a reserved word in SQL, hence the column name. */
	@Column(name = "is_read", nullable = false)
	private boolean read;

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

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public String getProjectType() {
		return projectType;
	}

	public void setProjectType(String projectType) {
		this.projectType = projectType;
	}

	public String getMessage() {
		return message;
	}

	public void setMessage(String message) {
		this.message = message;
	}

	public String getFiles() {
		return files;
	}

	public void setFiles(String files) {
		this.files = files;
	}

	public Instant getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(Instant createdAt) {
		this.createdAt = createdAt;
	}

	public boolean isRead() {
		return read;
	}

	public void setRead(boolean read) {
		this.read = read;
	}

}
