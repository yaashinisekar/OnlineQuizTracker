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
public class WeakTopicRecommendationDto {
    private Long quizId;
    private String quizTitle;
    private String categoryName;
    private BigDecimal averagePercentage;
    private Long attemptsCount;
    private String recommendationReason;
}
