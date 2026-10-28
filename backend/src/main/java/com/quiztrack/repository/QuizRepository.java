package com.quiztrack.repository;

import com.quiztrack.entity.Difficulty;
import com.quiztrack.entity.Quiz;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuizRepository extends JpaRepository<Quiz, Long> {

    Optional<Quiz> findBySlug(String slug);

    @Query("SELECT q FROM Quiz q " +
           "WHERE q.isPublished = true " +
           "AND (:categoryId IS NULL OR q.category.id = :categoryId) " +
           "AND (:difficulty IS NULL OR q.difficulty = :difficulty) " +
           "AND (:search IS NULL OR LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(q.description) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Quiz> findPublishedQuizzes(
        @Param("categoryId") Long categoryId,
        @Param("difficulty") Difficulty difficulty,
        @Param("search") String search,
        Pageable pageable
    );

    @Query("SELECT q FROM Quiz q " +
           "WHERE (:categoryId IS NULL OR q.category.id = :categoryId) " +
           "AND (:difficulty IS NULL OR q.difficulty = :difficulty) " +
           "AND (:search IS NULL OR LOWER(q.title) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Quiz> findAllQuizzesAdmin(
        @Param("categoryId") Long categoryId,
        @Param("difficulty") Difficulty difficulty,
        @Param("search") String search,
        Pageable pageable
    );

    long countByIsPublishedTrue();

    @Query("SELECT q FROM Quiz q JOIN q.tags t WHERE t.id = :tagId AND q.isPublished = true")
    List<Quiz> findByTagId(@Param("tagId") Long tagId);

    @Query("SELECT DISTINCT q.category.id FROM Quiz q WHERE q.id IN :quizIds")
    List<Long> findCategoryIdsByQuizIds(@Param("quizIds") List<Long> quizIds);
}
