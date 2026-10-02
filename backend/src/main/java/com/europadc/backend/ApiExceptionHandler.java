package com.europadc.backend;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

/** Turns errors into the {"message": "..."} body the frontend expects. */
@RestControllerAdvice
public class ApiExceptionHandler {

	@ExceptionHandler(ApiException.class)
	ResponseEntity<Map<String, String>> handle(ApiException exception) {
		return ResponseEntity.status(exception.getStatus()).body(Map.of("message", exception.getMessage()));
	}

	@ExceptionHandler(MaxUploadSizeExceededException.class)
	ResponseEntity<Map<String, String>> handleTooLarge() {
		return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "Logos must be smaller than 1 MB."));
	}

}
