package com.europadc.backend.site;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

interface SolutionRepository extends JpaRepository<Solution, String> {

	List<Solution> findAllByOrderBySortOrderAsc();

}
