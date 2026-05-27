package com.yousef.ignite.dto.response;

import com.yousef.ignite.dto.enums.UserRole;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CommentResponseDTO {
    private Long id;
    private Long userId;
    private String username;
    private String content;
    private LocalDateTime createdAt;
    private long likeCount;
    private boolean likedByCurrentUser;
    private long replyCount;
    private UserRole userRole;
}
