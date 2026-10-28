package com.quiztrack.dto.question;

import com.quiztrack.entity.QuestionType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
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
public class QuestionCreateRequest {

    @NotBlank(message = "Question text is required")
    private String questionText;

    @NotNull(message = "Question type is required")
    private QuestionType questionType;

    @NotNull(message = "Marks is required")
    @DecimalMin("0.50")
    private BigDecimal marks;

    private String explanation;
    private String imageUrl;
    private Integer orderIndex;

    @NotEmpty(message = "At least two options are required")
    private List<OptionAdminDto> options;
}
