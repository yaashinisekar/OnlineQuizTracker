package com.quiztrack.service;

import com.quiztrack.dto.leaderboard.LeaderboardEntryDto;
import com.quiztrack.entity.Attempt;
import com.quiztrack.entity.User;
import com.quiztrack.repository.AttemptRepository;
import com.quiztrack.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LeaderboardService {

    private final UserRepository userRepository;
    private final AttemptRepository attemptRepository;

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getGlobalLeaderboard(int limit) {
        List<User> topUsers = userRepository.findTopByXp(PageRequest.of(0, limit));
        List<LeaderboardEntryDto> result = new ArrayList<>();
        int rank = 1;

        for (User u : topUsers) {
            long quizzesTaken = attemptRepository.countByUserIdAndStatus(u.getId(), com.quiztrack.entity.AttemptStatus.COMPLETED);
            BigDecimal avgScore = attemptRepository.calculateAveragePercentageByUserId(u.getId());
            BigDecimal bestScore = attemptRepository.findMaxPercentageByUserId(u.getId());

            result.add(LeaderboardEntryDto.builder()
                .rank(rank++)
                .userId(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .avatarUrl(u.getAvatarUrl())
                .xpPoints(u.getXpPoints())
                .currentLevel(u.getCurrentLevel())
                .currentStreak(u.getCurrentStreak())
                .totalQuizzesTaken(quizzesTaken)
                .averageScore(avgScore != null ? avgScore : BigDecimal.ZERO)
                .bestScore(bestScore != null ? bestScore : BigDecimal.ZERO)
                .build());
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getQuizLeaderboard(Long quizId, int limit) {
        List<Attempt> topAttempts = attemptRepository.findTopScoresByQuizId(quizId, PageRequest.of(0, limit));
        List<LeaderboardEntryDto> result = new ArrayList<>();
        int rank = 1;

        for (Attempt a : topAttempts) {
            User u = a.getUser();
            result.add(LeaderboardEntryDto.builder()
                .rank(rank++)
                .userId(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .avatarUrl(u.getAvatarUrl())
                .xpPoints(u.getXpPoints())
                .currentLevel(u.getCurrentLevel())
                .currentStreak(u.getCurrentStreak())
                .totalQuizzesTaken(1L)
                .averageScore(a.getPercentage())
                .bestScore(a.getPercentage())
                .build());
        }

        return result;
    }

    @Transactional(readOnly = true)
    public List<LeaderboardEntryDto> getTimeScopedLeaderboard(String period, int limit) {
        LocalDateTime since = "weekly".equalsIgnoreCase(period)
            ? LocalDateTime.now().minusDays(7)
            : LocalDateTime.now().minusDays(30);

        List<Attempt> recentAttempts = attemptRepository.findTopScoresSince(since, PageRequest.of(0, 100));

        // Group by user
        Map<Long, List<Attempt>> byUser = recentAttempts.stream()
            .collect(Collectors.groupingBy(a -> a.getUser().getId()));

        List<LeaderboardEntryDto> entries = new ArrayList<>();
        for (Map.Entry<Long, List<Attempt>> entry : byUser.entrySet()) {
            User u = entry.getValue().get(0).getUser();
            double avg = entry.getValue().stream().mapToDouble(a -> a.getPercentage().doubleValue()).average().orElse(0.0);
            double max = entry.getValue().stream().mapToDouble(a -> a.getPercentage().doubleValue()).max().orElse(0.0);

            entries.add(LeaderboardEntryDto.builder()
                .userId(u.getId())
                .fullName(u.getFullName())
                .email(u.getEmail())
                .avatarUrl(u.getAvatarUrl())
                .xpPoints(u.getXpPoints())
                .currentLevel(u.getCurrentLevel())
                .currentStreak(u.getCurrentStreak())
                .totalQuizzesTaken((long) entry.getValue().size())
                .averageScore(BigDecimal.valueOf(avg).setScale(2, java.math.RoundingMode.HALF_UP))
                .bestScore(BigDecimal.valueOf(max).setScale(2, java.math.RoundingMode.HALF_UP))
                .build());
        }

        entries.sort(Comparator.comparing(LeaderboardEntryDto::getAverageScore).reversed());

        int rank = 1;
        for (LeaderboardEntryDto e : entries) {
            e.setRank(rank++);
        }

        return entries.stream().limit(limit).collect(Collectors.toList());
    }
}
