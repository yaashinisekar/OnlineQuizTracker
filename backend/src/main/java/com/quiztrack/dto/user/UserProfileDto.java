package com.quiztrack.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String avatarUrl;
    private String bio;
    private Integer xpPoints;
    private Integer currentLevel;
    private Integer currentStreak;
    private Integer longestStreak;
    private List<String> roles;
    private LocalDateTime createdAt;
}
