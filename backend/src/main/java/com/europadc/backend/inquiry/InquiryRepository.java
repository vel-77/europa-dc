package com.europadc.backend.inquiry;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

interface InquiryRepository extends JpaRepository<Inquiry, String> {

	List<Inquiry> findAllByOrderByCreatedAtDesc();

	long countByReadFalse();

}
