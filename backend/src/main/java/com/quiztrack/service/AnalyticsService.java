package com.quiztrack.service;

import com.quiztrack.dto.analytics.*;
import com.quiztrack.entity.ActivityLog;
import com.quiztrack.entity.Attempt;
import com.quiztrack.entity.AttemptStatus;
import com.quiztrack.entity.User;
import com.quiztrack.repository.ActivityLogRepository;
import com.quiztrack.repository.AttemptRepository;
import com.quiztrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final AttemptRepository attemptRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final BadgeService badgeService;

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("MMM dd");
    private static final DateTimeFormatter ISO_DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @Transactional(readOnly = true)
    public UserAnalyticsDto getUserAnalytics(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new com.quiztrack.exception.ResourceNotFoundException("User not found with id: " + userId));

        long quizzesTaken = attemptRepository.countByUserIdAndStatus(userId, AttemptStatus.COMPLETED);
        BigDecimal avgScore = attemptRepository.calculateAveragePercentageByUserId(userId);
        BigDecimal bestScore = attemptRepository.findMaxPercentageByUserId(userId);

        // Level and XP progress
        int xp = user.getXpPoints();
        int currentLevel = user.getCurrentLevel();
        int currentLevelBaseXp = (currentLevel - 1) * 500;
        int nextLevelTargetXp = currentLevel * 500;
        int xpInCurrentLevel = Math.max(0, xp - currentLevelBaseXp);
        double levelProgress = Math.min(100.0, (xpInCurrentLevel / 500.0) * 100.0);

        // 1. Score Trend (chronological attempts)
        List<Attempt> completedAttempts = attemptRepository.findByUserIdAndStatusOrderByCompletedAtAsc(userId, AttemptStatus.COMPLETED);
        List<ScoreTrendPointDto> scoreTrend = completedAttempts.stream().map(a -> ScoreTrendPointDto.builder()
            .date(a.getCompletedAt() != null ? a.getCompletedAt().format(DATE_FMT) : "N/A")
            .quizTitle(a.getQuiz().getTitle())
            .score(a.getScoreObtained())
            .percentage(a.getPercentage())
            .build()).collect(Collectors.toList());

        // 2. Category Radar (Category strength vs weakness)
        List<Object[]> catRows = attemptRepository.findCategoryPerformanceByUserId(userId);
        List<CategoryRadarPointDto> categoryRadar = catRows.stream().map(r -> {
            String catName = (String) r[0];
            Double rawAvg = ((Number) r[1]).doubleValue();
            Long count = ((Number) r[2]).longValue();
            return CategoryRadarPointDto.builder()
                .category(catName)
                .averageScore(BigDecimal.valueOf(rawAvg).setScale(1, RoundingMode.HALF_UP))
                .quizCount(count)
                .fullMark(100)
                .build();
        }).collect(Collectors.toList());

        // 3. Accuracy vs Speed (Scatter plot correlation)
        List<AccuracySpeedPointDto> accuracySpeed = completedAttempts.stream().map(a -> {
            double minutes = a.getTotalTimeSeconds() > 0 ? (a.getTotalTimeSeconds() / 60.0) : 0.5;
            return AccuracySpeedPointDto.builder()
                .quizTitle(a.getQuiz().getTitle())
                .accuracy(a.getPercentage())
                .speedMinutes(Math.round(minutes * 10.0) / 10.0)
                .correctCount(a.getCorrectCount())
                .totalQuestions(a.getTotalQuestions())
                .build();
        }).collect(Collectors.toList());

        // 4. Daily Heatmap (Last 90 days)
        LocalDateTime startDate = LocalDateTime.now().minusDays(90);
        List<Object[]> heatRows = attemptRepository.findDailyActivityByUserId(userId, startDate);
        Map<String, DailyHeatmapPointDto> heatMap = new HashMap<>();

        for (Object[] row : heatRows) {
            String dateStr = String.valueOf(row[0]);
            Long count = ((Number) row[1]).longValue();
            Double rawAvg = ((Number) row[2]).doubleValue();
            heatMap.put(dateStr, DailyHeatmapPointDto.builder()
                .date(dateStr)
                .count(count)
                .averageScore(BigDecimal.valueOf(rawAvg).setScale(1, RoundingMode.HALF_UP))
                .build());
        }

        // Fill past 60 days so frontend has continuous heatmap cells
        List<DailyHeatmapPointDto> dailyHeatmap = new ArrayList<>();
        LocalDate today = LocalDate.now();
        for (int i = 59; i >= 0; i--) {
            LocalDate d = today.minusDays(i);
            String dStr = d.format(ISO_DATE);
            dailyHeatmap.add(heatMap.getOrDefault(dStr, DailyHeatmapPointDto.builder()
                .date(dStr)
                .count(0L)
                .averageScore(BigDecimal.ZERO)
                .build()));
        }

        // 5. Weak Topics Recommendations
        List<Object[]> weakRows = attemptRepository.findWeakTopicsByUserId(userId);
        List<WeakTopicRecommendationDto> weakTopics = weakRows.stream().map(r -> {
            Long qId = ((Number) r[0]).longValue();
            String title = (String) r[1];
            String cat = (String) r[2];
            Double rawAvg = ((Number) r[3]).doubleValue();
            Long count = ((Number) r[4]).longValue();

            String reason = rawAvg < 50.0
                ? "Critical accuracy gap: scored under 50%. Review fundamentals and retake."
                : "Needs reinforcement: scored below the 70% proficiency target.";

            return WeakTopicRecommendationDto.builder()
                .quizId(qId)
                .quizTitle(title)
                .categoryName(cat)
                .averagePercentage(BigDecimal.valueOf(rawAvg).setScale(1, RoundingMode.HALF_UP))
                .attemptsCount(count)
                .recommendationReason(reason)
                .build();
        }).collect(Collectors.toList());

        // 6. Badges & Recent Activities
        List<BadgeDto> badges = badgeService.getAllBadgesWithUserStatus(userId);
        List<ActivityLog> activities = activityLogRepository.findByUserIdOrderByCreatedAtDesc(userId, PageRequest.of(0, 8));
        List<RecentActivityDto> recentActivities = activities.stream().map(act -> RecentActivityDto.builder()
            .id(act.getId())
            .actionType(act.getActionType())
            .description(act.getDescription())
            .createdAt(act.getCreatedAt())
            .build()).collect(Collectors.toList());

        return UserAnalyticsDto.builder()
            .quizzesTaken(quizzesTaken)
            .averageScore(avgScore != null ? avgScore.setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO)
            .bestScore(bestScore != null ? bestScore.setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO)
            .currentStreak(user.getCurrentStreak())
            .longestStreak(user.getLongestStreak())
            .totalXp(user.getXpPoints())
            .currentLevel(currentLevel)
            .nextLevelXp(nextLevelTargetXp)
            .levelProgressPercentage(levelProgress)
            .scoreTrend(scoreTrend)
            .categoryRadar(categoryRadar)
            .accuracySpeed(accuracySpeed)
            .dailyHeatmap(dailyHeatmap)
            .weakTopics(weakTopics)
            .badges(badges)
            .recentActivities(recentActivities)
            .build();
    }
}
