package com.quiztrack.service;

import com.quiztrack.dto.user.ChangePasswordRequest;
import com.quiztrack.dto.user.UpdateProfileRequest;
import com.quiztrack.dto.user.UserProfileDto;
import com.quiztrack.entity.ActivityLog;
import com.quiztrack.entity.User;
import com.quiztrack.exception.BadRequestException;
import com.quiztrack.exception.ResourceNotFoundException;
import com.quiztrack.repository.ActivityLogRepository;
import com.quiztrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfile(Long userId) {
        User user = getUserEntity(userId);
        return mapToProfileDto(user);
    }

    @Transactional(readOnly = true)
    public UserProfileDto getUserProfileByEmail(String email) {
        User user = userRepository.findByEmail(email)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToProfileDto(user);
    }

    @Transactional
    public UserProfileDto updateProfile(Long userId, UpdateProfileRequest request) {
        User user = getUserEntity(userId);
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        if (request.getAvatarUrl() != null && !request.getAvatarUrl().isBlank()) {
            user.setAvatarUrl(request.getAvatarUrl().trim());
        }
        if (request.getBio() != null) {
            user.setBio(request.getBio().trim());
        }

        User updated = userRepository.save(user);

        activityLogRepository.save(ActivityLog.builder()
            .user(user)
            .actionType("PROFILE_UPDATED")
            .description("Profile details were updated.")
            .build());

        return mapToProfileDto(updated);
    }

    @Transactional
    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = getUserEntity(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password does not match records.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        activityLogRepository.save(ActivityLog.builder()
            .user(user)
            .actionType("PASSWORD_CHANGED")
            .description("User account password was modified.")
            .build());
    }

    public User getUserEntity(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
    }

    private UserProfileDto mapToProfileDto(User user) {
        List<String> roles = user.getRoles().stream()
            .map(r -> r.getName().name())
            .collect(Collectors.toList());

        return UserProfileDto.builder()
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .fullName(user.getFullName())
            .avatarUrl(user.getAvatarUrl())
            .bio(user.getBio())
            .xpPoints(user.getXpPoints())
            .currentLevel(user.getCurrentLevel())
            .currentStreak(user.getCurrentStreak())
            .longestStreak(user.getLongestStreak())
            .roles(roles)
            .createdAt(user.getCreatedAt())
            .build();
    }
}
