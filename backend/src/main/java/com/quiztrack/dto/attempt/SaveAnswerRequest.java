package com.quiztrack.dto.attempt;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaveAnswerRequest {

    @NotNull(message = "Question ID is required")
    private Long questionId;

    private List<Long> selectedOptionIds;
    private Boolean isMarkedForReview;
    private Integer timeSpentSeconds;
}
