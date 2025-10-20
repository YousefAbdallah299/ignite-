# Quick Fix Guide - Critical Security Issues

## 1. Environment Variables Setup (DO THIS FIRST!)

### Create `.env` file in project root:
```bash
# JWT Configuration
JWT_SECRET=your-new-super-secure-random-256-bit-secret-key-change-this
JWT_EXPIRATION_MS=1800000

# Database Configuration
DB_URL=jdbc:postgresql://localhost:5432/ignite
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password

# Mail Configuration
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-specific-password

# Paymob Configuration
PAYMOB_API_BASE=https://accept.paymob.com/api
PAYMOB_API_KEY=your-new-paymob-key
PAYMOB_INTEGRATION_ID=5352652
PAYMOB_IFRAME_ID=967648
PAYMOB_WEBHOOK_SECRET=your-new-webhook-secret

# H2 Console (disable in production)
H2_CONSOLE_ENABLED=false

# Environment
SPRING_PROFILES_ACTIVE=production
```

### Update `application.properties`:
```properties
spring.application.name=Ignite

# JWT from environment
app.jwt.expiration.ms=${JWT_EXPIRATION_MS}
app.jwt.secret=${JWT_SECRET}

server.port=8080

# H2 Console - disabled by default
spring.h2.console.enabled=${H2_CONSOLE_ENABLED:false}
spring.h2.console.path=/h2-console

# Database from environment
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.datasource.driver-class-name=org.postgresql.Driver
spring.jpa.hibernate.ddl-auto=validate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect

# Mail from environment
spring.mail.host=${MAIL_HOST}
spring.mail.port=${MAIL_PORT}
spring.mail.username=${MAIL_USERNAME}
spring.mail.password=${MAIL_PASSWORD}
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true

# Logging - INFO in production
logging.level.org.hibernate.SQL=${LOG_LEVEL_SQL:INFO}
logging.level.org.hibernate.type.descriptor.sql=${LOG_LEVEL_TYPE:INFO}

# File upload - reduced size
spring.servlet.multipart.max-file-size=10MB
spring.servlet.multipart.max-request-size=10MB

# Paymob from environment
paymob.api.base=${PAYMOB_API_BASE}
paymob.api.key=${PAYMOB_API_KEY}
paymob.integration.id=${PAYMOB_INTEGRATION_ID}
paymob.iframe.id=${PAYMOB_IFRAME_ID}
paymob.webhook.secret=${PAYMOB_WEBHOOK_SECRET}
```

### Add to `.gitignore`:
```gitignore
.env
.env.*
!.env.example
application-local.properties
```

### Create `.env.example` (safe to commit):
```bash
JWT_SECRET=change-me
JWT_EXPIRATION_MS=1800000
DB_URL=jdbc:postgresql://localhost:5432/ignite
# ... etc (no actual secrets)
```

---

## 2. File Upload Validation

### Create `FileUploadUtil.java`:
```java
package com.yousef.ignite.util;

import org.springframework.web.multipart.MultipartFile;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

public class FileUploadUtil {
    
    private static final List<String> ALLOWED_IMAGE_TYPES = Arrays.asList(
        "image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"
    );
    
    private static final List<String> ALLOWED_VIDEO_TYPES = Arrays.asList(
        "video/mp4", "video/webm", "video/ogg"
    );
    
    private static final long MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final long MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
    
    public static void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        String contentType = file.getContentType();
        if (!ALLOWED_IMAGE_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Only JPEG, PNG, GIF, WEBP allowed");
        }
        
        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new IllegalArgumentException("File too large. Maximum size is 5MB");
        }
        
        // Check for null bytes (potential path traversal)
        if (file.getOriginalFilename().contains("\0")) {
            throw new IllegalArgumentException("Invalid filename");
        }
    }
    
    public static void validateVideoFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        
        String contentType = file.getContentType();
        if (!ALLOWED_VIDEO_TYPES.contains(contentType)) {
            throw new IllegalArgumentException("Invalid file type. Only MP4, WEBM, OGG allowed");
        }
        
        if (file.getSize() > MAX_VIDEO_SIZE) {
            throw new IllegalArgumentException("File too large. Maximum size is 50MB");
        }
        
        if (file.getOriginalFilename().contains("\0")) {
            throw new IllegalArgumentException("Invalid filename");
        }
    }
    
    public static String sanitizeFilename(String originalFilename) {
        // Remove path separators and generate safe name
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            // Only allow alphanumeric in extension
            extension = extension.replaceAll("[^a-zA-Z0-9.]", "");
        }
        return UUID.randomUUID().toString() + extension;
    }
}
```

