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
public class QuestionAdminDto {
    private Long id;
    private Long quizId;
    private String questionText;
    private QuestionType questionType;
    private BigDecimal marks;
    private String explanation;
    private String imageUrl;
    private Integer orderIndex;
    private List<OptionAdminDto> options;
}
