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
public class ScoreTrendPointDto {
    private String date;
    private String quizTitle;
    private BigDecimal score;
    private BigDecimal percentage;
}