### Update `BlogServiceImpl.java`:
```java
@Override
@Transactional
public BlogResponseDTO createBlog(String token, String content, MediaType mediaType, MultipartFile file) {
    token = token.substring(7);
    String loggedInUserEmail = jwtUtils.getEmailFromJwtToken(token);

    User user = userRepository.findUserByEmail(loggedInUserEmail)
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));

    String fileUrl = null;

    try {
        if (file != null && !file.isEmpty()) {
            // ✅ Validate file based on type
            if (mediaType == MediaType.IMAGE) {
                FileUploadUtil.validateImageFile(file);
            } else if (mediaType == MediaType.VIDEO) {
                FileUploadUtil.validateVideoFile(file);
            }
            
            String uploadDir = "uploads/";
            File dir = new File(uploadDir);
            if (!dir.exists()) dir.mkdirs();

            // ✅ Use sanitized filename
            String fileName = FileUploadUtil.sanitizeFilename(file.getOriginalFilename());
            Path filePath = Path.of(uploadDir + fileName);

            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            fileUrl = "/uploads/" + fileName;
        }
        
        // ... rest of the code
    } catch (IOException e) {
        throw new RuntimeException("Failed to upload file", e);
    }
}
```

---

## 3. Fix CORS Configuration

### Update all controller annotations:
```java
// ❌ REMOVE THIS:
@CrossOrigin(origins = "*", maxAge = 3600)

// ✅ USE CENTRALIZED CONFIG INSTEAD (already in WebSecurityConfig)
```

### Update `WebSecurityConfig.java`:
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    
    // ✅ Only allow specific origins
    String allowedOrigins = System.getenv("ALLOWED_ORIGINS");
    if (allowedOrigins != null) {
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
    } else {
        // Development fallback
        configuration.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000", 
            "http://localhost:4000"
        ));
    }
    
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

### Add to `.env`:
```bash
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

---

## 4. Add Rate Limiting

### Add dependencies to `pom.xml`:
```xml
<dependency>
    <groupId>com.github.vladimir-bukhtoyarov</groupId>
    <artifactId>bucket4j-core</artifactId>
    <version>8.1.0</version>
</dependency>
```

### Create `RateLimitingFilter.java`:
```java
package com.yousef.ignite.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter implements Filter {

    private final Map<String, Bucket> cache = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletRequest httpRequest = (HttpServletRequest) request;
        String key = getClientIP(httpRequest);
        
        Bucket bucket = cache.computeIfAbsent(key, k -> createNewBucket());
        
        if (bucket.tryConsume(1)) {
            chain.doFilter(request, response);
        } else {
            HttpServletResponse httpResponse = (HttpServletResponse) response;
            httpResponse.setStatus(429); // Too Many Requests
            httpResponse.getWriter().write("Too many requests. Please try again later.");
        }
    }

    private Bucket createNewBucket() {
        // Allow 100 requests per minute
        Bandwidth limit = Bandwidth.classic(100, Refill.intervally(100, Duration.ofMinutes(1)));
        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    private String getClientIP(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0];
    }
}
```

---

## 5. Fix N+1 Query Problems

### Update `CandidateAppliedJobRepository.java`:
```java
package com.yousef.ignite.repository;

