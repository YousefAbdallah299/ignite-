package com.yousef.ignite.repository;

import com.yousef.ignite.dto.enums.UserRole;
import com.yousef.ignite.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmail(String email);

    Optional<User> findUserByEmail(String email);

    Optional<User> findUserByVerificationToken(String token);

    Optional<User> findUserByResetPasswordToken(String token);

    @Query("""
        SELECT u FROM User u 
        WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :emailPart, '%'))
    """)
    Page<User> searchByEmail(@Param("emailPart") String emailPart, Pageable pageable);


    @Query("""
    SELECT u 
    FROM User u 
    WHERE 
      (:lastName IS NULL AND (
          LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR 
          LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
      ))
      OR (:lastName IS NOT NULL AND 
          LOWER(u.firstName) LIKE LOWER(CONCAT('%', :firstName, '%')) AND
          LOWER(u.lastName) LIKE LOWER(CONCAT('%', :lastName, '%'))
      )
""")
    Page<User> searchByName(
            @Param("query") String query,
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            Pageable pageable
    );

    @Query("""
    SELECT u 
    FROM User u 
    WHERE u.role = :role AND (
      (:lastName IS NULL AND (
          LOWER(u.firstName) LIKE LOWER(CONCAT('%', :query, '%')) OR 
          LOWER(u.lastName) LIKE LOWER(CONCAT('%', :query, '%'))
      ))
      OR (:lastName IS NOT NULL AND 
          LOWER(u.firstName) LIKE LOWER(CONCAT('%', :firstName, '%')) AND
          LOWER(u.lastName) LIKE LOWER(CONCAT('%', :lastName, '%'))
      )
    )
""")
    Page<User> searchByRoleAndName(
            @Param("role") UserRole role,
            @Param("query") String query,
            @Param("firstName") String firstName,
            @Param("lastName") String lastName,
            Pageable pageable
    );

    @Query("""
            SELECT u FROM User u
            WHERE u.role = :role
            AND LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%'))
            """)
    Page<User> searchByRoleAndEmail(UserRole role, String email, Pageable pageable);


    Page<User> findByRole(UserRole role, Pageable pageable);

}
