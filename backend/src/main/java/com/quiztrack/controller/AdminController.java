package com.quiztrack.controller;

import com.quiztrack.dto.admin.*;
import com.quiztrack.dto.question.BulkImportResultDto;
import com.quiztrack.dto.quiz.QuizCreateRequest;
import com.quiztrack.dto.quiz.QuizDetailDto;
import com.quiztrack.entity.User;
import com.quiztrack.security.UserPrincipal;
import com.quiztrack.service.AdminService;
import com.quiztrack.service.BulkImportService;
import com.quiztrack.service.QuizService;
import com.quiztrack.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
@RequiredArgsConstructor
@Tag(name = "Admin Operations", description = "Endpoints for administrators to manage quizzes, questions, users and view system reports")
public class AdminController {

    private final AdminService adminService;
    private final QuizService quizService;
    private final UserService userService;
    private final BulkImportService bulkImportService;

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard overview metrics and analytics")
    public ResponseEntity<AdminDashboardDto> getAdminDashboard() {
        return ResponseEntity.ok(adminService.getDashboardMetrics());
    }

    @GetMapping("/reports/quizzes")
    @Operation(summary = "Get detailed performance report across all quizzes")
    public ResponseEntity<List<QuizPerformanceReportDto>> getQuizReports() {
        return ResponseEntity.ok(adminService.getQuizPerformanceReports());
    }

    @GetMapping(value = "/reports/export-csv", produces = "text/csv")
    @Operation(summary = "Export platform performance data as downloadable CSV")
    public ResponseEntity<byte[]> exportPerformanceCsv() {
        String csv = adminService.generatePerformanceCsv();
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"quiztrack_performance_report.csv\"")
            .contentType(MediaType.parseMediaType("text/csv"))
            .body(csv.getBytes());
    }

    @GetMapping("/users")
    @Operation(summary = "Search and list users with pagination (Admin)")
    public ResponseEntity<Page<UserAdminDto>> getUsers(
        @RequestParam(required = false) String search,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "15") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = "asc".equalsIgnoreCase(direction) ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        return ResponseEntity.ok(adminService.getUsers(search, PageRequest.of(page, size, sort)));
    }

    @PatchMapping("/users/{userId}/status")
    @Operation(summary = "Block or unblock candidate accounts")
    public ResponseEntity<Map<String, String>> updateUserStatus(
        @PathVariable Long userId,
        @RequestBody UserStatusUpdateRequest request
    ) {
        adminService.updateUserStatus(userId, request);
        return ResponseEntity.ok(Map.of("message", "User account status updated successfully."));
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "Delete user account")
    public ResponseEntity<Map<String, String>> deleteUser(@PathVariable Long userId) {
        adminService.deleteUser(userId);
        return ResponseEntity.ok(Map.of("message", "User account removed."));
    }

    @PostMapping("/quizzes")
    @Operation(summary = "Create a new quiz (Admin)")
    public ResponseEntity<QuizDetailDto> createQuiz(
        @AuthenticationPrincipal UserPrincipal currentUser,
        @Valid @RequestBody QuizCreateRequest request
    ) {
        User author = userService.getUserEntity(currentUser.getId());
        QuizDetailDto created = quizService.createQuiz(request, author);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/quizzes/{id}")
    @Operation(summary = "Update quiz configuration (Admin)")
    public ResponseEntity<QuizDetailDto> updateQuiz(
        @PathVariable Long id,
        @Valid @RequestBody QuizCreateRequest request
    ) {
        return ResponseEntity.ok(quizService.updateQuiz(id, request));
    }

    @DeleteMapping("/quizzes/{id}")
    @Operation(summary = "Delete quiz (Admin)")
    public ResponseEntity<Map<String, String>> deleteQuiz(@PathVariable Long id) {
        quizService.deleteQuiz(id);
        return ResponseEntity.ok(Map.of("message", "Quiz deleted successfully."));
    }

    @PatchMapping("/quizzes/{id}/publish")
    @Operation(summary = "Toggle quiz publish status (Admin)")
    public ResponseEntity<QuizDetailDto> togglePublish(@PathVariable Long id) {
        return ResponseEntity.ok(quizService.togglePublish(id));
    }

    @PostMapping(value = "/quizzes/{id}/import", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Bulk import questions from CSV or Excel (.xlsx) file")
    public ResponseEntity<BulkImportResultDto> importQuestions(
        @PathVariable Long id,
        @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(bulkImportService.importQuestions(id, file));
    }
}
