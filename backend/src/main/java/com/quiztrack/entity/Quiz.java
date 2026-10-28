package com.quiztrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "quizzes", indexes = {
    @Index(name = "idx_quizzes_published_difficulty", columnList = "is_published, difficulty"),
    @Index(name = "idx_quizzes_category", columnList = "category_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quiz {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "created_by_user_id", nullable = false)
    private User createdByUser;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, unique = true, length = 280)
    private String slug;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private Difficulty difficulty = Difficulty.MEDIUM;

    @Builder.Default
    @Column(name = "duration_minutes", nullable = false)
    private Integer durationMinutes = 15;

    @Builder.Default
    @Column(name = "pass_percentage", precision = 5, scale = 2, nullable = false)
    private BigDecimal passPercentage = new BigDecimal("60.00");

    @Builder.Default
    @Column(name = "negative_marking", nullable = false)
    private Boolean negativeMarking = false;

    @Builder.Default
    @Column(name = "negative_marking_deduction", precision = 4, scale = 2, nullable = false)
    private BigDecimal negativeMarkingDeduction = new BigDecimal("0.25");

    @Builder.Default
    @Column(name = "per_question_timer_seconds")
    private Integer perQuestionTimerSeconds = 0; // 0 = disabled

    @Builder.Default
    @Column(name = "is_published", nullable = false)
    private Boolean isPublished = false;

    @Builder.Default
    @Column(name = "shuffle_questions", nullable = false)
    private Boolean shuffleQuestions = true;

    @Builder.Default
    @Column(name = "shuffle_options", nullable = false)
    private Boolean shuffleOptions = true;

    @Builder.Default
    @Column(name = "max_violations_allowed", nullable = false)
    private Integer maxViolationsAllowed = 3;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "quiz_tags",
        joinColumns = @JoinColumn(name = "quiz_id"),
        inverseJoinColumns = @JoinColumn(name = "tag_id")
    )
    @Builder.Default
    private Set<Tag> tags = new HashSet<>();

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
