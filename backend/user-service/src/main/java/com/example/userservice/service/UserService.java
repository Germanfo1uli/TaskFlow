package com.example.userservice.service;

import com.example.userservice.exception.UserNotFoundException;
import com.example.userservice.models.dto.data.UserFlags;
import com.example.userservice.models.dto.response.ChangeProfileResponse;
import com.example.userservice.models.dto.response.UserProfileResponse;
import com.example.userservice.models.entity.User;
import com.example.userservice.models.entity.UserProfile;
import com.example.userservice.repository.ProfileRepository;
import com.example.userservice.repository.UserRepository;
import org.springframework.transaction.annotation.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserService {
    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    @Transactional
    public void createProfile(User user, String name) {
        UserProfile profile = UserProfile.builder()
                .name(name)
                .user(user)
                .build();

        profileRepository.save(profile);
    }

    @Transactional
    public ChangeProfileResponse updateProfileById(Long userId, String name, String bio) {
        UserProfile profile = profileRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        profile.setBio(bio);
        profile.setName(name);
        return new ChangeProfileResponse(profile.getName(), profile.getBio());
    }

    public UserProfileResponse getProfileById(Long userId) {
            User user = userRepository.findWithProfileById(userId)
                    .orElseThrow(() -> new UserNotFoundException(userId));

            return new UserProfileResponse(
                    userId,
                    user.getEmail(),
                    user.getProfile().getName(),
                    user.getProfile().getBio(),
                    user.getCreatedAt()
            );
    }

    public boolean isLocked(Long userId) {
        return userRepository.findFlagsById(userId)
                .map(UserFlags::isLocked)
                .orElse(false);
    }

    public boolean isDeleted(Long userId) {
        return userRepository.findFlagsById(userId)
                .map(UserFlags::isDeleted)
                .orElse(true);
    }
}
