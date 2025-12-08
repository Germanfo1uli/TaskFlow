package com.example.issueservice.security;

import com.example.issueservice.config.SecurityWhiteList;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@Slf4j
public class GatewayAuthFilter extends OncePerRequestFilter {
    // фильтр нужен, чтобы проверить, откуда идет запрос и является ли эндпоинт публичным путем
    // запрос всегда (только если не публичный эндпоинт) должен идти от гейтвея и ниоткуда более
    // проверка осуществляется передачей header'а с secret key в запросе

    // также фильтр парсит остальные хедеры и маппит их в principal (userId, role, email)
    // эти данные затем используются контроллерами

    @Value("${gateway.secret.header.name}")
    private String gatewaySecretHeader;

    @Value("${gateway.secret.value:default-secret}")
    private String expectedSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws IOException, ServletException {

        String path = request.getServletPath();
        String method = request.getMethod();
        String clientIp = request.getRemoteAddr();

        String gatewaySource = request.getHeader(gatewaySecretHeader);
        String userId = request.getHeader("X-User-Id");
        String role = request.getHeader("X-User-Role");
        String email = request.getHeader("X-User-Email");
        String sourceService = request.getHeader("X-Source-Service");

        String requestSource = sourceService != null ? sourceService :
                (gatewaySource != null ? "gateway" : "direct-call");

        log.info("Incoming {} {} from IP: {}, Source: {}", method, path, clientIp, requestSource);

        // пропуск публичных эндпоинтов
        if (isPublicEndpoint(path)) {
            log.debug("Public endpoint accessed: {}", path);
            chain.doFilter(request, response);
            return;
        }

        // проверка secret header
        if (!expectedSecret.equals(gatewaySource)) {
            log.warn("UNAUTHORIZED: Invalid secret for {} {} from IP: {}", method, path, clientIp);
            sendUnauthorized(response, "Invalid gateway secret");
            return;
        }

        // определение Gateway/Internal запроса
        if (userId != null && role != null && !userId.isBlank() && !role.isBlank()) {
            // Gateway запрос (JwtUser сущность)
            try {
                JwtUser principal = new JwtUser(Long.parseLong(userId), role, email);
                setAuthentication(principal);
                log.debug("Authenticated USER: {} ({}), path: {}", userId, role, path);
            } catch (NumberFormatException e) {
                log.error("Invalid format: userId='{}' for {} {}", userId, method, path);
                sendUnauthorized(response, "Invalid user ID format");
                return;
            }
        } else {
            // Internal запрос (SystemPrincipal сущность)
            String serviceName = sourceService != null ? sourceService : "unknown-service";
            SystemPrincipal principal = new SystemPrincipal(serviceName);
            setAuthentication(principal);
            log.debug("Authenticated SERVICE: {}, path: {}", serviceName, path);
        }

        chain.doFilter(request, response);
    }

    private void setAuthentication(Object principal) {
        UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                principal, null,
                principal instanceof JwtUser ?
                        ((JwtUser) principal).getAuthorities() :
                        ((SystemPrincipal) principal).getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
    }

    // метод для быстрой отправки ответа 401
    private void sendUnauthorized(HttpServletResponse response, String message) throws IOException {
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType("application/json");
        response.getWriter().write(
                String.format("{\"timestamp\":%d,\"status\":401,\"error\":\"%s\"}",
                        System.currentTimeMillis(), message)
        );
    }

    // проверка на публичные эндпоинты
    private boolean isPublicEndpoint(String path) {
        return SecurityWhiteList.PUBLIC_ENDPOINTS.stream()
                .anyMatch(pattern -> {
                    if (pattern.endsWith("/**")) {
                        return path.startsWith(pattern.replace("/**", ""));
                    }
                    return path.equals(pattern) || path.matches(pattern.replace("*", ".*"));
                });
    }
}