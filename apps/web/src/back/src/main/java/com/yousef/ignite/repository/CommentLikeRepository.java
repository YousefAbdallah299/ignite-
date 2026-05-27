package com.yousef.ignite.repository;

import com.yousef.ignite.entity.CommentLike;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface CommentLikeRepository extends JpaRepository<CommentLike, Long> {
    Optional<CommentLike> findByCommentIdAndUserId(Long commentId, Long userId);
    long countByCommentId(Long commentId);
    Page<CommentLike> findByCommentId(Long commentId, Pageable pageable);

    @Modifying
    @Transactional
    @Query("DELETE FROM CommentLike cl WHERE cl.comment.blog.id = :blogId")
    void deleteByBlogId(@Param("blogId") Long blogId);

    @Modifying
    @Transactional
    @Query("DELETE FROM CommentLike cl WHERE cl.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
