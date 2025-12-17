package com.yousef.ignite.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "comments")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(
            name = "blog_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_comments_blog",
                    foreignKeyDefinition = "FOREIGN KEY (blog_id) REFERENCES blogs(id) ON DELETE CASCADE"
            )
    )
    private Blog blog;

    @ManyToOne(optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_comments_user")
    )
    private User user;

    @ManyToOne
    @JoinColumn(
            name = "parent_comment_id",
            foreignKey = @ForeignKey(
                    name = "fk_comments_parent",
                    foreignKeyDefinition = "FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE CASCADE"
            )
    )
    private Comment parentComment;

    @OneToMany(mappedBy = "parentComment", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<Comment> replies = new HashSet<>();

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;


    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "comment", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<CommentLike> likes = new HashSet<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

}
