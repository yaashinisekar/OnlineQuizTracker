package com.quiztrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "attempt_answers", uniqueConstraints = {
    @UniqueConstraint(name = "uk_attempt_question", columnNames = {"attempt_id", "question_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AttemptAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false)
    private Attempt attempt;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "question_id", nullable = false)
    private Question question;

    @Column(name = "selected_option_ids", columnDefinition = "TEXT")
    private String selectedOptionIds; // Comma-separated or JSON list of option IDs

    @Builder.Default
    @Column(name = "is_marked_for_review", nullable = false)
    private Boolean isMarkedForReview = false;

    @Builder.Default
    @Column(name = "is_correct")
    private Boolean isCorrect = false;

    @Builder.Default
    @Column(name = "marks_awarded", precision = 5, scale = 2)
    private BigDecimal marksAwarded = BigDecimal.ZERO;

    @Builder.Default
    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds = 0;

    @UpdateTimestamp
    @Column(name = "answered_at")
    private LocalDateTime answeredAt;
}
