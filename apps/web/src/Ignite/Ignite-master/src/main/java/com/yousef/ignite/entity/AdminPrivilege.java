package com.yousef.ignite.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admin_privileges")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPrivilege {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String privilegeName; // e.g., "MANAGE_COURSES", "MANAGE_USERS", "MANAGE_WORKSHOPS", "RATE_SKILLS"

    @Column(nullable = false)
    private Boolean enabled = true;
}

