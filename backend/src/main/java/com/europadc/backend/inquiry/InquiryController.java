package com.europadc.backend.inquiry;

import java.util.List;

import com.europadc.backend.FileStorage;

import org.springframework.core.io.Resource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
class InquiryController {

	record ReadRequest(boolean read) {
	}

	private final InquiryService inquiries;

	InquiryController(InquiryService inquiries) {
		this.inquiries = inquiries;
	}

	/** The public contact form. The frontend passes the visitor's address as `client`. */
	@PostMapping("/api/inquiries")
	void submit(@RequestParam(defaultValue = "") String client, @RequestParam String name, @RequestParam String email,
			@RequestParam String projectType, @RequestParam String message,
			@RequestParam(required = false) List<MultipartFile> files) {
		inquiries.submit(client, name, email, projectType, message, files);
	}

	@PostMapping("/api/admin/inquiries/{id}/read")
	void markRead(@PathVariable String id, @RequestBody ReadRequest request) {
		inquiries.markRead(id, request.read());
	}

	@DeleteMapping("/api/admin/inquiries/{id}")
	void delete(@PathVariable String id) {
		inquiries.delete(id);
	}

	@GetMapping("/api/admin/inquiries/{id}/files/{name}")
	ResponseEntity<Resource> attachment(@PathVariable String id, @PathVariable String name) {
		String contentType = FileStorage.contentType(name);
		Resource file = contentType == null ? null : inquiries.attachment(id, name);
		if (file == null) {
			return ResponseEntity.notFound().build();
		}
		return ResponseEntity.ok()
			.contentType(MediaType.parseMediaType(contentType))
			.header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(name).build().toString())
			.header("X-Content-Type-Options", "nosniff")
			.header("Content-Security-Policy", "default-src 'none'; sandbox")
			.body(file);
	}

}
