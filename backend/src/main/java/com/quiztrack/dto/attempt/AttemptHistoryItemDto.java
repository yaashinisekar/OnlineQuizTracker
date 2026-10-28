package com.quiztrack.dto.attempt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AttemptHistoryItemDto {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private String quizSlug;
    private String categoryName;
    private BigDecimal scoreObtained;
    private BigDecimal totalMarks;
    private BigDecimal percentage;
    private Boolean isPassed;
    private Integer correctCount;
    private Integer wrongCount;
    private Integer skippedCount;
    private Integer totalTimeSeconds;
    private String status;
    private String certificateCode;
    private LocalDateTime completedAt;
}
