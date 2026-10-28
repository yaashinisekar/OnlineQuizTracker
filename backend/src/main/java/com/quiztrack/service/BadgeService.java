package com.quiztrack.service;

import com.quiztrack.dto.analytics.BadgeDto;
import com.quiztrack.entity.*;
import com.quiztrack.repository.ActivityLogRepository;
import com.quiztrack.repository.BadgeRepository;
import com.quiztrack.repository.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public List<String> evaluateAndAwardBadges(User user, Attempt attempt) {
        List<String> newlyAwarded = new ArrayList<>();

        // 1. FIRST_QUIZ
        checkAndAward(user, "FIRST_QUIZ", newlyAwarded);

        // 2. STREAK_5
        if (user.getCurrentStreak() >= 5) {
            checkAndAward(user, "STREAK_5", newlyAwarded);
        }

        // 3. PERFECT_SCORE
        if (attempt.getPercentage() != null && attempt.getPercentage().compareTo(new BigDecimal("100.00")) >= 0) {
            checkAndAward(user, "PERFECT_SCORE", newlyAwarded);
        }

        // 4. SPEED_DEMON (< 300 seconds & score >= 80%)
        if (attempt.getTotalTimeSeconds() > 0 && attempt.getTotalTimeSeconds() < 300 &&
            attempt.getPercentage() != null && attempt.getPercentage().compareTo(new BigDecimal("80.00")) >= 0) {
            checkAndAward(user, "SPEED_DEMON", newlyAwarded);
        }

        // 5. Domain Badges
        String categoryName = attempt.getQuiz().getCategory().getName().toLowerCase();
        if (categoryName.contains("java") && attempt.getPercentage().compareTo(new BigDecimal("70.00")) >= 0) {
            checkAndAward(user, "JAVA_CHAMPION", newlyAwarded);
        } else if ((categoryName.contains("database") || categoryName.contains("sql")) &&
                   attempt.getPercentage().compareTo(new BigDecimal("80.00")) >= 0) {
            checkAndAward(user, "SQL_PRO", newlyAwarded);
        }

        return newlyAwarded;
    }

    private void checkAndAward(User user, String badgeCode, List<String> newlyAwarded) {
        badgeRepository.findByCode(badgeCode).ifPresent(badge -> {
            if (!userBadgeRepository.existsByUserIdAndBadgeId(user.getId(), badge.getId())) {
                userBadgeRepository.save(UserBadge.builder()
                    .user(user)
                    .badge(badge)
                    .earnedAt(LocalDateTime.now())
                    .build());

                user.addXp(badge.getXpReward());

                activityLogRepository.save(ActivityLog.builder()
                    .user(user)
                    .actionType("BADGE_EARNED")
                    .description("Earned badge: " + badge.getTitle())
                    .build());

                newlyAwarded.add(badge.getTitle());
                log.info("User {} awarded badge {}", user.getEmail(), badge.getTitle());
            }
        });
    }

    @Transactional(readOnly = true)
    public List<BadgeDto> getAllBadgesWithUserStatus(Long userId) {
        List<Badge> allBadges = badgeRepository.findAll();
        List<UserBadge> userBadges = userBadgeRepository.findByUserId(userId);
        var earnedMap = userBadges.stream()
            .collect(Collectors.toMap(ub -> ub.getBadge().getId(), UserBadge::getEarnedAt));

        return allBadges.stream().map(badge -> {
            boolean isUnlocked = earnedMap.containsKey(badge.getId());
            return BadgeDto.builder()
                .id(badge.getId())
                .code(badge.getCode())
                .title(badge.getTitle())
                .description(badge.getDescription())
                .iconName(badge.getIconName())
                .category(badge.getCategory())
                .xpReward(badge.getXpReward())
                .isUnlocked(isUnlocked)
                .earnedAt(earnedMap.get(badge.getId()))
                .build();
        }).collect(Collectors.toList());
    }
}
