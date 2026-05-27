package com.yousef.ignite.service;

import com.yousef.ignite.dto.enums.MediaType;
import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.dto.response.BlogResponseDTO;
import com.yousef.ignite.dto.response.CommentResponseDTO;
import com.yousef.ignite.dto.response.LikeResponseDTO;
import com.yousef.ignite.dto.response.PagedResponse;
import com.yousef.ignite.entity.*;
import com.yousef.ignite.exception.custom.ResourceNotFoundException;
import com.yousef.ignite.exception.custom.UnauthorizedAccessException;
import com.yousef.ignite.repository.*;
import com.yousef.ignite.service.security.JwtUtils;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import com.yousef.ignite.util.FileUploadUtil;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import org.springframework.web.multipart.MultipartFile;


@Service
@RequiredArgsConstructor
public class BlogServiceImpl implements BlogService {

    private final BlogRepository blogRepository;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final CommentRepository commentRepository;
    private final BlogLikeRepository blogLikeRepository;
    private final CommentLikeRepository commentLikeRepository;

    @Override
    @Transactional
    public BlogResponseDTO createBlog(String token, String content, MediaType mediaType, MultipartFile file) {
        token = token.substring(7);
        String loggedInUserEmail = jwtUtils.getEmailFromJwtToken(token);

        User user = userRepository.findUserByEmail(loggedInUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String fileUrl = null;

        try {
            if (file != null && !file.isEmpty()) {
                if (mediaType == MediaType.IMAGE) {
                    FileUploadUtil.validateImageFile(file);
                } else if (mediaType == MediaType.VIDEO) {
                    FileUploadUtil.validateVideoFile(file);
                }


                String uploadDir = "uploads/";
                File dir = new File(uploadDir);
                if (!dir.exists()) dir.mkdirs();

                String fileName = FileUploadUtil.sanitizeFilename(file.getOriginalFilename());
                Path filePath = Path.of(uploadDir + fileName);

                Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

                fileUrl = "/uploads/" + fileName;

                // auto-detect type if not explicitly provided
                if (mediaType == null) {
                    String mime = file.getContentType();
                    if (mime != null && mime.startsWith("video")) {
                        mediaType = MediaType.VIDEO;
                    } else {
                        mediaType = MediaType.IMAGE;
                    }
                }
            } else {
                // no file uploaded → must be text
                mediaType = MediaType.TEXT;
            }
        } catch (IOException e) {
            throw new RuntimeException("File upload failed", e);
        }

        Blog blog = Blog.builder()
                .user(user)
                .content(content)
                .mediaType(mediaType)
                .mediaUrl(fileUrl)
                .createdAt(LocalDateTime.now())
                .build();

        blogRepository.save(blog);

        return mapToDTO(blog, token);
    }




    @Override
    public PagedResponse<BlogResponseDTO> getAllBlogs(String token, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Blog> blogPage = blogRepository.findAllByOrderByCreatedAtDesc(pageRequest);

        return new PagedResponse<>(
                blogPage.getContent().stream().map(c -> mapToDTO(c, token)).toList(),
                blogPage.getNumber(),
                blogPage.getSize(),
                blogPage.getTotalElements(),
                blogPage.getTotalPages(),
                blogPage.isLast()
        );
    }

    @Override
    @Transactional
    public BlogResponseDTO getBlogById(String token, Long id) {
        Blog blog = blogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));

        long likeCount = blogLikeRepository.countByBlogId(blog.getId());
        long commentCount = commentRepository.countByBlogIdAndParentCommentIsNull(blog.getId());

        boolean likedByCurrentUser = false;
        if (token != null && token.startsWith("Bearer ")) {
            Long userId = getCurrentUserId(token);
            likedByCurrentUser = blogLikeRepository.findByBlogIdAndUserId(blog.getId(), userId).isPresent();
        }

