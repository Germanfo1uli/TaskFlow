package com.example.issueservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class InternalAuthInterceptor implements RequestInterceptor {
    @Value("${gateway.secret.header.name:X-Gateway-Source}")
    private String gatewaySecretHeader;

    @Value("${gateway.secret.value:default-secret}")
    private String gatewaySecretValue;

    @Value("${spring.application.name:unknown-service}")
    private String applicationName;

    @Override
    public void apply(RequestTemplate template) {
        template.header(gatewaySecretHeader, gatewaySecretValue);

        template.header("X-Source-Service", applicationName);

        template.removeHeader("X-User-Id");
        template.removeHeader("X-User-Role");
        template.removeHeader("X-User-Email");
        template.removeHeader("Authorization");

        log.debug("Prepared Feign request to {} with service auth headers", template.url());
    }
}
