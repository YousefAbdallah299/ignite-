package com.yousef.ignite.controller;

import com.yousef.ignite.dto.enums.MediaType;
import com.yousef.ignite.dto.response.BlogResponseDTO;
import com.yousef.ignite.dto.response.CommentResponseDTO;
import com.yousef.ignite.dto.response.LikeResponseDTO;
import com.yousef.ignite.dto.response.PagedResponse;
import com.yousef.ignite.service.BlogService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/blogs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
@Validated
@Tag(name = "Blogs", description = "Endpoints for blogs management.")
public class BlogController {
    private final BlogService blogService;

    @GetMapping
    public ResponseEntity<PagedResponse<BlogResponseDTO>> getAllBlogs(
            @RequestHeader(value = "Authorization", required = false) String token,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(blogService.getAllBlogs(token, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogResponseDTO> getBlogById(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(blogService.getBlogById(token, id));
    }

    @GetMapping("/{id}/comments")
    public ResponseEntity<PagedResponse<CommentResponseDTO>> getComments(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(blogService.getComments(token, id, page, size));
    }

    @GetMapping("/comments/{id}/replies")
    public ResponseEntity<PagedResponse<CommentResponseDTO>> getReplies(
            @RequestHeader(value = "Authorization", required = false) String token,
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(blogService.getReplies(token, id, page, size));
    }

    @GetMapping("/{id}/likes")
    public ResponseEntity<PagedResponse<LikeResponseDTO>> getBlogLikes(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(blogService.getBlogLikes(id, page, size));
    }

    @GetMapping("/comments/{id}/likes")
    public ResponseEntity<PagedResponse<LikeResponseDTO>> getCommentLikes(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size
    ) {
        return ResponseEntity.ok(blogService.getCommentLikes(id, page, size));
    }

    @PostMapping("/{id}/like")
    public ResponseEntity<Void> likeBlog(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        blogService.likeBlog(token, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/comments/{id}/like")
    public ResponseEntity<Void> likeComment(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        blogService.likeComment(token, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping(consumes = {"multipart/form-data"})
    public ResponseEntity<BlogResponseDTO> createBlog(
            @RequestHeader("Authorization") String token,
            @RequestParam(value = "content", required = false) String content,
            @RequestParam(value = "mediaType", required = false) MediaType mediaType,
            @RequestPart(value = "file", required = false) MultipartFile file
    ) {
        return ResponseEntity.ok(blogService.createBlog(token, content, mediaType, file));
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        blogService.deleteBlog(token, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<CommentResponseDTO> addComment(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestParam(required = false) Long parentId,
            @RequestBody String content
    ) {
        return ResponseEntity.ok(blogService.addComment(token, id, content, parentId));
    }


    @DeleteMapping("/comments/{id}")
    public ResponseEntity<Void> deleteComment(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id
    ) {
        blogService.deleteComment(token, id);
        return ResponseEntity.noContent().build();
    }


    @GetMapping("/me")
    public ResponseEntity<PagedResponse<BlogResponseDTO>> getMyBlogs(
            @RequestHeader("Authorization") String token,
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(blogService.getMyBlogs(token, id, page, size));
    }

}
