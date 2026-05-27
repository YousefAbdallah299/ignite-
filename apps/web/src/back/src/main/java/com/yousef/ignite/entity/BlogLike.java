package com.yousef.ignite.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "blog_likes")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BlogLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(
            name = "blog_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_blog_likes_blog",
                    foreignKeyDefinition = "FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE"
            )
    )
    private Blog blog;

    @ManyToOne(optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_blog_likes_user")
    )
    private User user;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
