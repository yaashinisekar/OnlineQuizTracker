package com.quiztrack.dto.question;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptionAdminDto {
    private Long id;
    private String optionText;
    private Boolean isCorrect;
    private Integer orderIndex;
}
