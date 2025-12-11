package com.example.gateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiRoutes {

    @Bean
    public RouteLocator apiDocsRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                // Gateway swagger
                .route("user-service-docs", r -> r
                        .path("/v3/api-docs/user-service")
                        .filters(f -> f.rewritePath("/v3/api-docs/user-service", "/v3/api-docs"))
                        .uri("lb://user-service"))
                .route("board-service-docs", r -> r
                        .path("/v3/api-docs/board-service")
                        .filters(f -> f.rewritePath("/v3/api-docs/board-service", "/v3/api-docs"))
                        .uri("lb://board-service"))
                .route("issue-service-docs", r -> r
                        .path("/v3/api-docs/issue-service")
                        .filters(f -> f.rewritePath("/v3/api-docs/issue-service", "/v3/api-docs"))
                        .uri("lb://issue-service"))
                // Individual swaggers
                .route("user-service-swagger", r -> r
                        .path("/api/user/swagger-ui/**")
                        .filters(f -> f.rewritePath("/api/user/swagger-ui/(?<path>.*)", "/swagger-ui/${path}"))
                        .uri("lb://user-service"))
                .route("board-service-swagger", r -> r
                        .path("/api/board/swagger-ui/**")
                        .filters(f -> f.rewritePath("/api/board/swagger-ui/(?<path>.*)", "/swagger-ui/${path}"))
                        .uri("lb://board-service"))
                .route("issue-service-swagger", r -> r
                        .path("/api/issue/swagger-ui/**")
                        .filters(f -> f.rewritePath("/api/issue/swagger-ui/(?<path>.*)", "/swagger-ui/${path}"))
                        .uri("lb://issue-service"))
                .build();
    }
}