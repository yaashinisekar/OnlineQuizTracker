package com.quiztrack.repository;

import com.quiztrack.entity.Attempt;
import com.quiztrack.entity.AttemptStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttemptRepository extends JpaRepository<Attempt, Long> {

    Optional<Attempt> findFirstByUserIdAndQuizIdAndStatus(Long userId, Long quizId, AttemptStatus status);

    Optional<Attempt> findFirstByUserIdAndStatus(Long userId, AttemptStatus status);

    Page<Attempt> findByUserIdAndStatusOrderByCompletedAtDesc(Long userId, AttemptStatus status, Pageable pageable);

    Page<Attempt> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    List<Attempt> findByUserIdAndStatusOrderByCompletedAtAsc(Long userId, AttemptStatus status);

    Optional<Attempt> findByCertificateCode(String certificateCode);

    long countByUserIdAndStatus(Long userId, AttemptStatus status);

    long countByStatus(AttemptStatus status);

    @Query("SELECT AVG(a.percentage) FROM Attempt a WHERE a.user.id = :userId AND a.status = 'COMPLETED'")
    BigDecimal calculateAveragePercentageByUserId(@Param("userId") Long userId);

    @Query("SELECT MAX(a.percentage) FROM Attempt a WHERE a.user.id = :userId AND a.status = 'COMPLETED'")
    BigDecimal findMaxPercentageByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(a.percentage) FROM Attempt a WHERE a.status = 'COMPLETED'")
    BigDecimal calculateOverallAveragePercentage();

    List<Attempt> findByQuizIdAndStatusOrderByScoreObtainedDesc(Long quizId, AttemptStatus status, Pageable pageable);

    @Query("SELECT a FROM Attempt a " +
           "WHERE a.quiz.id = :quizId AND a.status = 'COMPLETED' " +
           "ORDER BY a.percentage DESC, a.totalTimeSeconds ASC")
    List<Attempt> findTopScoresByQuizId(@Param("quizId") Long quizId, Pageable pageable);

    @Query("SELECT a FROM Attempt a " +
           "WHERE a.status = 'COMPLETED' AND a.completedAt >= :sinceDate " +
           "ORDER BY a.percentage DESC, a.totalTimeSeconds ASC")
    List<Attempt> findTopScoresSince(@Param("sinceDate") LocalDateTime sinceDate, Pageable pageable);

    @Query("SELECT a.quiz.category.name, AVG(a.percentage), COUNT(a) " +
           "FROM Attempt a " +
           "WHERE a.user.id = :userId AND a.status = 'COMPLETED' " +
           "GROUP BY a.quiz.category.name")
    List<Object[]> findCategoryPerformanceByUserId(@Param("userId") Long userId);

    @Query("SELECT DATE(a.completedAt), COUNT(a), AVG(a.percentage) " +
           "FROM Attempt a " +
           "WHERE a.user.id = :userId AND a.status = 'COMPLETED' AND a.completedAt >= :startDate " +
           "GROUP BY DATE(a.completedAt) " +
           "ORDER BY DATE(a.completedAt) ASC")
    List<Object[]> findDailyActivityByUserId(@Param("userId") Long userId, @Param("startDate") LocalDateTime startDate);

    @Query("SELECT q.id, q.title, q.category.name, AVG(a.percentage), COUNT(a) " +
           "FROM Attempt a JOIN a.quiz q " +
           "WHERE a.user.id = :userId AND a.status = 'COMPLETED' " +
           "GROUP BY q.id, q.title, q.category.name " +
           "HAVING AVG(a.percentage) < 70.00 " +
           "ORDER BY AVG(a.percentage) ASC")
    List<Object[]> findWeakTopicsByUserId(@Param("userId") Long userId);
}
