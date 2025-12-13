package com.example.issueservice.client;

import com.example.issueservice.config.ClientConfig;
import com.example.issueservice.dto.response.InternalProjectResponse;
import com.example.issueservice.dto.response.UserPermissionsResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(
        name = "board-service",
        path = "api/internal",
        configuration = ClientConfig.class
)
public interface BoardServiceClient {

    @GetMapping("/projects/{projectId}")
    InternalProjectResponse getProjectById(
            @PathVariable Long projectId
    );

    @GetMapping("/permissions")
    UserPermissionsResponse getUserPermissions(
            @RequestParam Long userId,
            @RequestParam Long projectId
    );

    @GetMapping("/projects/{projectId}/members/{userId}")
    UserPermissionsResponse getMember(
            @PathVariable Long userId,
            @PathVariable Long projectId
    );
}