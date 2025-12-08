package com.example.boardservice.client;

import com.example.boardservice.config.UserServiceClientConfig;
import com.example.boardservice.dto.response.PublicProfileResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(
        name = "user-service",
        path = "api/internal",
        configuration = UserServiceClientConfig.class
)
public interface UserServiceClient {

    @GetMapping("/users/{userId}")
    PublicProfileResponse getProfileById(@PathVariable Long userId);
}