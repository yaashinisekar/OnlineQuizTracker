package com.quiztrack.dto.attempt;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ViolationReportRequest {
    private String violationType; // "TAB_SWITCH", "WINDOW_BLUR", "FULLSCREEN_EXIT"
    private String details;
}
