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
public class CategoryRadarPointDto {
    private String category;
    private BigDecimal averageScore;
    private Long quizCount;
    @Builder.Default
    private int fullMark = 100;
}
