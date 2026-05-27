package com.yousef.ignite.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "course_lessons")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CourseLesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title; // lesson name

    @Column(length = 2000)
    private String content; // optional text content

    private String videoUrl; // optional video

    private String imageUrl;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "section_id", nullable = false)
    private CourseSection section;
}
