package com.quiztrack.service;

import com.quiztrack.config.JwtTokenProvider;
import com.quiztrack.dto.auth.*;
import com.quiztrack.entity.ActivityLog;
import com.quiztrack.entity.Role;
import com.quiztrack.entity.RoleName;
import com.quiztrack.entity.User;
import com.quiztrack.exception.BadRequestException;
import com.quiztrack.exception.ResourceNotFoundException;
import com.quiztrack.repository.ActivityLogRepository;
import com.quiztrack.repository.RoleRepository;
import com.quiztrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ActivityLogRepository activityLogRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("An account with this email address already exists.");
        }

        Role userRole = roleRepository.findByName(RoleName.ROLE_USER)
            .orElseThrow(() -> new ResourceNotFoundException("Default user role not initialized."));

        User user = User.builder()
            .firstName(request.getFirstName().trim())
            .lastName(request.getLastName().trim())
            .email(request.getEmail().trim().toLowerCase())
            .passwordHash(passwordEncoder.encode(request.getPassword()))
            .avatarUrl("https://api.dicebear.com/7.x/bottts/svg?seed=" + request.getEmail().trim().toLowerCase())
            .isActive(true)
            .isBlocked(false)
            .xpPoints(0)
            .currentLevel(1)
            .currentStreak(0)
            .longestStreak(0)
            .lastActiveDate(LocalDate.now())
            .roles(Collections.singleton(userRole))
            .build();

        User savedUser = userRepository.save(user);

        activityLogRepository.save(ActivityLog.builder()
            .user(savedUser)
            .actionType("REGISTER")
            .description("Account registered on QuizTrack.")
            .build());

        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);

        return buildAuthResponse(savedUser, token);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail().trim().toLowerCase(), request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        if (Boolean.TRUE.equals(user.getIsBlocked())) {
            throw new BadRequestException("This account has been suspended. Please contact platform administration.");
        }

        user.setLastActiveDate(LocalDate.now());
        userRepository.save(user);

        activityLogRepository.save(ActivityLog.builder()
            .user(user)
            .actionType("LOGIN")
            .description("Logged in successfully.")
            .build());

        String token = tokenProvider.generateToken(authentication);

        return buildAuthResponse(user, token);
    }

    @Transactional
    public String forgotPassword(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail().trim().toLowerCase())
            .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + request.getEmail()));

        String token = UUID.randomUUID().toString();
        user.setResetPasswordToken(token);
        user.setResetPasswordExpiry(LocalDateTime.now().plusHours(2));
        userRepository.save(user);

        log.info("Password reset token generated for {}: {}", user.getEmail(), token);
        return token;
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        User user = userRepository.findByResetPasswordToken(request.getToken())
            .orElseThrow(() -> new BadRequestException("Invalid or expired password reset token."));

        if (user.getResetPasswordExpiry() == null || user.getResetPasswordExpiry().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Password reset token has expired.");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiry(null);
        userRepository.save(user);

        activityLogRepository.save(ActivityLog.builder()
            .user(user)
            .actionType("PASSWORD_RESET")
            .description("Password was successfully updated.")
            .build());
    }

    private AuthResponse buildAuthResponse(User user, String token) {
        List<String> roles = user.getRoles().stream()
            .map(r -> r.getName().name())
            .collect(Collectors.toList());

        return AuthResponse.builder()
            .token(token)
            .tokenType("Bearer")
            .id(user.getId())
            .email(user.getEmail())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .fullName(user.getFullName())
            .avatarUrl(user.getAvatarUrl())
            .roles(roles)
            .xpPoints(user.getXpPoints())
            .currentLevel(user.getCurrentLevel())
            .currentStreak(user.getCurrentStreak())
            .build();
    }
}
