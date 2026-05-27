package com.yousef.ignite.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Simple in-memory IP rate limiter.
 * Note: for multi-instance deployments, use a shared store (e.g. Redis).
 */
public class RateLimitFilter extends OncePerRequestFilter {

    private enum KeyMode {
        IP_ONLY,
        IP_AND_AUTH_TOKEN
    }

    private record Rule(
            String id,
            String pathPrefix,
            String method,
            int maxRequests,
            Duration window,
            KeyMode keyMode
    ) {}

    private static final List<Rule> RULES = List.of(
            // Auth write routes: very tight
            new Rule("auth-login", "/api/v1/auth/login", "POST", 5, Duration.ofMinutes(15), KeyMode.IP_ONLY),
            new Rule("auth-send-otp", "/api/v1/auth/send-phone-otp", "POST", 5, Duration.ofMinutes(15), KeyMode.IP_ONLY),
            new Rule("auth-verify-otp", "/api/v1/auth/verify-phone-otp", "POST", 10, Duration.ofMinutes(15), KeyMode.IP_ONLY),
            new Rule("auth-register", "/api/v1/auth/register", "POST", 3, Duration.ofMinutes(15), KeyMode.IP_ONLY),
            new Rule("auth-register-candidate", "/api/v1/auth/register-candidate-with-resume", "POST", 3, Duration.ofMinutes(15), KeyMode.IP_ONLY),
            new Rule("auth-forgot-password", "/api/v1/auth/forgot-password", "POST", 5, Duration.ofMinutes(15), KeyMode.IP_ONLY),
            // Fallback for other auth POST routes
            new Rule("auth-post-fallback", "/api/v1/auth/", "POST", 20, Duration.ofMinutes(15), KeyMode.IP_ONLY),

            // Public read routes: moderate
            new Rule("public-jobs", "/api/v1/jobs", "GET", 180, Duration.ofMinutes(1), KeyMode.IP_ONLY),
            new Rule("public-courses", "/api/v1/courses", "GET", 180, Duration.ofMinutes(1), KeyMode.IP_ONLY),
            new Rule("public-blogs", "/api/v1/blogs", "GET", 180, Duration.ofMinutes(1), KeyMode.IP_ONLY),
            new Rule("public-ads", "/api/v1/ads/active", "GET", 120, Duration.ofMinutes(1), KeyMode.IP_ONLY),
            new Rule("public-settings", "/api/v1/settings", "GET", 120, Duration.ofMinutes(1), KeyMode.IP_ONLY),
            new Rule("public-uploads", "/uploads/", "GET", 240, Duration.ofMinutes(1), KeyMode.IP_ONLY),

            // Payment webhooks/callbacks: strict
            new Rule("payment-webhook-post", "/api/v1/payments/webhook", "POST", 60, Duration.ofMinutes(1), KeyMode.IP_ONLY),
            new Rule("payment-webhook-get", "/api/v1/payments/webhook", "GET", 30, Duration.ofMinutes(1), KeyMode.IP_ONLY),
            new Rule("payment-callback", "/api/v1/payments/callback", "GET", 120, Duration.ofMinutes(1), KeyMode.IP_ONLY)
    );

    private static class Bucket {
        final AtomicInteger count = new AtomicInteger(0);
        volatile long resetAtEpochMillis;
    }

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        String requestPath = request.getRequestURI();
        String method = request.getMethod();
        String ip = getClientIp(request);
        String authHeader = request.getHeader("Authorization");
        boolean isApiPath = requestPath.startsWith("/api/v1/");

        for (Rule rule : RULES) {
            if (!requestPath.startsWith(rule.pathPrefix())) continue;
            if (!method.equalsIgnoreCase(rule.method())) continue;

            String bucketKey = buildBucketKey(rule, ip, requestPath, authHeader);
            Bucket bucket = buckets.computeIfAbsent(bucketKey, k -> new Bucket());

            long now = System.currentTimeMillis();
            long windowMillis = rule.window().toMillis();

            // Reset bucket if window elapsed
            if (now > bucket.resetAtEpochMillis) {
                bucket.resetAtEpochMillis = now + windowMillis;
                bucket.count.set(0);
            }

            int current = bucket.count.incrementAndGet();
            if (current > rule.maxRequests()) {
                long retryAfterSeconds = Math.max(1, (bucket.resetAtEpochMillis - now) / 1000);
                response.setStatus(429);
                response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
                response.setContentType("application/json");
                response.getWriter().write("{\"message\":\"Too many requests. Please try again later.\"}");
                return;
            }
        }

        // Authenticated user routes: medium (keyed by IP + auth token when available)
        if (isApiPath &&
                !requestPath.startsWith("/api/v1/auth/") &&
                !requestPath.startsWith("/api/v1/jobs") &&
                !requestPath.startsWith("/api/v1/courses") &&
                !requestPath.startsWith("/api/v1/blogs") &&
                !requestPath.startsWith("/api/v1/ads/active") &&
                !requestPath.startsWith("/api/v1/settings") &&
                authHeader != null && authHeader.startsWith("Bearer ")) {
            enforceAuthenticatedRouteLimit(ip, requestPath, authHeader, response);
            if (response.isCommitted()) {
                return;
            }
        }

        filterChain.doFilter(request, response);
    }

    private String buildBucketKey(Rule rule, String ip, String requestPath, String authHeader) {
        if (rule.keyMode() == KeyMode.IP_AND_AUTH_TOKEN) {
            return ip + ":" + rule.id() + ":" + requestPath + ":" + sanitizeAuthToken(authHeader);
        }
        return ip + ":" + rule.id() + ":" + requestPath;
    }

    private void enforceAuthenticatedRouteLimit(
            String ip,
            String requestPath,
            String authHeader,
            HttpServletResponse response
    ) throws IOException {
        String key = ip + ":auth-user-route:" + requestPath + ":" + sanitizeAuthToken(authHeader);
        Bucket bucket = buckets.computeIfAbsent(key, k -> new Bucket());
        long now = System.currentTimeMillis();
        long windowMillis = Duration.ofMinutes(5).toMillis();

        if (now > bucket.resetAtEpochMillis) {
            bucket.resetAtEpochMillis = now + windowMillis;
            bucket.count.set(0);
        }

        int current = bucket.count.incrementAndGet();
        if (current > 300) {
            long retryAfterSeconds = Math.max(1, (bucket.resetAtEpochMillis - now) / 1000);
            response.setStatus(429);
            response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
            response.setContentType("application/json");
            response.getWriter().write("{\"message\":\"Too many requests. Please try again later.\"}");
        }
    }

    private String sanitizeAuthToken(String authHeader) {
        if (authHeader == null) return "anonymous";
        // Don't keep full token in memory key.
        int len = authHeader.length();
        return len <= 16 ? authHeader : authHeader.substring(len - 16);
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            // XFF can contain multiple IPs: client, proxy1, proxy2...
            return xff.split(",")[0].trim();
        }
        String xri = request.getHeader("X-Real-IP");
        if (xri != null && !xri.isBlank()) return xri.trim();
        return request.getRemoteAddr();
    }
}

