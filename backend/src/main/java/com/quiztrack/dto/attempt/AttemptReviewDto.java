package com.quiztrack.dto.attempt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptReviewDto {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private String categoryName;
    private BigDecimal scoreObtained;
    private BigDecimal totalMarks;
    private BigDecimal percentage;
    private Boolean isPassed;
    private Integer correctCount;
    private Integer wrongCount;
    private Integer skippedCount;
    private Integer totalQuestions;
    private Integer totalTimeSeconds;
    private Integer violationCount;
    private String status;
    private LocalDateTime completedAt;
    private List<ReviewQuestionDto> questions;
}
