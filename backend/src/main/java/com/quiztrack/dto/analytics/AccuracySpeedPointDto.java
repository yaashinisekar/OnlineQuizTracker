package com.quiztrack.dto.analytics;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AccuracySpeedPointDto {
    private String quizTitle;
    private BigDecimal accuracy; // Percentage
    private Double speedMinutes; // Duration in minutes
    private Integer correctCount;
    private Integer totalQuestions;
}
