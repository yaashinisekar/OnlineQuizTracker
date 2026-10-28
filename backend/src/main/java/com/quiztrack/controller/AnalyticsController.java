package com.quiztrack.controller;

import com.quiztrack.dto.analytics.UserAnalyticsDto;
import com.quiztrack.security.UserPrincipal;
import com.quiztrack.service.AnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/analytics")
@RequiredArgsConstructor
@Tag(name = "Analytics & Progress", description = "Endpoints for user performance charts, heatmaps, radars and study recommendations")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get user analytics (score trends, radar chart, accuracy/speed, heatmap, weak topics)")
    public ResponseEntity<UserAnalyticsDto> getDashboardAnalytics(@AuthenticationPrincipal UserPrincipal currentUser) {
        return ResponseEntity.ok(analyticsService.getUserAnalytics(currentUser.getId()));
    }
}
