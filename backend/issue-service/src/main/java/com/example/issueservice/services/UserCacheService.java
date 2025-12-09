package com.example.issueservice.services;

import com.example.issueservice.client.UserServiceClient;
import com.example.issueservice.dto.data.UserBatchRequest;
import com.example.issueservice.dto.response.PublicProfileResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserCacheService {

    private final UserServiceClient userClient;

    @Cacheable(value = "user-profiles-batch",
            key = "T(java.util.TreeSet).new(#userIds).toString()",
            unless = "#result.isEmpty()")
    public Map<Long, PublicProfileResponse> getUserProfilesBatch(Set<Long> userIds) {
        if (userIds == null || userIds.isEmpty()) {
            return Collections.emptyMap();
        }

        try {
            UserBatchRequest request = new UserBatchRequest(new ArrayList<>(userIds));
            List<PublicProfileResponse> profiles = userClient.getProfilesByIds(request);

            return profiles.stream()
                    .collect(Collectors.toMap(PublicProfileResponse::id, p -> p));
        } catch (Exception e) {
            log.error("Failed to fetch profiles for users: {}", userIds, e);
            return null;
        }
    }
}