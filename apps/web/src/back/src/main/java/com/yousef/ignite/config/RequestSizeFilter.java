package com.yousef.ignite.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Rejects oversized requests early using Content-Length + content type heuristics.
 * Spring multipart limits also apply for file uploads.
 */
public class RequestSizeFilter extends OncePerRequestFilter {

    private static final long JSON_MAX_BYTES = 1024L * 1024L;      // 1 MB
    private static final long MULTIPART_MAX_BYTES = 12L * 1024L * 1024L; // 12 MB
    private static final long FALLBACK_MAX_BYTES = 2L * 1024L * 1024L;    // 2 MB

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        long contentLength = request.getContentLengthLong();
        if (contentLength <= 0) {
            filterChain.doFilter(request, response);
            return;
        }

        String contentType = request.getContentType();
        long maxBytes = FALLBACK_MAX_BYTES;

        if (contentType != null) {
            if (contentType.startsWith(MediaType.APPLICATION_JSON_VALUE) || contentType.startsWith(MediaType.APPLICATION_FORM_URLENCODED_VALUE)) {
                maxBytes = JSON_MAX_BYTES;
            } else if (contentType.startsWith(MediaType.MULTIPART_FORM_DATA_VALUE)) {
                maxBytes = MULTIPART_MAX_BYTES;
            }
        }

        if (contentLength > maxBytes) {
            response.setStatus(413);
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Payload too large.\"}");
            return;
        }

        filterChain.doFilter(request, response);
    }
}

