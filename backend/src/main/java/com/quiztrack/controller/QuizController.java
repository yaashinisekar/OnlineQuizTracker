package com.quiztrack.controller;

import com.quiztrack.dto.quiz.CategoryDto;
import com.quiztrack.dto.quiz.QuizDetailDto;
import com.quiztrack.dto.quiz.QuizSummaryDto;
import com.quiztrack.entity.Difficulty;
import com.quiztrack.service.QuizService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Tag(name = "Quizzes", description = "Public endpoints for exploring quizzes and categories")
public class QuizController {

    private final QuizService quizService;

    @GetMapping("/quizzes")
    @Operation(summary = "Browse published quizzes with category, difficulty, search and pagination")
    public ResponseEntity<Page<QuizSummaryDto>> getQuizzes(
        @RequestParam(required = false) Long categoryId,
        @RequestParam(required = false) Difficulty difficulty,
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "12") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Page<QuizSummaryDto> result = quizService.getPublishedQuizzes(categoryId, difficulty, search, PageRequest.of(page, size, sort));
        return ResponseEntity.ok(result);
    }

    @GetMapping("/quizzes/{slug}")
    @Operation(summary = "Get detailed quiz metadata by slug")
    public ResponseEntity<QuizDetailDto> getQuizBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(quizService.getQuizBySlug(slug));
    }

    @GetMapping("/quizzes/id/{id}")
    @Operation(summary = "Get detailed quiz metadata by ID")
    public ResponseEntity<QuizDetailDto> getQuizById(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.getQuizById(id));
    }

    @GetMapping("/categories")
    @Operation(summary = "Get all quiz categories")
    public ResponseEntity<List<CategoryDto>> getCategories() {
        return ResponseEntity.ok(quizService.getCategories());
    }
}
