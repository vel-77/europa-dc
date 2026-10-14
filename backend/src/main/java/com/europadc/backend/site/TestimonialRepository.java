package com.europadc.backend.site;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

interface TestimonialRepository extends JpaRepository<Testimonial, String> {

	List<Testimonial> findAllByOrderBySortOrderAsc();

}
