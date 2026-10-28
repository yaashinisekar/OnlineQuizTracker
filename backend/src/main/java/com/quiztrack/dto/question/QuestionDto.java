package com.quiztrack.dto.question;

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
public class QuestionDto {
    private Long id;
    private String questionText;
    private QuestionType questionType;
    private BigDecimal marks;
    private String imageUrl;
    private Integer orderIndex;
    private List<OptionDto> options;
}
