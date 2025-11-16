package com.example.userservice.service;

import com.example.userservice.models.entity.User;
import com.example.userservice.models.entity.UserProfile;
import com.example.userservice.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileService {
    private final UserProfileRepository userProfileRepository;

    public UserProfile createProfile(User user) {
        UserProfile profile = new UserProfile();
        profile.setUser(user);
        return userProfileRepository.save(profile);
    }
}
