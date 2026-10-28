package com.quiztrack.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDto {
    private Long id;
    private String code;
    private String title;
    private String description;
    private String iconName;
    private String category;
    private Integer xpReward;
    private Boolean isUnlocked;
    private LocalDateTime earnedAt;
}
