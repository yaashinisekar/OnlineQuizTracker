package com.quiztrack.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.quiztrack.dto.attempt.*;
import com.quiztrack.dto.question.OptionAdminDto;
import com.quiztrack.dto.question.OptionDto;
import com.quiztrack.dto.question.QuestionDto;
import com.quiztrack.entity.*;
import com.quiztrack.exception.AntiCheatViolationException;
import com.quiztrack.exception.BadRequestException;
import com.quiztrack.exception.ResourceNotFoundException;
import com.quiztrack.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AttemptService {

    private final AttemptRepository attemptRepository;
    private final AttemptAnswerRepository attemptAnswerRepository;
    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final ActivityLogRepository activityLogRepository;
    private final BadgeService badgeService;
    private final ObjectMapper objectMapper;

    @Transactional
    public StartAttemptResponse startOrResumeAttempt(Long quizId, Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        if (!quiz.getIsPublished()) {
            throw new BadRequestException("This quiz is currently unpublished.");
        }

        // Check for active attempt (one active attempt per quiz)
        Optional<Attempt> activeOpt = attemptRepository.findFirstByUserIdAndQuizIdAndStatus(userId, quizId, AttemptStatus.IN_PROGRESS);

        Attempt attempt;
        if (activeOpt.isPresent()) {
            attempt = activeOpt.get();
            // Check if timer expired already
            LocalDateTime deadline = attempt.getStartedAt().plusMinutes(quiz.getDurationMinutes());
            if (LocalDateTime.now().isAfter(deadline.plusSeconds(15))) { // 15s grace period
                log.info("Auto-submitting expired active attempt #{}", attempt.getId());
                submitAttempt(attempt.getId(), userId, new SubmitAttemptRequest(quiz.getDurationMinutes() * 60));
                // After auto-submitting expired, create fresh attempt
                attempt = createNewAttempt(quiz, user);
            }
        } else {
            attempt = createNewAttempt(quiz, user);
        }

        final Long finalAttemptId = attempt.getId();

        // Prepare Questions for response (WITHOUT answer keys!)
        List<Question> questions = questionRepository.findByQuizIdWithOptions(quiz.getId());
        if (Boolean.TRUE.equals(quiz.getShuffleQuestions())) {
            Collections.shuffle(questions, new Random(finalAttemptId)); // Deterministic shuffle per attempt
        }

        List<QuestionDto> questionDtos = questions.stream().map(q -> {
            List<Option> options = new ArrayList<>(q.getOptions());
            if (Boolean.TRUE.equals(quiz.getShuffleOptions())) {
                Collections.shuffle(options, new Random(finalAttemptId + q.getId()));
            }

            List<OptionDto> optDtos = options.stream().map(o -> OptionDto.builder()
                .id(o.getId())
                .optionText(o.getOptionText())
                .orderIndex(o.getOrderIndex())
                .build()).collect(Collectors.toList());

            return QuestionDto.builder()
                .id(q.getId())
                .questionText(q.getQuestionText())
                .questionType(q.getQuestionType())
                .marks(q.getMarks())
                .imageUrl(q.getImageUrl())
                .orderIndex(q.getOrderIndex())
                .options(optDtos)
                .build();
        }).collect(Collectors.toList());

        // Load existing saved answers
        Map<Long, SavedAnswerDto> savedAnswers = new HashMap<>();
        List<AttemptAnswer> existingAnswers = attemptAnswerRepository.findByAttemptId(attempt.getId());
        for (AttemptAnswer ans : existingAnswers) {
            List<Long> optIds = parseOptionIds(ans.getSelectedOptionIds());
            savedAnswers.put(ans.getQuestion().getId(), SavedAnswerDto.builder()
                .questionId(ans.getQuestion().getId())
                .selectedOptionIds(optIds)
                .isMarkedForReview(ans.getIsMarkedForReview())
                .timeSpentSeconds(ans.getTimeSpentSeconds())
                .build());
        }

        long secondsElapsed = Duration.between(attempt.getStartedAt(), LocalDateTime.now()).getSeconds();
        int totalDurationSeconds = quiz.getDurationMinutes() * 60;
        int remainingSeconds = Math.max(0, totalDurationSeconds - (int) secondsElapsed);

        return StartAttemptResponse.builder()
            .attemptId(attempt.getId())
            .quizId(quiz.getId())
            .quizTitle(quiz.getTitle())
            .categoryName(quiz.getCategory().getName())
            .durationMinutes(quiz.getDurationMinutes())
            .perQuestionTimerSeconds(quiz.getPerQuestionTimerSeconds())
            .maxViolationsAllowed(quiz.getMaxViolationsAllowed())
            .currentViolations(attempt.getViolationCount())
            .startedAt(attempt.getStartedAt())
            .remainingSeconds(remainingSeconds)
            .questions(questionDtos)
            .savedAnswers(savedAnswers)
            .build();
    }

    private Attempt createNewAttempt(Quiz quiz, User user) {
        int questionCount = (int) questionRepository.countByQuizId(quiz.getId());
        if (questionCount == 0) {
            throw new BadRequestException("This quiz has no questions yet.");
        }

        BigDecimal totalMarks = quiz.getQuestions().stream()
            .map(Question::getMarks)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Attempt attempt = Attempt.builder()
            .user(user)
            .quiz(quiz)
            .status(AttemptStatus.IN_PROGRESS)
            .startedAt(LocalDateTime.now())
            .totalQuestions(questionCount)
            .totalMarks(totalMarks)
            .violationCount(0)
            .scoreObtained(BigDecimal.ZERO)
            .percentage(BigDecimal.ZERO)
            .build();

        return attemptRepository.save(attempt);
    }

    @Transactional
    public SavedAnswerDto saveAnswer(Long attemptId, Long userId, SaveAnswerRequest request) {
        Attempt attempt = validateActiveAttempt(attemptId, userId);

        Question question = questionRepository.findById(request.getQuestionId())
            .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + request.getQuestionId()));

        AttemptAnswer answer = attemptAnswerRepository.findByAttemptIdAndQuestionId(attemptId, question.getId())
            .orElseGet(() -> AttemptAnswer.builder()
                .attempt(attempt)
                .question(question)
                .build());

        try {
            answer.setSelectedOptionIds(objectMapper.writeValueAsString(request.getSelectedOptionIds()));
        } catch (Exception e) {
            answer.setSelectedOptionIds("[]");
        }
        answer.setIsMarkedForReview(Boolean.TRUE.equals(request.getIsMarkedForReview()));
        answer.setTimeSpentSeconds(request.getTimeSpentSeconds() != null ? request.getTimeSpentSeconds() : 0);

        AttemptAnswer saved = attemptAnswerRepository.save(answer);

        return SavedAnswerDto.builder()
            .questionId(question.getId())
            .selectedOptionIds(request.getSelectedOptionIds())
            .isMarkedForReview(saved.getIsMarkedForReview())
            .timeSpentSeconds(saved.getTimeSpentSeconds())
            .build();
    }

    @Transactional
    public void recordViolation(Long attemptId, Long userId, ViolationReportRequest request) {
        Attempt attempt = validateActiveAttempt(attemptId, userId);
        attempt.setViolationCount(attempt.getViolationCount() + 1);
        attemptRepository.save(attempt);

        log.warn("Anti-cheat violation #{} logged for attempt #{}: {}",
            attempt.getViolationCount(), attemptId, request.getViolationType());

        if (attempt.getViolationCount() >= attempt.getQuiz().getMaxViolationsAllowed()) {
            attempt.setStatus(AttemptStatus.TERMINATED_CHEATING);
            attempt.setCompletedAt(LocalDateTime.now());
            attemptRepository.save(attempt);

            activityLogRepository.save(ActivityLog.builder()
                .user(attempt.getUser())
                .actionType("CHEATING_DETECTED")
                .description(String.format("Quiz '%s' terminated due to %d anti-cheat tab-switch violations.",
                    attempt.getQuiz().getTitle(), attempt.getViolationCount()))
                .build());

            throw new AntiCheatViolationException("Test auto-submitted and locked: Exceeded maximum allowed tab-switches.");
        }
    }

    @Transactional
    public AttemptResultDto submitAttempt(Long attemptId, Long userId, SubmitAttemptRequest request) {
        Attempt attempt = attemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this attempt.");
        }

        if (attempt.getStatus() == AttemptStatus.COMPLETED) {
            return getAttemptResult(attemptId, userId);
        }

        Quiz quiz = attempt.getQuiz();
        List<Question> questions = questionRepository.findByQuizIdWithOptions(quiz.getId());
        List<AttemptAnswer> savedAnswers = attemptAnswerRepository.findByAttemptId(attemptId);
        Map<Long, AttemptAnswer> answerMap = savedAnswers.stream()
            .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a));

        BigDecimal scoreObtained = BigDecimal.ZERO;
        BigDecimal totalPossibleMarks = BigDecimal.ZERO;
        int correctCount = 0;
        int wrongCount = 0;
        int skippedCount = 0;

        for (Question q : questions) {
            totalPossibleMarks = totalPossibleMarks.add(q.getMarks());
            AttemptAnswer userAns = answerMap.get(q.getId());
            List<Long> selectedIds = (userAns != null) ? parseOptionIds(userAns.getSelectedOptionIds()) : Collections.emptyList();

            if (selectedIds.isEmpty()) {
                skippedCount++;
                if (userAns != null) {
                    userAns.setIsCorrect(false);
                    userAns.setMarksAwarded(BigDecimal.ZERO);
                    attemptAnswerRepository.save(userAns);
                }
                continue;
            }

            // Find all correct option IDs for this question
            Set<Long> correctOptionIds = q.getOptions().stream()
                .filter(Option::getIsCorrect)
                .map(Option::getId)
                .collect(Collectors.toSet());

            Set<Long> chosenOptionIds = new HashSet<>(selectedIds);
            boolean isCorrect = correctOptionIds.equals(chosenOptionIds);

            if (isCorrect) {
                correctCount++;
                scoreObtained = scoreObtained.add(q.getMarks());
                if (userAns != null) {
                    userAns.setIsCorrect(true);
                    userAns.setMarksAwarded(q.getMarks());
                    attemptAnswerRepository.save(userAns);
                }
            } else {
                wrongCount++;
                BigDecimal penalty = BigDecimal.ZERO;
                if (Boolean.TRUE.equals(quiz.getNegativeMarking()) && quiz.getNegativeMarkingDeduction() != null) {
                    penalty = quiz.getNegativeMarkingDeduction();
                    scoreObtained = scoreObtained.subtract(penalty);
                }
                if (userAns != null) {
                    userAns.setIsCorrect(false);
                    userAns.setMarksAwarded(penalty.negate());
                    attemptAnswerRepository.save(userAns);
                }
            }
        }

        if (scoreObtained.compareTo(BigDecimal.ZERO) < 0) {
            scoreObtained = BigDecimal.ZERO;
        }

        BigDecimal percentage = BigDecimal.ZERO;
        if (totalPossibleMarks.compareTo(BigDecimal.ZERO) > 0) {
            percentage = scoreObtained.divide(totalPossibleMarks, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"))
                .setScale(2, RoundingMode.HALF_UP);
        }

        boolean isPassed = percentage.compareTo(quiz.getPassPercentage()) >= 0;

        int durationSeconds = request != null && request.getTotalTimeSeconds() != null && request.getTotalTimeSeconds() > 0
            ? request.getTotalTimeSeconds()
            : (int) Duration.between(attempt.getStartedAt(), LocalDateTime.now()).getSeconds();

        // Calculate XP
        // Base 50 + score*10 + (passed? 50 : 0) + (perfect score? 100 : 0)
        int xp = 50 + scoreObtained.intValue() * 10;
        if (isPassed) xp += 50;
        if (percentage.compareTo(new BigDecimal("100.00")) == 0) xp += 100;

        attempt.setStatus(AttemptStatus.COMPLETED);
        attempt.setCompletedAt(LocalDateTime.now());
        attempt.setTotalTimeSeconds(durationSeconds);
        attempt.setScoreObtained(scoreObtained);
        attempt.setTotalMarks(totalPossibleMarks);
        attempt.setPercentage(percentage);
        attempt.setIsPassed(isPassed);
        attempt.setCorrectCount(correctCount);
        attempt.setWrongCount(wrongCount);
        attempt.setSkippedCount(skippedCount);
        attempt.setTotalQuestions(questions.size());
        attempt.setXpAwarded(xp);

        if (isPassed) {
            attempt.setCertificateCode("QT-CERT-" + UUID.randomUUID().toString().toUpperCase().substring(0, 12));
        }

        Attempt savedAttempt = attemptRepository.save(attempt);

        // Update user stats (XP, level, streaks)
        User user = attempt.getUser();
        user.addXp(xp);
        user.recordQuizActivity();
        userRepository.save(user);

        // Award Badges
        List<String> newlyEarnedBadges = badgeService.evaluateAndAwardBadges(user, savedAttempt);

        // Log Activity
        activityLogRepository.save(ActivityLog.builder()
            .user(user)
            .actionType("QUIZ_COMPLETED")
            .description(String.format("Completed '%s' with score %.2f%% (%s)",
                quiz.getTitle(), percentage, isPassed ? "PASSED" : "FAILED"))
            .build());

        return mapToResultDto(savedAttempt, newlyEarnedBadges);
    }

    @Transactional(readOnly = true)
    public AttemptResultDto getAttemptResult(Long attemptId, Long userId) {
        Attempt attempt = attemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this attempt result.");
        }

        return mapToResultDto(attempt, Collections.emptyList());
    }

    @Transactional(readOnly = true)
    public AttemptReviewDto getAttemptReview(Long attemptId, Long userId) {
        Attempt attempt = attemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this attempt review.");
        }

        List<Question> questions = questionRepository.findByQuizIdWithOptions(attempt.getQuiz().getId());
        Map<Long, AttemptAnswer> answerMap = attemptAnswerRepository.findByAttemptId(attemptId).stream()
            .collect(Collectors.toMap(a -> a.getQuestion().getId(), a -> a));

        List<ReviewQuestionDto> reviewQuestions = questions.stream().map(q -> {
            AttemptAnswer ans = answerMap.get(q.getId());
            List<Long> selectedIds = ans != null ? parseOptionIds(ans.getSelectedOptionIds()) : Collections.emptyList();
            boolean isSkipped = selectedIds.isEmpty();
            boolean isCorrect = ans != null && Boolean.TRUE.equals(ans.getIsCorrect());

            List<OptionAdminDto> optDtos = q.getOptions().stream().map(o -> OptionAdminDto.builder()
                .id(o.getId())
                .optionText(o.getOptionText())
                .isCorrect(o.getIsCorrect())
                .orderIndex(o.getOrderIndex())
                .build()).collect(Collectors.toList());

            return ReviewQuestionDto.builder()
                .questionId(q.getId())
                .questionText(q.getQuestionText())
                .questionType(q.getQuestionType())
                .marks(q.getMarks())
                .marksAwarded(ans != null ? ans.getMarksAwarded() : BigDecimal.ZERO)
                .explanation(q.getExplanation())
                .imageUrl(q.getImageUrl())
                .orderIndex(q.getOrderIndex())
                .options(optDtos)
                .userSelectedOptionIds(selectedIds)
                .isCorrect(isCorrect)
                .isSkipped(isSkipped)
                .timeSpentSeconds(ans != null ? ans.getTimeSpentSeconds() : 0)
                .build();
        }).collect(Collectors.toList());

        return AttemptReviewDto.builder()
            .attemptId(attempt.getId())
            .quizId(attempt.getQuiz().getId())
            .quizTitle(attempt.getQuiz().getTitle())
            .categoryName(attempt.getQuiz().getCategory().getName())
            .scoreObtained(attempt.getScoreObtained())
            .totalMarks(attempt.getTotalMarks())
            .percentage(attempt.getPercentage())
            .isPassed(attempt.getIsPassed())
            .correctCount(attempt.getCorrectCount())
            .wrongCount(attempt.getWrongCount())
            .skippedCount(attempt.getSkippedCount())
            .totalQuestions(attempt.getTotalQuestions())
            .totalTimeSeconds(attempt.getTotalTimeSeconds())
            .violationCount(attempt.getViolationCount())
            .status(attempt.getStatus().name())
            .completedAt(attempt.getCompletedAt())
            .questions(reviewQuestions)
            .build();
    }

    @Transactional(readOnly = true)
    public Page<AttemptHistoryItemDto> getUserAttemptHistory(Long userId, Pageable pageable) {
        return attemptRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable)
            .map(this::mapToHistoryItemDto);
    }

    @Transactional(readOnly = true)
    public AttemptHistoryItemDto verifyCertificate(String certificateCode) {
        Attempt attempt = attemptRepository.findByCertificateCode(certificateCode)
            .orElseThrow(() -> new ResourceNotFoundException("No valid certificate found with code: " + certificateCode));

        return mapToHistoryItemDto(attempt);
    }

    private Attempt validateActiveAttempt(Long attemptId, Long userId) {
        Attempt attempt = attemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResourceNotFoundException("Attempt not found with id: " + attemptId));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new BadRequestException("Unauthorized access to this attempt.");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new BadRequestException("This attempt has already been finalized or terminated.");
        }

        return attempt;
    }

    private List<Long> parseOptionIds(String json) {
        if (json == null || json.isBlank() || json.equals("[]")) {
            return Collections.emptyList();
        }
        try {
            return objectMapper.readValue(json, new TypeReference<List<Long>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    private AttemptResultDto mapToResultDto(Attempt attempt, List<String> newBadges) {
        return AttemptResultDto.builder()
            .attemptId(attempt.getId())
            .quizId(attempt.getQuiz().getId())
            .quizTitle(attempt.getQuiz().getTitle())
            .quizSlug(attempt.getQuiz().getSlug())
            .categoryName(attempt.getQuiz().getCategory().getName())
            .scoreObtained(attempt.getScoreObtained())
            .totalMarks(attempt.getTotalMarks())
            .percentage(attempt.getPercentage())
            .passPercentage(attempt.getQuiz().getPassPercentage())
            .isPassed(attempt.getIsPassed())
            .correctCount(attempt.getCorrectCount())
            .wrongCount(attempt.getWrongCount())
            .skippedCount(attempt.getSkippedCount())
            .totalQuestions(attempt.getTotalQuestions())
            .totalTimeSeconds(attempt.getTotalTimeSeconds())
            .xpAwarded(attempt.getXpAwarded())
            .certificateCode(attempt.getCertificateCode())
            .status(attempt.getStatus().name())
            .newlyEarnedBadges(newBadges)
            .build();
    }

    private AttemptHistoryItemDto mapToHistoryItemDto(Attempt attempt) {
        return AttemptHistoryItemDto.builder()
            .attemptId(attempt.getId())
            .quizId(attempt.getQuiz().getId())
            .quizTitle(attempt.getQuiz().getTitle())
            .quizSlug(attempt.getQuiz().getSlug())
            .categoryName(attempt.getQuiz().getCategory().getName())
            .scoreObtained(attempt.getScoreObtained())
            .totalMarks(attempt.getTotalMarks())
            .percentage(attempt.getPercentage())
            .isPassed(attempt.getIsPassed())
            .correctCount(attempt.getCorrectCount())
            .wrongCount(attempt.getWrongCount())
            .skippedCount(attempt.getSkippedCount())
            .totalTimeSeconds(attempt.getTotalTimeSeconds())
            .status(attempt.getStatus().name())
            .certificateCode(attempt.getCertificateCode())
            .completedAt(attempt.getCompletedAt())
            .build();
    }
}
