package com.quiztrack.service;

import com.quiztrack.dto.quiz.*;
import com.quiztrack.entity.*;
import com.quiztrack.exception.BadRequestException;
import com.quiztrack.exception.ResourceNotFoundException;
import com.quiztrack.repository.CategoryRepository;
import com.quiztrack.repository.QuestionRepository;
import com.quiztrack.repository.QuizRepository;
import com.quiztrack.repository.TagRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.text.Normalizer;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuizService {

    private final QuizRepository quizRepository;
    private final CategoryRepository categoryRepository;
    private final TagRepository tagRepository;
    private final QuestionRepository questionRepository;

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    @Transactional(readOnly = true)
    public Page<QuizSummaryDto> getPublishedQuizzes(Long categoryId, Difficulty difficulty, String search, Pageable pageable) {
        Page<Quiz> quizzes = quizRepository.findPublishedQuizzes(categoryId, difficulty, search, pageable);
        return quizzes.map(this::mapToSummaryDto);
    }

    @Transactional(readOnly = true)
    public QuizDetailDto getQuizBySlug(String slug) {
        Quiz quiz = quizRepository.findBySlug(slug)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with slug: " + slug));
        return mapToDetailDto(quiz);
    }

    @Transactional(readOnly = true)
    public QuizDetailDto getQuizById(Long id) {
        Quiz quiz = getQuizEntity(id);
        return mapToDetailDto(quiz);
    }

    @Transactional
    public QuizDetailDto createQuiz(QuizCreateRequest request, User author) {
        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        String slug = toSlug(request.getTitle());
        if (quizRepository.findBySlug(slug).isPresent()) {
            slug = slug + "-" + UUID.randomUUID().toString().substring(0, 6);
        }

        Set<Tag> tags = new HashSet<>();
        if (request.getTagNames() != null) {
            for (String tagName : request.getTagNames()) {
                String tagSlug = toSlug(tagName);
                Tag tag = tagRepository.findBySlug(tagSlug)
                    .orElseGet(() -> tagRepository.save(Tag.builder().name(tagName.trim()).slug(tagSlug).build()));
                tags.add(tag);
            }
        }

        Quiz quiz = Quiz.builder()
            .title(request.getTitle().trim())
            .slug(slug)
            .category(category)
            .createdByUser(author)
            .description(request.getDescription())
            .difficulty(request.getDifficulty())
            .durationMinutes(request.getDurationMinutes())
            .passPercentage(request.getPassPercentage() != null ? request.getPassPercentage() : new BigDecimal("60.00"))
            .negativeMarking(Boolean.TRUE.equals(request.getNegativeMarking()))
            .negativeMarkingDeduction(request.getNegativeMarkingDeduction() != null ? request.getNegativeMarkingDeduction() : new BigDecimal("0.25"))
            .perQuestionTimerSeconds(request.getPerQuestionTimerSeconds() != null ? request.getPerQuestionTimerSeconds() : 0)
            .isPublished(Boolean.TRUE.equals(request.getIsPublished()))
            .shuffleQuestions(request.getShuffleQuestions() == null || request.getShuffleQuestions())
            .shuffleOptions(request.getShuffleOptions() == null || request.getShuffleOptions())
            .maxViolationsAllowed(request.getMaxViolationsAllowed() != null ? request.getMaxViolationsAllowed() : 3)
            .tags(tags)
            .build();

        Quiz saved = quizRepository.save(quiz);
        return mapToDetailDto(saved);
    }

    @Transactional
    public QuizDetailDto updateQuiz(Long id, QuizCreateRequest request) {
        Quiz quiz = getQuizEntity(id);

        Category category = categoryRepository.findById(request.getCategoryId())
            .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        quiz.setTitle(request.getTitle().trim());
        quiz.setCategory(category);
        quiz.setDescription(request.getDescription());
        quiz.setDifficulty(request.getDifficulty());
        quiz.setDurationMinutes(request.getDurationMinutes());
        quiz.setPassPercentage(request.getPassPercentage());
        quiz.setNegativeMarking(Boolean.TRUE.equals(request.getNegativeMarking()));
        quiz.setNegativeMarkingDeduction(request.getNegativeMarkingDeduction());
        quiz.setPerQuestionTimerSeconds(request.getPerQuestionTimerSeconds());
        if (request.getIsPublished() != null) {
            quiz.setIsPublished(request.getIsPublished());
        }
        if (request.getShuffleQuestions() != null) {
            quiz.setShuffleQuestions(request.getShuffleQuestions());
        }
        if (request.getShuffleOptions() != null) {
            quiz.setShuffleOptions(request.getShuffleOptions());
        }
        if (request.getMaxViolationsAllowed() != null) {
            quiz.setMaxViolationsAllowed(request.getMaxViolationsAllowed());
        }

        if (request.getTagNames() != null) {
            Set<Tag> tags = new HashSet<>();
            for (String tagName : request.getTagNames()) {
                String tagSlug = toSlug(tagName);
                Tag tag = tagRepository.findBySlug(tagSlug)
                    .orElseGet(() -> tagRepository.save(Tag.builder().name(tagName.trim()).slug(tagSlug).build()));
                tags.add(tag);
            }
            quiz.setTags(tags);
        }

        Quiz updated = quizRepository.save(quiz);
        return mapToDetailDto(updated);
    }

    @Transactional
    public void deleteQuiz(Long id) {
        Quiz quiz = getQuizEntity(id);
        quizRepository.delete(quiz);
    }

    @Transactional
    public QuizDetailDto togglePublish(Long id) {
        Quiz quiz = getQuizEntity(id);
        quiz.setIsPublished(!quiz.getIsPublished());
        Quiz updated = quizRepository.save(quiz);
        return mapToDetailDto(updated);
    }

    @Transactional(readOnly = true)
    public List<CategoryDto> getCategories() {
        return categoryRepository.findAll().stream()
            .map(c -> CategoryDto.builder()
                .id(c.getId())
                .name(c.getName())
                .slug(c.getSlug())
                .description(c.getDescription())
                .iconName(c.getIconName())
                .colorCode(c.getColorCode())
                .quizCount(0L)
                .build())
            .collect(Collectors.toList());
    }

    public Quiz getQuizEntity(Long id) {
        return quizRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + id));
    }

    public QuizSummaryDto mapToSummaryDto(Quiz quiz) {
        List<String> tags = quiz.getTags().stream().map(Tag::getName).collect(Collectors.toList());
        long questionCount = questionRepository.countByQuizId(quiz.getId());
        BigDecimal totalMarks = quiz.getQuestions().stream()
            .map(Question::getMarks)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return QuizSummaryDto.builder()
            .id(quiz.getId())
            .title(quiz.getTitle())
            .slug(quiz.getSlug())
            .description(quiz.getDescription())
            .categoryId(quiz.getCategory().getId())
            .categoryName(quiz.getCategory().getName())
            .categoryColor(quiz.getCategory().getColorCode())
            .difficulty(quiz.getDifficulty())
            .durationMinutes(quiz.getDurationMinutes())
            .passPercentage(quiz.getPassPercentage())
            .negativeMarking(quiz.getNegativeMarking())
            .negativeMarkingDeduction(quiz.getNegativeMarkingDeduction())
            .perQuestionTimerSeconds(quiz.getPerQuestionTimerSeconds())
            .isPublished(quiz.getIsPublished())
            .questionCount((int) questionCount)
            .totalMarks(totalMarks)
            .tags(tags)
            .build();
    }

    public QuizDetailDto mapToDetailDto(Quiz quiz) {
        List<String> tags = quiz.getTags().stream().map(Tag::getName).collect(Collectors.toList());
        int questionCount = quiz.getQuestions().size();
        BigDecimal totalMarks = quiz.getQuestions().stream()
            .map(Question::getMarks)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        return QuizDetailDto.builder()
            .id(quiz.getId())
            .title(quiz.getTitle())
            .slug(quiz.getSlug())
            .description(quiz.getDescription())
            .categoryId(quiz.getCategory().getId())
            .categoryName(quiz.getCategory().getName())
            .categorySlug(quiz.getCategory().getSlug())
            .categoryColor(quiz.getCategory().getColorCode())
            .difficulty(quiz.getDifficulty())
            .durationMinutes(quiz.getDurationMinutes())
            .passPercentage(quiz.getPassPercentage())
            .negativeMarking(quiz.getNegativeMarking())
            .negativeMarkingDeduction(quiz.getNegativeMarkingDeduction())
            .perQuestionTimerSeconds(quiz.getPerQuestionTimerSeconds())
            .isPublished(quiz.getIsPublished())
            .shuffleQuestions(quiz.getShuffleQuestions())
            .shuffleOptions(quiz.getShuffleOptions())
            .maxViolationsAllowed(quiz.getMaxViolationsAllowed())
            .questionCount(questionCount)
            .totalMarks(totalMarks)
            .createdBy(quiz.getCreatedByUser().getFullName())
            .tags(tags)
            .createdAt(quiz.getCreatedAt())
            .build();
    }

    private String toSlug(String input) {
        String nowhitespace = WHITESPACE.matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = NONLATIN.matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
