package com.example.gateway.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiRoutes {

    @Value("${user.service.url:http://localhost:8081}")
    private String userServiceUrl;

    @Bean
    public RouteLocator swaggerRouteLocator(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("user-service-swagger-ui", r -> r
                        .path("/api/swagger-ui/**")
                        .filters(f -> f.rewritePath("/api/swagger-ui/(?<path>.*)", "/swagger-ui/${path}"))
                        .uri("lb://user-service")
                )
                .route("user-service-docs-with-prefix", r -> r
                        .path("/api/v3/api-docs/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://user-service")
                )
                .route("user-service-docs-root", r -> r
                        .path("/v3/api-docs", "/v3/api-docs/**")
                        .uri("lb://user-service")
                )
                .route("user-service-swagger-resources", r -> r
                        .path("/api/webjars/**", "/api/swagger-resources/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("lb://user-service")
                )
                .build();
    }
}