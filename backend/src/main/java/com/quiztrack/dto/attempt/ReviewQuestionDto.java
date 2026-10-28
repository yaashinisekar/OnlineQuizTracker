package com.quiztrack.dto.attempt;

import com.quiztrack.dto.question.OptionAdminDto;
import com.quiztrack.entity.QuestionType;
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
public class ReviewQuestionDto {
    private Long questionId;
    private String questionText;
    private QuestionType questionType;
    private BigDecimal marks;
    private BigDecimal marksAwarded;
    private String explanation;
    private String imageUrl;
    private Integer orderIndex;
    private List<OptionAdminDto> options;
    private List<Long> userSelectedOptionIds;
    private Boolean isCorrect;
    private Boolean isSkipped;
    private Integer timeSpentSeconds;
}
