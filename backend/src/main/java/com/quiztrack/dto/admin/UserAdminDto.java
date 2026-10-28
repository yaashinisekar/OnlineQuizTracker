package com.quiztrack.dto.admin;

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
public class UserAdminDto {
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String fullName;
    private String avatarUrl;
    private Boolean isActive;
    private Boolean isBlocked;
    private Integer xpPoints;
    private Integer currentLevel;
    private Integer currentStreak;
    private List<String> roles;
    private Long attemptsCount;
    private LocalDateTime createdAt;
}
