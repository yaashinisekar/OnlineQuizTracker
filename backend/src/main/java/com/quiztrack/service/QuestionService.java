package com.quiztrack.service;

import com.quiztrack.dto.question.*;
import com.quiztrack.entity.Option;
import com.quiztrack.entity.Question;
import com.quiztrack.entity.Quiz;
import com.quiztrack.exception.BadRequestException;
import com.quiztrack.exception.ResourceNotFoundException;
import com.quiztrack.repository.OptionRepository;
import com.quiztrack.repository.QuestionRepository;
import com.quiztrack.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;
    private final QuizRepository quizRepository;

    @Transactional(readOnly = true)
    public List<QuestionAdminDto> getQuestionsByQuizId(Long quizId) {
        return questionRepository.findByQuizIdOrderByOrderIndexAsc(quizId).stream()
            .map(this::mapToAdminDto)
            .collect(Collectors.toList());
    }

    @Transactional
    public QuestionAdminDto createQuestion(Long quizId, QuestionCreateRequest request) {
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        validateOptions(request.getOptions());

        int nextOrder = request.getOrderIndex() != null ? request.getOrderIndex() : (int) questionRepository.countByQuizId(quizId) + 1;

        Question question = Question.builder()
            .quiz(quiz)
            .questionText(request.getQuestionText().trim())
            .questionType(request.getQuestionType())
            .marks(request.getMarks())
            .explanation(request.getExplanation())
            .imageUrl(request.getImageUrl())
            .orderIndex(nextOrder)
            .build();

        Question saved = questionRepository.save(question);

        List<Option> options = new ArrayList<>();
        int optOrder = 1;
        for (OptionAdminDto optDto : request.getOptions()) {
            Option option = Option.builder()
                .question(saved)
                .optionText(optDto.getOptionText().trim())
                .isCorrect(Boolean.TRUE.equals(optDto.getIsCorrect()))
                .orderIndex(optDto.getOrderIndex() != null ? optDto.getOrderIndex() : optOrder++)
                .build();
            options.add(optionRepository.save(option));
        }

        saved.setOptions(options);
        return mapToAdminDto(saved);
    }

    @Transactional
    public QuestionAdminDto updateQuestion(Long questionId, QuestionCreateRequest request) {
        Question question = questionRepository.findById(questionId)
            .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));

        validateOptions(request.getOptions());

        question.setQuestionText(request.getQuestionText().trim());
        question.setQuestionType(request.getQuestionType());
        question.setMarks(request.getMarks());
        question.setExplanation(request.getExplanation());
        question.setImageUrl(request.getImageUrl());
        if (request.getOrderIndex() != null) {
            question.setOrderIndex(request.getOrderIndex());
        }

        // Replace options
        optionRepository.deleteAll(question.getOptions());
        question.getOptions().clear();

        List<Option> newOptions = new ArrayList<>();
        int optOrder = 1;
        for (OptionAdminDto optDto : request.getOptions()) {
            Option option = Option.builder()
                .question(question)
                .optionText(optDto.getOptionText().trim())
                .isCorrect(Boolean.TRUE.equals(optDto.getIsCorrect()))
                .orderIndex(optDto.getOrderIndex() != null ? optDto.getOrderIndex() : optOrder++)
                .build();
            newOptions.add(optionRepository.save(option));
        }

        question.setOptions(newOptions);
        Question updated = questionRepository.save(question);
        return mapToAdminDto(updated);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        Question question = questionRepository.findById(questionId)
            .orElseThrow(() -> new ResourceNotFoundException("Question not found with id: " + questionId));
        questionRepository.delete(question);
    }

    private void validateOptions(List<OptionAdminDto> options) {
        if (options == null || options.size() < 2) {
            throw new BadRequestException("Each question must contain at least 2 options.");
        }
        boolean hasCorrect = options.stream().anyMatch(o -> Boolean.TRUE.equals(o.getIsCorrect()));
        if (!hasCorrect) {
            throw new BadRequestException("At least one option must be marked as correct.");
        }
    }

    public QuestionAdminDto mapToAdminDto(Question question) {
        List<OptionAdminDto> optionDtos = question.getOptions().stream()
            .map(o -> OptionAdminDto.builder()
                .id(o.getId())
                .optionText(o.getOptionText())
                .isCorrect(o.getIsCorrect())
                .orderIndex(o.getOrderIndex())
                .build())
            .collect(Collectors.toList());

        return QuestionAdminDto.builder()
            .id(question.getId())
            .quizId(question.getQuiz().getId())
            .questionText(question.getQuestionText())
            .questionType(question.getQuestionType())
            .marks(question.getMarks())
            .explanation(question.getExplanation())
            .imageUrl(question.getImageUrl())
            .orderIndex(question.getOrderIndex())
            .options(optionDtos)
            .build();
    }
}
