package com.europadc.backend.site;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

interface CategoryRepository extends JpaRepository<Category, String> {

	List<Category> findAllByOrderBySortOrderAsc();

}
