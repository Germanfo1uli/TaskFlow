package com.example.issueservice.client;

import com.example.issueservice.dto.data.UserBatchRequest;
import com.example.issueservice.dto.response.PublicProfileResponse;
import com.example.issueservice.config.ClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(
        name = "user-service",
        path = "api/internal",
        configuration = ClientConfig.class
)
public interface UserServiceClient {

    @GetMapping("/users/{userId}")
    PublicProfileResponse getProfileById(@PathVariable Long userId);

    @PostMapping("/users/batch")
    List<PublicProfileResponse> getProfilesByIds(@RequestBody UserBatchRequest request);
}