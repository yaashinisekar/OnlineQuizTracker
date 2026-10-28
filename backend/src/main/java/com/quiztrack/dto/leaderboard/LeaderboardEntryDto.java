package com.quiztrack.dto.leaderboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardEntryDto {
    private Integer rank;
    private Long userId;
    private String fullName;
    private String email;
    private String avatarUrl;
    private Integer xpPoints;
    private Integer currentLevel;
    private Integer currentStreak;
    private Long totalQuizzesTaken;
    private BigDecimal averageScore;
    private BigDecimal bestScore;
}
