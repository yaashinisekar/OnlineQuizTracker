package com.quiztrack.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.quiztrack.dto.attempt.AttemptResultDto;
import com.quiztrack.dto.attempt.SubmitAttemptRequest;
import com.quiztrack.entity.*;
import com.quiztrack.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AttemptServiceTest {

    @Mock
    private AttemptRepository attemptRepository;
    @Mock
    private AttemptAnswerRepository attemptAnswerRepository;
    @Mock
    private QuizRepository quizRepository;
    @Mock
    private QuestionRepository questionRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ActivityLogRepository activityLogRepository;
    @Mock
    private BadgeService badgeService;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private AttemptService attemptService;

    private User testUser;
    private Quiz testQuiz;
    private Attempt testAttempt;
    private Question question1;
    private Option opt1, opt2;

    @BeforeEach
    void setUp() {
        testUser = User.builder()
            .id(1L)
            .email("test@quiztrack.io")
            .firstName("Test")
            .lastName("Candidate")
            .xpPoints(100)
            .currentLevel(1)
            .currentStreak(1)
            .build();

        Category category = Category.builder().id(1L).name("Web Development").build();

        testQuiz = Quiz.builder()
            .id(1L)
            .title("React Basics")
            .category(category)
            .durationMinutes(15)
            .passPercentage(new BigDecimal("60.00"))
            .negativeMarking(false)
            .build();

        opt1 = Option.builder().id(101L).optionText("Correct").isCorrect(true).build();
        opt2 = Option.builder().id(102L).optionText("Wrong").isCorrect(false).build();

        question1 = Question.builder()
            .id(10L)
            .quiz(testQuiz)
            .questionText("Sample Question?")
            .questionType(QuestionType.SINGLE)
            .marks(new BigDecimal("2.00"))
            .options(Arrays.asList(opt1, opt2))
            .build();

        testAttempt = Attempt.builder()
            .id(100L)
            .user(testUser)
            .quiz(testQuiz)
            .status(AttemptStatus.IN_PROGRESS)
            .startedAt(LocalDateTime.now())
            .violationCount(0)
            .build();
    }

    @Test
    @DisplayName("Should evaluate correct answer and award full marks")
    void testSubmitAttempt_CorrectAnswer() {
        AttemptAnswer answer = AttemptAnswer.builder()
            .id(50L)
            .attempt(testAttempt)
            .question(question1)
            .selectedOptionIds("[101]") // Selected correct option
            .build();

        when(attemptRepository.findById(100L)).thenReturn(Optional.of(testAttempt));
        when(questionRepository.findByQuizIdWithOptions(1L)).thenReturn(Collections.singletonList(question1));
        when(attemptAnswerRepository.findByAttemptId(100L)).thenReturn(Collections.singletonList(answer));
        when(attemptRepository.save(any(Attempt.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(badgeService.evaluateAndAwardBadges(any(), any())).thenReturn(Collections.emptyList());

        AttemptResultDto result = attemptService.submitAttempt(100L, 1L, new SubmitAttemptRequest(120));

        assertNotNull(result);
        assertEquals(1, result.getCorrectCount());
        assertEquals(0, result.getWrongCount());
        assertEquals(new BigDecimal("2.00"), result.getScoreObtained());
        assertEquals(new BigDecimal("100.00"), result.getPercentage());
        assertTrue(result.getIsPassed());
        assertNotNull(result.getCertificateCode());
    }

    @Test
    @DisplayName("Should evaluate wrong answer with negative marking deduction")
    void testSubmitAttempt_NegativeMarking() {
        testQuiz.setNegativeMarking(true);
        testQuiz.setNegativeMarkingDeduction(new BigDecimal("0.50"));

        AttemptAnswer answer = AttemptAnswer.builder()
            .id(50L)
            .attempt(testAttempt)
            .question(question1)
            .selectedOptionIds("[102]") // Selected incorrect option
            .build();

        when(attemptRepository.findById(100L)).thenReturn(Optional.of(testAttempt));
        when(questionRepository.findByQuizIdWithOptions(1L)).thenReturn(Collections.singletonList(question1));
        when(attemptAnswerRepository.findByAttemptId(100L)).thenReturn(Collections.singletonList(answer));
        when(attemptRepository.save(any(Attempt.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(badgeService.evaluateAndAwardBadges(any(), any())).thenReturn(Collections.emptyList());

        AttemptResultDto result = attemptService.submitAttempt(100L, 1L, new SubmitAttemptRequest(120));

        assertNotNull(result);
        assertEquals(0, result.getCorrectCount());
        assertEquals(1, result.getWrongCount());
        assertFalse(result.getIsPassed());
    }
}
