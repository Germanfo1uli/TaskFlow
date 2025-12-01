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
                .route("user-service-docs", r -> r
                        .path("/api/v3/api-docs/**")
                        .filters(f -> f.rewritePath("/api/v3/api-docs/(?<path>.*)", "/v3/api-docs/${path}"))
                        .uri("lb://user-service")
                )
                .build();
    }
}