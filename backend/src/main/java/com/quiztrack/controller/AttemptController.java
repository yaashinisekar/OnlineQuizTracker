package com.quiztrack.controller;

import com.quiztrack.dto.attempt.*;
import com.quiztrack.security.UserPrincipal;
import com.quiztrack.service.AttemptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/attempts")
@RequiredArgsConstructor
@Tag(name = "Quiz Attempts", description = "Endpoints for taking quizzes, auto-saving, anti-cheat, reviews and certificates")
public class AttemptController {

    private final AttemptService attemptService;

    @PostMapping("/start/{quizId}")
    @Operation(summary = "Start a new quiz attempt or resume existing active attempt")
    public ResponseEntity<StartAttemptResponse> startAttempt(
        @PathVariable Long quizId,
        @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(attemptService.startOrResumeAttempt(quizId, currentUser.getId()));
    }

    @PostMapping("/{attemptId}/answer")
    @Operation(summary = "Auto-save answer progress for a specific question")
    public ResponseEntity<SavedAnswerDto> saveAnswer(
        @PathVariable Long attemptId,
        @AuthenticationPrincipal UserPrincipal currentUser,
        @Valid @RequestBody SaveAnswerRequest request
    ) {
        return ResponseEntity.ok(attemptService.saveAnswer(attemptId, currentUser.getId(), request));
    }

    @PostMapping("/{attemptId}/violation")
    @Operation(summary = "Record anti-cheat tab-switch or window blur violation")
    public ResponseEntity<Map<String, String>> recordViolation(
        @PathVariable Long attemptId,
        @AuthenticationPrincipal UserPrincipal currentUser,
        @Valid @RequestBody ViolationReportRequest request
    ) {
        attemptService.recordViolation(attemptId, currentUser.getId(), request);
        return ResponseEntity.ok(Map.of("message", "Violation recorded"));
    }

    @PostMapping("/{attemptId}/submit")
    @Operation(summary = "Submit attempt for server-side evaluation and certificate issuance")
    public ResponseEntity<AttemptResultDto> submitAttempt(
        @PathVariable Long attemptId,
        @AuthenticationPrincipal UserPrincipal currentUser,
        @RequestBody(required = false) SubmitAttemptRequest request
    ) {
        return ResponseEntity.ok(attemptService.submitAttempt(attemptId, currentUser.getId(), request));
    }

    @GetMapping("/{attemptId}/result")
    @Operation(summary = "Get final score and metrics of a submitted attempt")
    public ResponseEntity<AttemptResultDto> getAttemptResult(
        @PathVariable Long attemptId,
        @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(attemptService.getAttemptResult(attemptId, currentUser.getId()));
    }

    @GetMapping("/{attemptId}/review")
    @Operation(summary = "Review user answers vs correct options with detailed explanations")
    public ResponseEntity<AttemptReviewDto> getAttemptReview(
        @PathVariable Long attemptId,
        @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        return ResponseEntity.ok(attemptService.getAttemptReview(attemptId, currentUser.getId()));
    }

    @GetMapping("/history")
    @Operation(summary = "Get paginated attempt history for the logged-in candidate")
    public ResponseEntity<Page<AttemptHistoryItemDto>> getHistory(
        @AuthenticationPrincipal UserPrincipal currentUser,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(attemptService.getUserAttemptHistory(currentUser.getId(),
            PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/verify/{certificateCode}")
    @Operation(summary = "Public verification endpoint for certificate authenticity")
    public ResponseEntity<AttemptHistoryItemDto> verifyCertificate(@PathVariable String certificateCode) {
        return ResponseEntity.ok(attemptService.verifyCertificate(certificateCode));
    }
}
