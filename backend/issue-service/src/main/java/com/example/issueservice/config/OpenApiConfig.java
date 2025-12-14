package com.example.issueservice.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.context.annotation.Configuration;

@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Issue Service API",
                version = "1.0",
                description = "API для управления задачами в проектах"
        ),
        servers = {
                @Server(url = "http://localhost:8000", description = "Local Development"),
                @Server(url = "${RASPBERRY_PI_URL:http://26.35.172.29:8000}", description = "Raspberry Pi Network")
        }
)
@SecurityScheme(
        name = "bearerAuth",
        type = SecuritySchemeType.HTTP,
        scheme = "bearer",
        bearerFormat = "JWT",
        description = "Введите JWT токен:"
)
public class OpenApiConfig {
}