package com.europadc.backend.instagram;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A copy of one recent Instagram post, replaced on every successful fetch. */
@Entity
@Table(name = "instagram_post")
public class InstagramPost {

	@Id
	private String id;

	@Column(nullable = false, length = 4000)
	private String caption;

	@Column(nullable = false, length = 2000)
	private String image;

	@Column(nullable = false, length = 500)
	private String permalink;

	@Column(nullable = false)
	private boolean video;

	@Column(nullable = false, length = 40)
	private String postedAt;

	@Column(nullable = false)
	private int sortOrder;

	public String getId() {
		return id;
	}

	public void setId(String id) {
		this.id = id;
	}

	public String getCaption() {
		return caption;
	}

	public void setCaption(String caption) {
		this.caption = caption;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	public String getPermalink() {
		return permalink;
	}

	public void setPermalink(String permalink) {
		this.permalink = permalink;
	}

	public boolean isVideo() {
		return video;
	}

	public void setVideo(boolean video) {
		this.video = video;
	}

	public String getPostedAt() {
		return postedAt;
	}

	public void setPostedAt(String postedAt) {
		this.postedAt = postedAt;
	}

	public int getSortOrder() {
		return sortOrder;
	}

	public void setSortOrder(int sortOrder) {
		this.sortOrder = sortOrder;
	}

}
