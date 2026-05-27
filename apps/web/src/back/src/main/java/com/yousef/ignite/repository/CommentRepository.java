package com.yousef.ignite.repository;

import com.yousef.ignite.entity.Comment;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    Page<Comment> findByBlogIdAndParentCommentIsNull(Long blogId, Pageable pageable);
    long countByBlogIdAndParentCommentIsNull(Long blogId);
    Page<Comment> findByParentComment_Id(Long Id, Pageable pageable);
    long countByParentCommentId(Long parentId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Comment c WHERE c.blog.id = :blogId")
    void deleteByBlogId(@Param("blogId") Long blogId);

    @Modifying
    @Transactional
    @Query("DELETE FROM Comment c WHERE c.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