        return BlogResponseDTO.builder()
                .id(blog.getId())
                .userId(blog.getUser().getId())
                .username(blog.getUser().getFirstName())
                .content(blog.getContent())
                .mediaType(blog.getMediaType())
                .mediaUrl(blog.getMediaUrl())
                .createdAt(blog.getCreatedAt())
                .likeCount(likeCount)
                .commentCount(commentCount)
                .userRole(blog.getUser().getRole())
                .likedByCurrentUser(likedByCurrentUser)
                .build();
    }

    @Override
    @Transactional
    public void deleteBlog(String token, Long blogId) {
        token = token.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));

        if (!blog.getUser().getId().equals(user.getId()) && !user.getRole().equals(UserRole.ADMIN)) {
            throw new UnauthorizedAccessException("You can only delete your own blogs");
        }

        // ✅ Bulk delete (much faster for large datasets)
        commentLikeRepository.deleteByBlogId(blogId);
        blogLikeRepository.deleteByBlogId(blogId);
        commentRepository.deleteByBlogId(blogId);
        blogRepository.deleteById(blogId);
    }



    @Override
    @Transactional
    public void likeBlog(String token, Long blogId) {
        token = token.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));

        Optional<BlogLike> existingLike = blogLikeRepository.findByBlogIdAndUserId(blogId, user.getId());

        if (existingLike.isPresent()) {
            blogLikeRepository.delete(existingLike.get()); // unlike
        } else {
            blogLikeRepository.save(BlogLike.builder()
                    .blog(blog)
                    .user(user)
                    .createdAt(LocalDateTime.now())
                    .build()
            ); // like
        }
    }

    @Override
    @Transactional
    public void likeComment(String token, Long commentId) {
        token = token.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        Optional<CommentLike> existingLike = commentLikeRepository.findByCommentIdAndUserId(commentId, user.getId());

        if (existingLike.isPresent()) {
            commentLikeRepository.delete(existingLike.get()); // unlike
        } else {
            commentLikeRepository.save(CommentLike.builder()
                    .comment(comment)
                    .user(user)
                    .createdAt(LocalDateTime.now())
                    .build()
            ); // like
        }
    }


    @Override
    @Transactional
    public CommentResponseDTO addComment(String token, Long blogId, String content, Long parentId) {
        token = token.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Blog blog = blogRepository.findById(blogId)
                .orElseThrow(() -> new ResourceNotFoundException("Blog not found"));

        Comment parent = null;
        if (parentId != null) {
            parent = commentRepository.findById(parentId)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent comment not found"));
        }

        Comment comment = Comment.builder()
                .blog(blog)
                .user(user)
                .content(content)
                .parentComment(parent)
                .createdAt(LocalDateTime.now())
                .build();

        commentRepository.save(comment);

        return mapCommentToDTO(comment, "Bearer " + token);
    }


    @Override
    @Transactional
    public void deleteComment(String token, Long commentId) {
        token = token.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        User user = userRepository.findUserByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new ResourceNotFoundException("Comment not found"));

        if (
                !comment.getUser().getId().equals(user.getId()) &&
                        !comment.getBlog().getUser().getId().equals(user.getId()) &&
                        !user.getRole().equals(UserRole.ADMIN)
        ) {
            throw new UnauthorizedAccessException("You are not allowed to delete this comment");
        }


        // ✅ Force load replies and likes so orphanRemoval can cascade
        comment.getReplies().size();
        comment.getLikes().size();

        commentRepository.delete(comment);
    }



    @Override
    public PagedResponse<LikeResponseDTO> getBlogLikes(Long blogId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<BlogLike> likePage = blogLikeRepository.findByBlogId(blogId, pageRequest);

        List<LikeResponseDTO> likes = likePage.stream()
                .map(like -> LikeResponseDTO.builder()
                        .userId(like.getUser().getId())
                        .username(like.getUser().getFirstName() + " " + like.getUser().getLastName())
                        .userRole(like.getUser().getRole())
                        .build())
                .toList();

        return new PagedResponse<>(
                likes,
                likePage.getNumber(),
                likePage.getSize(),
                likePage.getTotalElements(),
                likePage.getTotalPages(),
                likePage.isLast()
        );
    }

    @Override
    public PagedResponse<LikeResponseDTO> getCommentLikes(Long commentId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<CommentLike> likePage = commentLikeRepository.findByCommentId(commentId, pageRequest);

        List<LikeResponseDTO> likes = likePage.stream()
                .map(like -> LikeResponseDTO.builder()
                        .userId(like.getUser().getId())
                        .username(like.getUser().getFirstName() + " " + like.getUser().getLastName())
                        .userRole(like.getUser().getRole())
                        .build())
                .toList();

        return new PagedResponse<>(
                likes,
                likePage.getNumber(),
                likePage.getSize(),
                likePage.getTotalElements(),
                likePage.getTotalPages(),
                likePage.isLast()
        );
    }

    @Override
    public PagedResponse<BlogResponseDTO> getMyBlogs(String token, Long id, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());

        User user = getUserFromToken(token);

        Page<Blog> blogPage = blogRepository.findByUserOrderByCreatedAtDesc(user,pageRequest);

        return new PagedResponse<>(
                blogPage.getContent().stream().map(c -> mapToDTO(c, token)).toList(),
                blogPage.getNumber(),
                blogPage.getSize(),
                blogPage.getTotalElements(),
                blogPage.getTotalPages(),
                blogPage.isLast()
        );    }

    @Override
    public PagedResponse<CommentResponseDTO> getComments(String token, Long blogId, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Comment> commentPage = commentRepository.findByBlogIdAndParentCommentIsNull(blogId, pageable);

        List<CommentResponseDTO> comments = commentPage.stream()
                .map(c -> mapCommentToDTO(c, token))
                .toList();

        return new PagedResponse<>(
                comments,
                commentPage.getNumber(),
                commentPage.getSize(),
                commentPage.getTotalElements(),
                commentPage.getTotalPages(),
                commentPage.isLast()
        );
    }

    @Override
    public PagedResponse<CommentResponseDTO> getReplies(String token, Long parentId, int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<Comment> replyPage = commentRepository.findByParentComment_Id(parentId, pageRequest);

        List<CommentResponseDTO> replies = replyPage.stream()
                .map(c -> mapCommentToDTO(c, token))
                .toList();

        return new PagedResponse<>(
                replies,
                replyPage.getNumber(),
                replyPage.getSize(),
                replyPage.getTotalElements(),
                replyPage.getTotalPages(),
                replyPage.isLast()
        );
    }

    private BlogResponseDTO mapToDTO(Blog blog, String token) {
        long likeCount = blogLikeRepository.countByBlogId(blog.getId());
        long commentCount = commentRepository.countByBlogIdAndParentCommentIsNull(blog.getId());

        boolean likedByCurrentUser = false;
        if (token != null && token.startsWith("Bearer ")) {
            Long currentUserId = getCurrentUserId(token);
            likedByCurrentUser = blogLikeRepository
                    .findByBlogIdAndUserId(blog.getId(), currentUserId)
                    .isPresent();
        }

        return BlogResponseDTO.builder()
                .id(blog.getId())
                .userId(blog.getUser().getId())
                .username(blog.getUser().getFirstName())
                .content(blog.getContent())
                .mediaType(blog.getMediaType())
                .mediaUrl(blog.getMediaUrl())
                .createdAt(blog.getCreatedAt())
                .likeCount(likeCount)
                .commentCount(commentCount)
                .likedByCurrentUser(likedByCurrentUser)
                .userRole(blog.getUser().getRole())
                .build();
    }


    private CommentResponseDTO mapCommentToDTO(Comment comment, String token) {
        long likeCount = commentLikeRepository.countByCommentId(comment.getId());

        boolean likedByCurrentUser = false;
        if (token != null && token.startsWith("Bearer ")) {
            Long currentUserId = getCurrentUserId(token);
            likedByCurrentUser = commentLikeRepository
                    .findByCommentIdAndUserId(comment.getId(), currentUserId)
                    .isPresent();
        }

        long replyCount = commentRepository.countByParentCommentId(comment.getId());

        return CommentResponseDTO.builder()
                .id(comment.getId())
                .userId(comment.getUser().getId())
                .username(comment.getUser().getFirstName() + " " + comment.getUser().getLastName())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .likeCount(likeCount)
                .likedByCurrentUser(likedByCurrentUser)
                .replyCount(replyCount)
                .userRole(comment.getUser().getRole())
                .build();
    }

    public Long getCurrentUserId(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Unauthorized: missing or invalid token");
        }
        token = token.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        return userRepository.findUserByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private User getUserFromToken(String bearerToken) {
        String token = bearerToken.substring(7);
        String email = jwtUtils.getEmailFromJwtToken(token);
        return userRepository.findUserByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }
}
