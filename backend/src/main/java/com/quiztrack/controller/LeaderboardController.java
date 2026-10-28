package com.quiztrack.controller;

import com.quiztrack.dto.leaderboard.LeaderboardEntryDto;
import com.quiztrack.service.LeaderboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leaderboard")
@RequiredArgsConstructor
@Tag(name = "Leaderboard", description = "Global, per-quiz, weekly and monthly rankings")
public class LeaderboardController {

    private final LeaderboardService leaderboardService;

    @GetMapping
    @Operation(summary = "Get global XP leaderboard")
    public ResponseEntity<List<LeaderboardEntryDto>> getGlobalLeaderboard(
        @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(leaderboardService.getGlobalLeaderboard(limit));
    }

    @GetMapping("/quiz/{quizId}")
    @Operation(summary = "Get top performers for a specific quiz")
    public ResponseEntity<List<LeaderboardEntryDto>> getQuizLeaderboard(
        @PathVariable Long quizId,
        @RequestParam(defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(leaderboardService.getQuizLeaderboard(quizId, limit));
    }

    @GetMapping("/scoped")
    @Operation(summary = "Get weekly or monthly leaderboard (period=weekly|monthly)")
    public ResponseEntity<List<LeaderboardEntryDto>> getTimeScopedLeaderboard(
        @RequestParam(defaultValue = "weekly") String period,
        @RequestParam(defaultValue = "20") int limit
    ) {
        return ResponseEntity.ok(leaderboardService.getTimeScopedLeaderboard(period, limit));
    }
}
