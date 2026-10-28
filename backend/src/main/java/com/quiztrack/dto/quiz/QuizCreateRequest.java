package com.quiztrack.dto.quiz;

import com.quiztrack.entity.Difficulty;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class QuizCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private String description;

    @NotNull(message = "Difficulty is required")
    private Difficulty difficulty;

    @NotNull(message = "Duration is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @NotNull(message = "Pass percentage is required")
    @DecimalMin("0.00")
    private BigDecimal passPercentage;

    private Boolean negativeMarking;
    private BigDecimal negativeMarkingDeduction;
    private Integer perQuestionTimerSeconds;
    private Boolean isPublished;
    private Boolean shuffleQuestions;
    private Boolean shuffleOptions;
    private Integer maxViolationsAllowed;
    private List<String> tagNames;
}
