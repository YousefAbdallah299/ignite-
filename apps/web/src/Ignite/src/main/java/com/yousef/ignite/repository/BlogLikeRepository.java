package com.yousef.ignite.repository;

import com.yousef.ignite.entity.BlogLike;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface BlogLikeRepository extends JpaRepository<BlogLike, Long> {
    Optional<BlogLike> findByBlogIdAndUserId(Long blogId, Long userId);
    long countByBlogId(Long blogId);
    Page<BlogLike> findByBlogId(Long blogId, Pageable pageable);

    @Modifying
    @Transactional
    @Query("DELETE FROM BlogLike bl WHERE bl.blog.id = :blogId")
    void deleteByBlogId(@Param("blogId") Long blogId);

    @Modifying
    @Transactional
    @Query("DELETE FROM BlogLike bl WHERE bl.user.id = :userId")
    void deleteByUserId(@Param("userId") Long userId);
}
