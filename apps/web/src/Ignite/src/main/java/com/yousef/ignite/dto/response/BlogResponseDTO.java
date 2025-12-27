package com.yousef.ignite.dto.response;

import com.yousef.ignite.dto.enums.MediaType;
import com.yousef.ignite.dto.enums.UserRole;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BlogResponseDTO {
    private Long id;
    private Long userId;
    private String username;
    private String content;
    private MediaType mediaType;
    private String mediaUrl;
    private LocalDateTime createdAt;
    private long likeCount;
    private long commentCount;
    private Boolean likedByCurrentUser;
    private UserRole userRole;

}
