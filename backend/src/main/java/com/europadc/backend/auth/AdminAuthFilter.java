package com.europadc.backend.auth;

import java.io.IOException;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/** Rejects every /api/admin request that does not carry a valid session token. */
@Component
public class AdminAuthFilter extends OncePerRequestFilter {

	private static final String BEARER = "Bearer ";

	private final TokenService tokens;

	AdminAuthFilter(TokenService tokens) {
		this.tokens = tokens;
	}

	@Override
	protected boolean shouldNotFilter(HttpServletRequest request) {
		String path = request.getRequestURI();
		return !path.startsWith("/api/admin/") || path.equals("/api/admin/login");
	}

	@Override
	protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
			throws ServletException, IOException {
		String header = request.getHeader("Authorization");
		String token = (header != null && header.startsWith(BEARER)) ? header.substring(BEARER.length()) : null;
		if (!tokens.isValid(token)) {
			response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
			response.setContentType(MediaType.APPLICATION_JSON_VALUE);
			response.getWriter().write("{\"message\":\"Sign in to continue.\"}");
			return;
		}
		chain.doFilter(request, response);
	}

}