import com.yousef.ignite.entity.CandidateAppliedJob;
import com.yousef.ignite.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface CandidateAppliedJobRepository extends JpaRepository<CandidateAppliedJob, Long> {
    
    // ✅ Fetch candidate and user data in single query
    @Query("SELECT ca FROM CandidateAppliedJob ca " +
           "JOIN FETCH ca.candidate c " +
           "JOIN FETCH c.user " +
           "WHERE ca.job = :job")
    List<CandidateAppliedJob> findByJobWithCandidateAndUser(@Param("job") Job job);
    
    boolean existsByCandidateAndJob(CandidateProfile candidate, Job job);
}
```

### Update `JobServiceImpl.java`:
```java
@Override
public List<JobApplicationResponseDTO> getJobApplications(String token, Long jobId) {
    // ... authentication code ...

    // ✅ Use optimized query
    List<CandidateAppliedJob> applications = 
        candidateAppliedJobRepository.findByJobWithCandidateAndUser(job);

    return applications.stream()
            .map(this::mapToJobApplicationDTO)
            .toList();
}
```

---

## 6. Add Database Indexes

### Update `User.java`:
```java
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_user_email", columnList = "email", unique = true),
    @Index(name = "idx_user_verification_token", columnList = "verificationToken")
})
public class User {
    // ... fields ...
}
```

### Update `Job.java`:
```java
@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_job_title", columnList = "title"),
    @Index(name = "idx_job_created_at", columnList = "createdAt"),
    @Index(name = "idx_job_location", columnList = "location")
})
public class Job {
    // ... fields ...
}
```

### Update `CandidateAppliedJob.java`:
```java
@Entity
@Table(name = "candidate_applied_jobs", indexes = {
    @Index(name = "idx_applied_job", columnList = "job_id"),
    @Index(name = "idx_applied_candidate", columnList = "candidate_id"),
    @Index(name = "idx_applied_created", columnList = "created_at")
})
public class CandidateAppliedJob {
    // ... fields ...
}
```

---

## 7. Setup PostgreSQL (Production Database)

### Docker Compose (`docker-compose.yml`):
```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    container_name: ignite-db
    environment:
      POSTGRES_DB: ignite
      POSTGRES_USER: ignite_user
      POSTGRES_PASSWORD: your_secure_password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### Add to `pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

### Run migrations:
```bash
# Start PostgreSQL
docker-compose up -d

# Application will create tables on first run
# Consider using Flyway or Liquibase for production migrations
```

---

## 8. Frontend Security Improvements

### Create `secureStorage.js`:
```javascript
// Instead of localStorage, use sessionStorage (cleared on tab close)
// Or implement httpOnly cookies (best option)

export const SecureStorage = {
  setToken: (token) => {
    // Option 1: SessionStorage (better than localStorage)
    sessionStorage.setItem('authToken', token);
    
    // Option 2: Set as httpOnly cookie (backend needed)
    // This is the most secure option
  },
  
  getToken: () => {
    return sessionStorage.getItem('authToken');
  },
  
  removeToken: () => {
    sessionStorage.removeItem('authToken');
  }
};
```

### Remove console.logs for production:
```javascript
// Create logger utility
const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (...args) => isDevelopment && console.log(...args),
  error: (...args) => isDevelopment && console.error(...args),
  warn: (...args) => isDevelopment && console.warn(...args),
};

// Replace all console.log with logger.log
logger.log('API call to:', url);  // Only logs in development
```

---

## 9. Enable Email Verification

### Update `AuthServiceImpl.java`:
```java
@Override
public LoginResponseDTO login(LoginRequestDTO loginRequestDTO) {
    // ... authentication code ...

    // ✅ Re-enable email verification
    if (!user.isEnabled()) {
        throw new UnverifiedEmailException("Please verify your email before logging in.");
    }

    return LoginResponseDTO.builder()
            .token(jwt)
            .message("Login Success!")
            .httpStatus(HttpStatus.ACCEPTED)
            .tokenType("Bearer")
            .role(user.getRole())
            .build();
}
```

---

## 10. Deployment Checklist

### Before deploying:

```bash
# 1. Run security audit
./mvnw dependency-check:check

# 2. Run tests
./mvnw test

# 3. Build for production
./mvnw clean package -DskipTests

# 4. Create production .env file
cp .env.example .env.production
# Edit with production values

# 5. Run with production profile
java -jar -Dspring.profiles.active=production target/ignite.jar

# 6. Setup SSL/TLS certificate (Let's Encrypt)
# 7. Configure reverse proxy (Nginx)
# 8. Setup monitoring (Prometheus + Grafana)
# 9. Configure automated backups
# 10. Setup CI/CD pipeline
```

---

## Quick Command Reference

```bash
# Generate new JWT secret
openssl rand -base64 32

# Check for vulnerabilities
./mvnw dependency-check:check

# Run with specific profile
./mvnw spring-boot:run -Dspring-boot.run.profiles=production

# Database migration (if using Flyway)
./mvnw flyway:migrate

# Build Docker image
docker build -t ignite-app .

# Run with Docker
docker-compose up -d
```

---

## Support Resources

- Spring Security: https://spring.io/projects/spring-security
- OWASP Top 10: https://owasp.org/www-project-top-ten/
- JWT Best Practices: https://tools.ietf.org/html/rfc8725
- React Security: https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml


