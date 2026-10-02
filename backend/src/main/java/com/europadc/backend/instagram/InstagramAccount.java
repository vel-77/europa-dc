package com.europadc.backend.instagram;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** The Instagram connection. There is exactly one row, with id 1. */
@Entity
@Table(name = "instagram_account")
public class InstagramAccount {

	@Id
	private Long id;

	/** Empty when Instagram is not connected. */
	@Column(nullable = false, length = 1000)
	private String accessToken;

	/** When the token was saved or last renewed. */
	private Instant tokenUpdatedAt;

	@Column(nullable = false)
	private int postCount;

	private Instant fetchedAt;

	@Column(length = 1000)
	private String lastError;

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getAccessToken() {
		return accessToken;
	}

	public void setAccessToken(String accessToken) {
		this.accessToken = accessToken;
	}

	public Instant getTokenUpdatedAt() {
		return tokenUpdatedAt;
	}

	public void setTokenUpdatedAt(Instant tokenUpdatedAt) {
		this.tokenUpdatedAt = tokenUpdatedAt;
	}

	public int getPostCount() {
		return postCount;
	}

	public void setPostCount(int postCount) {
		this.postCount = postCount;
	}

	public Instant getFetchedAt() {
		return fetchedAt;
	}

	public void setFetchedAt(Instant fetchedAt) {
		this.fetchedAt = fetchedAt;
	}

	public String getLastError() {
		return lastError;
	}

	public void setLastError(String lastError) {
		this.lastError = lastError;
	}

}
