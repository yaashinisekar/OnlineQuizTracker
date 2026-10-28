package com.quiztrack.dto.admin;

import com.quiztrack.dto.attempt.AttemptHistoryItemDto;
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
public class AdminDashboardDto {
    private Long totalUsers;
    private Long totalQuizzes;
    private Long publishedQuizzes;
    private Long totalAttempts;
    private BigDecimal averagePlatformScore;
    private List<AttemptHistoryItemDto> recentAttempts;
    private List<QuizPerformanceReportDto> quizPerformance;
    private List<MostMissedQuestionDto> mostMissedQuestions;
}
