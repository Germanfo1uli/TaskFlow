package com.example.boardservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserServiceClientConfig {

    @Bean
    public InternalAuthInterceptor interServiceAuthInterceptor() {
        return new InternalAuthInterceptor();
    }
}
