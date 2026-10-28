package com.quiztrack.service;

import com.quiztrack.dto.admin.*;
import com.quiztrack.dto.attempt.AttemptHistoryItemDto;
import com.quiztrack.entity.*;
import com.quiztrack.exception.ResourceNotFoundException;
import com.quiztrack.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final QuizRepository quizRepository;
    private final AttemptRepository attemptRepository;
    private final QuestionRepository questionRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;

    @Transactional(readOnly = true)
    public AdminDashboardDto getDashboardMetrics() {
        long totalUsers = userRepository.count();
        long totalQuizzes = quizRepository.count();
        long publishedQuizzes = quizRepository.countByIsPublishedTrue();
        long totalAttempts = attemptRepository.countByStatus(AttemptStatus.COMPLETED);
        BigDecimal avgPlatformScore = attemptRepository.calculateOverallAveragePercentage();

        // Recent attempts
        Page<Attempt> recentAttemptsPage = attemptRepository.findAll(PageRequest.of(0, 10));
        List<AttemptHistoryItemDto> recentAttempts = recentAttemptsPage.stream().map(a -> AttemptHistoryItemDto.builder()
            .attemptId(a.getId())
            .quizId(a.getQuiz().getId())
            .quizTitle(a.getQuiz().getTitle())
            .quizSlug(a.getQuiz().getSlug())
            .categoryName(a.getQuiz().getCategory().getName())
            .scoreObtained(a.getScoreObtained())
            .totalMarks(a.getTotalMarks())
            .percentage(a.getPercentage())
            .isPassed(a.getIsPassed())
            .correctCount(a.getCorrectCount())
            .wrongCount(a.getWrongCount())
            .skippedCount(a.getSkippedCount())
            .totalTimeSeconds(a.getTotalTimeSeconds())
            .status(a.getStatus().name())
            .certificateCode(a.getCertificateCode())
            .completedAt(a.getCompletedAt())
            .build()).collect(Collectors.toList());

        // Quiz performance summaries
        List<QuizPerformanceReportDto> quizPerformance = getQuizPerformanceReports();

        // Most missed questions
        List<MostMissedQuestionDto> mostMissed = getMostMissedQuestions();

        return AdminDashboardDto.builder()
            .totalUsers(totalUsers)
            .totalQuizzes(totalQuizzes)
            .publishedQuizzes(publishedQuizzes)
            .totalAttempts(totalAttempts)
            .averagePlatformScore(avgPlatformScore != null ? avgPlatformScore.setScale(1, RoundingMode.HALF_UP) : BigDecimal.ZERO)
            .recentAttempts(recentAttempts)
            .quizPerformance(quizPerformance)
            .mostMissedQuestions(mostMissed)
            .build();
    }

    @Transactional(readOnly = true)
    public List<QuizPerformanceReportDto> getQuizPerformanceReports() {
        List<Quiz> quizzes = quizRepository.findAll();
        List<QuizPerformanceReportDto> reports = new ArrayList<>();

        for (Quiz q : quizzes) {
            List<Attempt> attempts = attemptRepository.findByQuizIdAndStatusOrderByScoreObtainedDesc(q.getId(), AttemptStatus.COMPLETED, PageRequest.of(0, 1000));
            long count = attempts.size();
            BigDecimal avg = BigDecimal.ZERO;
            BigDecimal passRate = BigDecimal.ZERO;
            BigDecimal highest = BigDecimal.ZERO;
            BigDecimal lowest = BigDecimal.ZERO;

            if (count > 0) {
                double avgVal = attempts.stream().mapToDouble(a -> a.getPercentage().doubleValue()).average().orElse(0.0);
                avg = BigDecimal.valueOf(avgVal).setScale(1, RoundingMode.HALF_UP);
                long passedCount = attempts.stream().filter(a -> Boolean.TRUE.equals(a.getIsPassed())).count();
                passRate = BigDecimal.valueOf((passedCount * 100.0) / count).setScale(1, RoundingMode.HALF_UP);
                highest = attempts.get(0).getPercentage();
                lowest = attempts.get(attempts.size() - 1).getPercentage();
            }

            reports.add(QuizPerformanceReportDto.builder()
                .quizId(q.getId())
                .title(q.getTitle())
                .categoryName(q.getCategory().getName())
                .totalAttempts(count)
                .averageScore(avg)
                .passRate(passRate)
                .highestScore(highest)
                .lowestScore(lowest)
                .isPublished(q.getIsPublished())
                .build());
        }

        return reports;
    }

    @Transactional(readOnly = true)
    public List<MostMissedQuestionDto> getMostMissedQuestions() {
        // Find questions where attempts have lowest correct answers
        List<Question> sampleQuestions = questionRepository.findAll(PageRequest.of(0, 50)).getContent();
        List<MostMissedQuestionDto> result = new ArrayList<>();

        for (Question q : sampleQuestions) {
            List<AttemptAnswer> answers = attemptAnswerRepository.findAll().stream()
                .filter(a -> a.getQuestion().getId().equals(q.getId()))
                .collect(Collectors.toList());

            if (!answers.isEmpty()) {
                long total = answers.size();
                long wrong = answers.stream().filter(a -> !Boolean.TRUE.equals(a.getIsCorrect())).count();
                if (wrong > 0) {
                    BigDecimal wrongPct = BigDecimal.valueOf((wrong * 100.0) / total).setScale(1, RoundingMode.HALF_UP);
                    result.add(MostMissedQuestionDto.builder()
                        .questionId(q.getId())
                        .questionText(q.getQuestionText().length() > 80 ? q.getQuestionText().substring(0, 77) + "..." : q.getQuestionText())
                        .quizTitle(q.getQuiz().getTitle())
                        .timesAttempted(total)
                        .timesWrong(wrong)
                        .wrongPercentage(wrongPct)
                        .build());
                }
            }
        }

        result.sort(Comparator.comparing(MostMissedQuestionDto::getWrongPercentage).reversed());
        return result.stream().limit(8).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<UserAdminDto> getUsers(String query, Pageable pageable) {
        Page<User> users = userRepository.searchUsers(query, pageable);
        return users.map(u -> {
            long attempts = attemptRepository.countByUserIdAndStatus(u.getId(), AttemptStatus.COMPLETED);
            List<String> roles = u.getRoles().stream().map(r -> r.getName().name()).collect(Collectors.toList());
            return UserAdminDto.builder()
                .id(u.getId())
                .email(u.getEmail())
                .firstName(u.getFirstName())
                .lastName(u.getLastName())
                .fullName(u.getFullName())
                .avatarUrl(u.getAvatarUrl())
                .isActive(u.getIsActive())
                .isBlocked(u.getIsBlocked())
                .xpPoints(u.getXpPoints())
                .currentLevel(u.getCurrentLevel())
                .currentStreak(u.getCurrentStreak())
                .roles(roles)
                .attemptsCount(attempts)
                .createdAt(u.getCreatedAt())
                .build();
        });
    }

    @Transactional
    public void updateUserStatus(Long userId, UserStatusUpdateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getIsBlocked() != null) {
            user.setIsBlocked(request.getIsBlocked());
        }
        if (request.getIsActive() != null) {
            user.setIsActive(request.getIsActive());
        }
        userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        userRepository.delete(user);
    }

    public String generatePerformanceCsv() {
        List<QuizPerformanceReportDto> reports = getQuizPerformanceReports();
        StringBuilder csv = new StringBuilder();
        csv.append("Quiz ID,Title,Category,Total Attempts,Average Score (%),Pass Rate (%),Highest Score (%),Lowest Score (%),Published\n");

        for (QuizPerformanceReportDto r : reports) {
            csv.append(r.getQuizId()).append(",")
               .append("\"").append(r.getTitle().replace("\"", "\"\"")).append("\",")
               .append("\"").append(r.getCategoryName()).append("\",")
               .append(r.getTotalAttempts()).append(",")
               .append(r.getAverageScore()).append(",")
               .append(r.getPassRate()).append(",")
               .append(r.getHighestScore()).append(",")
               .append(r.getLowestScore()).append(",")
               .append(r.getIsPublished()).append("\n");
        }

        return csv.toString();
    }
}
