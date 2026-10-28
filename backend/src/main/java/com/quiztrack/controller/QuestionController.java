package com.quiztrack.controller;

import com.quiztrack.dto.question.QuestionAdminDto;
import com.quiztrack.dto.question.QuestionCreateRequest;
import com.quiztrack.service.QuestionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@Tag(name = "Questions", description = "Endpoints for managing quiz questions and options")
public class QuestionController {

    private final QuestionService questionService;

    @GetMapping("/admin/quizzes/{quizId}/questions")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get all questions for a quiz with answer keys (Admin)")
    public ResponseEntity<List<QuestionAdminDto>> getQuestionsByQuizId(@PathVariable Long quizId) {
        return ResponseEntity.ok(questionService.getQuestionsByQuizId(quizId));
    }

    @PostMapping("/admin/quizzes/{quizId}/questions")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Add a new question to a quiz (Admin)")
    public ResponseEntity<QuestionAdminDto> createQuestion(
        @PathVariable Long quizId,
        @Valid @RequestBody QuestionCreateRequest request
    ) {
        QuestionAdminDto created = questionService.createQuestion(quizId, request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/admin/questions/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Update an existing question and its options (Admin)")
    public ResponseEntity<QuestionAdminDto> updateQuestion(
        @PathVariable Long id,
        @Valid @RequestBody QuestionCreateRequest request
    ) {
        return ResponseEntity.ok(questionService.updateQuestion(id, request));
    }

    @DeleteMapping("/admin/questions/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Delete a question by ID (Admin)")
    public ResponseEntity<Map<String, String>> deleteQuestion(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return ResponseEntity.ok(Map.of("message", "Question successfully deleted."));
    }
}
