package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.MediaType;
import com.yousef.ignite.dto.response.BlogResponseDTO;
import com.yousef.ignite.dto.response.CommentResponseDTO;
import com.yousef.ignite.dto.response.LikeResponseDTO;
import com.yousef.ignite.dto.response.PagedResponse;
import org.springframework.web.multipart.MultipartFile;

public interface BlogService {
    BlogResponseDTO createBlog(String token, String content, MediaType mediaType, MultipartFile file);

    PagedResponse<BlogResponseDTO> getAllBlogs(String token, int page, int size);
    BlogResponseDTO getBlogById(String token, Long id);
    void deleteBlog(String token, Long id);

    void likeBlog(String token, Long blogId);
    void likeComment(String token, Long commentId);

    CommentResponseDTO addComment(String token, Long blogId, String content, Long parentId);
    void deleteComment(String token, Long commentId);

    PagedResponse<CommentResponseDTO> getComments(String token, Long blogId, int page, int size);
    PagedResponse<CommentResponseDTO> getReplies(String token, Long parentId, int page, int size);

    PagedResponse<LikeResponseDTO> getBlogLikes(Long blogId, int page, int size);
    PagedResponse<LikeResponseDTO> getCommentLikes(Long commentId, int page, int size);


    PagedResponse<BlogResponseDTO> getMyBlogs(String token, Long id ,int page, int size);

}
