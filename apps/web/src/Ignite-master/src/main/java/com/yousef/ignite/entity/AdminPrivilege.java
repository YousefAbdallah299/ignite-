package com.yousef.ignite.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "admin_privileges")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminPrivilege {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    // Privilege flags for different admin panel sections
    @Column(nullable = false)
    private Boolean canManageCourses = false;

    @Column(nullable = false)
    private Boolean canManageUsers = false;

    @Column(nullable = false)
    private Boolean canRateSkills = false;

    @Column(nullable = false)
    private Boolean canManageWorkshops = false;

    @Column(nullable = false)
    private Boolean canManageCustomAdmins = false; // Only full admins can manage custom admins
}

