package com.yousef.ignite.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comment_likes")
@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentLike {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(
            name = "comment_id",
            nullable = false,
            foreignKey = @ForeignKey(
                    name = "fk_comment_likes_comment",
                    foreignKeyDefinition = "FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE CASCADE"
            )
    )
    private Comment comment;

    @ManyToOne(optional = false)
    @JoinColumn(
            name = "user_id",
            nullable = false,
            foreignKey = @ForeignKey(name = "fk_comment_likes_user")
    )
    private User user;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
