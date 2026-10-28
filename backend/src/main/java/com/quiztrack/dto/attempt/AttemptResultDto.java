package com.quiztrack.dto.attempt;

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
public class AttemptResultDto {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private String quizSlug;
    private String categoryName;
    private BigDecimal scoreObtained;
    private BigDecimal totalMarks;
    private BigDecimal percentage;
    private BigDecimal passPercentage;
    private Boolean isPassed;
    private Integer correctCount;
    private Integer wrongCount;
    private Integer skippedCount;
    private Integer totalQuestions;
    private Integer totalTimeSeconds;
    private Integer xpAwarded;
    private String certificateCode;
    private String status;
    private List<String> newlyEarnedBadges;
}
