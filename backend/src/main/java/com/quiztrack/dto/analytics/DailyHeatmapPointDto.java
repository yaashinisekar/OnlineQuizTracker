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
public class DailyHeatmapPointDto {
    private String date; // Format: YYYY-MM-DD
    private Long count;
    private BigDecimal averageScore;
}
