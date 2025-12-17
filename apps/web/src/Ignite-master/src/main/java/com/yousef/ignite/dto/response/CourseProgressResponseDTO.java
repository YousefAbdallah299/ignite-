package com.yousef.ignite.dto.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class CourseProgressResponseDTO {
    private Long courseId;
    private Double completionPercentage;
    private Set<Long> completedLessonIds;
    private LocalDateTime lastUpdated;
}

