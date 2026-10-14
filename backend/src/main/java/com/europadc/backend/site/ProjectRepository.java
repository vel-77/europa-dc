package com.europadc.backend.site;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

interface ProjectRepository extends JpaRepository<Project, String> {

	List<Project> findAllByOrderBySortOrderAsc();

}
