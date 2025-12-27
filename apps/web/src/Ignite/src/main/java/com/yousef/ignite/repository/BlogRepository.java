package com.yousef.ignite.repository;

import com.yousef.ignite.entity.Blog;
import com.yousef.ignite.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BlogRepository extends JpaRepository<Blog, Long> {
    Page<Blog> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT b.id, COUNT(l.id) FROM Blog b LEFT JOIN b.likes l WHERE b.id IN :blogIds GROUP BY b.id")
    List<Object[]> getLikeCountsForBlogs(List<Long> blogIds);

    @Query("SELECT b.id, COUNT(c.id) FROM Blog b LEFT JOIN b.comments c WHERE b.id IN :blogIds AND c.parentComment IS NULL GROUP BY b.id")
    List<Object[]> getCommentCountsForBlogs(List<Long> blogIds);

    Page<Blog> findByUserOrderByCreatedAtDesc(User user, Pageable pageable);


}
