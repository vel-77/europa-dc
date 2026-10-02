package com.europadc.backend.instagram;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

interface InstagramPostRepository extends JpaRepository<InstagramPost, String> {

	List<InstagramPost> findAllByOrderBySortOrderAsc();

}
