package com.europadc.backend.site;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

interface CatalogItemRepository extends JpaRepository<CatalogItem, String> {

	List<CatalogItem> findAllByOrderBySortOrderAsc();

	List<CatalogItem> findBySolutionIdOrderBySortOrderAsc(String solutionId);

	long countBySolutionId(String solutionId);

}
