package com.quiztrack.dto.attempt;

import com.quiztrack.dto.question.QuestionDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StartAttemptResponse {
    private Long attemptId;
    private Long quizId;
    private String quizTitle;
    private String categoryName;
    private Integer durationMinutes;
    private Integer perQuestionTimerSeconds;
    private Integer maxViolationsAllowed;
    private Integer currentViolations;
    private LocalDateTime startedAt;
    private Integer remainingSeconds;
    private List<QuestionDto> questions;
    private Map<Long, SavedAnswerDto> savedAnswers;
}
