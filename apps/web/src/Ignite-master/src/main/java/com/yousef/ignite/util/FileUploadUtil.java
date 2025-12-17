package com.yousef.ignite.util;

import org.springframework.web.multipart.MultipartFile;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public class FileUploadUtil {

    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );

    private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList(
            "video/mp4", "video/webm", "video/ogg"
    );

    private static final List<String> ALLOWED_RESUME_TYPES = Arrays.asList(
            "application/pdf", "application/msword", 
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );

    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    private static final long MAX_RESUME_SIZE = 10 * 1024 * 1024; // 10MB

    public static void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = file.getContentType();
        if (!ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, GIF, WEBP allowed");
        }

        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("File too large. Maximum size is 5MB");
        }

        // Check for null bytes (potential path traversal)
        if (file.getOriginalFilename() != null && file.getOriginalFilename().contains("\0")) {
            throw new IllegalArgumentException("Invalid filename");
        }

        // Check for path traversal attempts
        if (file.getOriginalFilename() != null &&
                (file.getOriginalFilename().contains("..") || file.getOriginalFilename().contains("/"))) {
            throw new IllegalArgumentException("Invalid filename");
        }
    }

    public static void validateVideoFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = file.getContentType();
        if (!ALLOWED_VIDEO_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Only MP4, WEBM, OGG allowed");
        }

        if (file.getSize() > MAX_VIDEO_SIZE) {
            throw new IllegalArgumentException("File too large. Maximum size is 50MB");
        }

        if (file.getOriginalFilename() != null && file.getOriginalFilename().contains("\0")) {
            throw new IllegalArgumentException("Invalid filename");
        }

        if (file.getOriginalFilename() != null &&
                (file.getOriginalFilename().contains("..") || file.getOriginalFilename().contains("/"))) {
            throw new IllegalArgumentException("Invalid filename");
        }
    }

    public static String sanitizeFilename(String originalFilename) {
        if (originalFilename == null) {
            return UUID.randomUUID().toString();
        }

        // Extract extension safely
        String extension = "";
        if (originalFilename.contains(".")) {
            String[] parts = originalFilename.split("\\.");
            if (parts.length > 1) {
                extension = "." + parts[parts.length - 1];
                // Only allow alphanumeric in extension
                extension = extension.replaceAll("[^a-zA-Z0-9.]", "");
            }
        }

        // Generate safe filename with UUID
        return UUID.randomUUID().toString() + extension;
    }

    public static void validateResumeFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_RESUME_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Only PDF, DOC, DOCX allowed");
        }

        if (file.getSize() > MAX_RESUME_SIZE) {
            throw new IllegalArgumentException("File too large. Maximum size is 10MB");
        }

        if (file.getOriginalFilename() != null && file.getOriginalFilename().contains("\0")) {
            throw new IllegalArgumentException("Invalid filename");
        }

        if (file.getOriginalFilename() != null &&
                (file.getOriginalFilename().contains("..") || file.getOriginalFilename().contains("/"))) {
            throw new IllegalArgumentException("Invalid filename");
        }
    }

    public static String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf(".") + 1).toLowerCase();
    }
}
