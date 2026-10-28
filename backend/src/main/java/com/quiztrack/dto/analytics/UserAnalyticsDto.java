package com.quiztrack.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAnalyticsDto {
    private Long quizzesTaken;
    private BigDecimal averageScore;
    private BigDecimal bestScore;
    private Integer currentStreak;
    private Integer longestStreak;
    private Integer totalXp;
    private Integer currentLevel;
    private Integer nextLevelXp;
    private Double levelProgressPercentage;

    private List<ScoreTrendPointDto> scoreTrend;
    private List<CategoryRadarPointDto> categoryRadar;
    private List<AccuracySpeedPointDto> accuracySpeed;
    private List<DailyHeatmapPointDto> dailyHeatmap;
    private List<WeakTopicRecommendationDto> weakTopics;
    private List<BadgeDto> badges;
    private List<RecentActivityDto> recentActivities;
}
