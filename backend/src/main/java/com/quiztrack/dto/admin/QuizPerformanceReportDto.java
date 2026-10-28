package com.quiztrack.dto.admin;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizPerformanceReportDto {
    private Long quizId;
    private String title;
    private String categoryName;
    private Long totalAttempts;
    private BigDecimal averageScore;
    private BigDecimal passRate;
    private BigDecimal highestScore;
    private BigDecimal lowestScore;
    private Boolean isPublished;
}
