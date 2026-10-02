package com.europadc.backend.site;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

interface BrandRepository extends JpaRepository<Brand, String> {

	List<Brand> findAllByOrderBySortOrderAsc();

	List<Brand> findByCategoryIdOrderBySortOrderAsc(String categoryId);

	long countByCategoryId(String categoryId);

}
