package com.yousef.ignite.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admin_privileges", 
       uniqueConstraints = @UniqueConstraint(name = "uk_user_privilege", columnNames = {"user_id", "privilege_name"}))
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

    @Column(name = "privilege_name", nullable = false)
    private String privilegeName; // e.g., "MANAGE_COURSES", "MANAGE_USERS", "MANAGE_WORKSHOPS", "RATE_SKILLS"

    @Column(nullable = false)
    @Builder.Default
    private Boolean enabled = true;
    
    // Legacy columns - set to false by default if they exist in the database
    @Column(name = "can_manage_courses", nullable = true, insertable = false, updatable = false)
    private Boolean canManageCourses;
    
    @Column(name = "can_manage_users", nullable = true, insertable = false, updatable = false)
    private Boolean canManageUsers;
    
    @Column(name = "can_manage_workshops", nullable = true, insertable = false, updatable = false)
    private Boolean canManageWorkshops;
    
    @Column(name = "can_rate_skills", nullable = true, insertable = false, updatable = false)
    private Boolean canRateSkills;
}

