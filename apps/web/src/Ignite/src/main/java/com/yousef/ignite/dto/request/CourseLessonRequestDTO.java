package com.yousef.ignite.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseLessonRequestDTO {
    private String title;
    private String content;
    private String videoUrl;
    private String imageUrl;
}
