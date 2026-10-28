package com.quiztrack.dto.attempt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SavedAnswerDto {
    private Long questionId;
    private List<Long> selectedOptionIds;
    private Boolean isMarkedForReview;
    private Integer timeSpentSeconds;
}
