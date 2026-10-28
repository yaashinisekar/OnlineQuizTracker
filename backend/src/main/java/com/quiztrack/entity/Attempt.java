package com.quiztrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "attempts", indexes = {
    @Index(name = "idx_attempts_user_status", columnList = "user_id, status"),
    @Index(name = "idx_attempts_quiz_score", columnList = "quiz_id, score_obtained"),
    @Index(name = "idx_attempts_created", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private AttemptStatus status = AttemptStatus.IN_PROGRESS;

    @CreationTimestamp
    @Column(name = "started_at", updatable = false)
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Builder.Default
    @Column(name = "total_time_seconds", nullable = false)
    private Integer totalTimeSeconds = 0;

    @Builder.Default
    @Column(name = "score_obtained", precision = 6, scale = 2)
    private BigDecimal scoreObtained = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "total_marks", precision = 6, scale = 2)
    private BigDecimal totalMarks = BigDecimal.ZERO;

    @Builder.Default
    @Column(precision = 5, scale = 2)
    private BigDecimal percentage = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "is_passed")
    private Boolean isPassed = false;

    @Builder.Default
    @Column(name = "correct_count")
    private Integer correctCount = 0;

    @Builder.Default
    @Column(name = "wrong_count")
    private Integer wrongCount = 0;

    @Builder.Default
    @Column(name = "skipped_count")
    private Integer skippedCount = 0;

    @Builder.Default
    @Column(name = "total_questions")
    private Integer totalQuestions = 0;

    @Builder.Default
    @Column(name = "violation_count", nullable = false)
    private Integer violationCount = 0;

    @Column(name = "certificate_code", unique = true, length = 64)
    private String certificateCode;

    @Builder.Default
    @Column(name = "xp_awarded")
    private Integer xpAwarded = 0;

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<AttemptAnswer> attemptAnswers = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
