package com.quiztrack.dto.quiz;

import com.quiztrack.entity.Difficulty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QuizDetailDto {
    private Long id;
    private String title;
    private String slug;
    private String description;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String categoryColor;
    private Difficulty difficulty;
    private Integer durationMinutes;
    private BigDecimal passPercentage;
    private Boolean negativeMarking;
    private BigDecimal negativeMarkingDeduction;
    private Integer perQuestionTimerSeconds;
    private Boolean isPublished;
    private Boolean shuffleQuestions;
    private Boolean shuffleOptions;
    private Integer maxViolationsAllowed;
    private Integer questionCount;
    private BigDecimal totalMarks;
    private String createdBy;
    private List<String> tags;
    private LocalDateTime createdAt;
}
