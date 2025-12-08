package com.example.boardservice.config;

import feign.Request;
import feign.Retryer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class UserServiceClientConfig {
    @Bean
    public InternalAuthInterceptor interServiceAuthInterceptor() {
        return new InternalAuthInterceptor();
    }

    @Bean
    public Request.Options feignOptions() {
        return new Request.Options(
                3000,
                10000
        );
    }

    @Bean
    public Retryer feignRetryer() {
        return new Retryer.Default(100, 1000, 3);
    }
}