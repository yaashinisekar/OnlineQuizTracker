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
public class MostMissedQuestionDto {
    private Long questionId;
    private String questionText;
    private String quizTitle;
    private Long timesAttempted;
    private Long timesWrong;
    private BigDecimal wrongPercentage;
}
