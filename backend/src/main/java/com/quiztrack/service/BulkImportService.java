package com.quiztrack.service;

import com.quiztrack.dto.question.BulkImportResultDto;
import com.quiztrack.entity.*;
import com.quiztrack.exception.BadRequestException;
import com.quiztrack.exception.ResourceNotFoundException;
import com.quiztrack.repository.OptionRepository;
import com.quiztrack.repository.QuestionRepository;
import com.quiztrack.repository.QuizRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.csv.CSVFormat;
import org.apache.commons.csv.CSVParser;
import org.apache.commons.csv.CSVRecord;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class BulkImportService {

    private final QuizRepository quizRepository;
    private final QuestionRepository questionRepository;
    private final OptionRepository optionRepository;

    @Transactional
    public BulkImportResultDto importQuestions(Long quizId, MultipartFile file) {
        Quiz quiz = quizRepository.findById(quizId)
            .orElseThrow(() -> new ResourceNotFoundException("Quiz not found with id: " + quizId));

        String filename = file.getOriginalFilename();
        if (filename == null) {
            throw new BadRequestException("Uploaded file name is invalid.");
        }

        if (filename.endsWith(".csv")) {
            return importFromCsv(quiz, file);
        } else if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
            return importFromExcel(quiz, file);
        } else {
            throw new BadRequestException("Unsupported file format. Please upload CSV or Excel (.xlsx) file.");
        }
    }

    private BulkImportResultDto importFromCsv(Quiz quiz, MultipartFile file) {
        int processed = 0;
        int imported = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8));
             CSVParser csvParser = new CSVParser(reader, CSVFormat.DEFAULT.builder().setHeader().setSkipHeaderRecord(true).setIgnoreHeaderCase(true).setTrim(true).build())) {

            int order = (int) questionRepository.countByQuizId(quiz.getId()) + 1;

            for (CSVRecord record : csvParser) {
                processed++;
                try {
                    String qText = record.get("QuestionText");
                    String qTypeStr = record.isSet("QuestionType") ? record.get("QuestionType") : "SINGLE";
                    String marksStr = record.isSet("Marks") ? record.get("Marks") : "1.00";
                    String explanation = record.isSet("Explanation") ? record.get("Explanation") : "";

                    QuestionType qType = "MULTI".equalsIgnoreCase(qTypeStr) ? QuestionType.MULTI : QuestionType.SINGLE;
                    BigDecimal marks = new BigDecimal(marksStr);

                    Question question = questionRepository.save(Question.builder()
                        .quiz(quiz)
                        .questionText(qText)
                        .questionType(qType)
                        .marks(marks)
                        .explanation(explanation)
                        .orderIndex(order++)
                        .build());

                    // Save 4 options
                    int optOrder = 1;
                    for (int i = 1; i <= 4; i++) {
                        String optHeader = "Option" + i;
                        String correctHeader = "Option" + i + "Correct";
                        if (record.isSet(optHeader) && !record.get(optHeader).isBlank()) {
                            boolean isCorrect = record.isSet(correctHeader) && Boolean.parseBoolean(record.get(correctHeader));
                            optionRepository.save(Option.builder()
                                .question(question)
                                .optionText(record.get(optHeader))
                                .isCorrect(isCorrect)
                                .orderIndex(optOrder++)
                                .build());
                        }
                    }

                    imported++;
                } catch (Exception ex) {
                    failed++;
                    errors.add("Row " + processed + ": " + ex.getMessage());
                }
            }

        } catch (Exception e) {
            log.error("Failed to parse CSV question file", e);
            throw new BadRequestException("Failed to read CSV file: " + e.getMessage());
        }

        return BulkImportResultDto.builder()
            .totalRowsProcessed(processed)
            .totalImported(imported)
            .failedCount(failed)
            .errors(errors)
            .build();
    }

    private BulkImportResultDto importFromExcel(Quiz quiz, MultipartFile file) {
        int processed = 0;
        int imported = 0;
        int failed = 0;
        List<String> errors = new ArrayList<>();

        try (Workbook workbook = WorkbookFactory.create(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            int order = (int) questionRepository.countByQuizId(quiz.getId()) + 1;

            // Row 0 is header
            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                Row row = sheet.getRow(r);
                if (row == null) continue;
                processed++;

                try {
                    String qText = getCellString(row.getCell(0));
                    if (qText == null || qText.isBlank()) continue;

                    String qTypeStr = getCellString(row.getCell(1));
                    String marksStr = getCellString(row.getCell(2));
                    String explanation = getCellString(row.getCell(3));

                    QuestionType qType = "MULTI".equalsIgnoreCase(qTypeStr) ? QuestionType.MULTI : QuestionType.SINGLE;
                    BigDecimal marks = marksStr != null && !marksStr.isBlank() ? new BigDecimal(marksStr) : BigDecimal.ONE;

                    Question question = questionRepository.save(Question.builder()
                        .quiz(quiz)
                        .questionText(qText)
                        .questionType(qType)
                        .marks(marks)
                        .explanation(explanation)
                        .orderIndex(order++)
                        .build());

                    // Options at cells 4 (opt1), 5 (corr1), 6 (opt2), 7 (corr2), 8 (opt3), 9 (corr3), 10 (opt4), 11 (corr4)
                    int optOrder = 1;
                    for (int o = 4; o <= 10; o += 2) {
                        String optText = getCellString(row.getCell(o));
                        String corrText = getCellString(row.getCell(o + 1));
                        if (optText != null && !optText.isBlank()) {
                            boolean isCorrect = "true".equalsIgnoreCase(corrText) || "1".equals(corrText) || "yes".equalsIgnoreCase(corrText);
                            optionRepository.save(Option.builder()
                                .question(question)
                                .optionText(optText)
                                .isCorrect(isCorrect)
                                .orderIndex(optOrder++)
                                .build());
                        }
                    }

                    imported++;
                } catch (Exception ex) {
                    failed++;
                    errors.add("Row " + (r + 1) + ": " + ex.getMessage());
                }
            }
        } catch (Exception e) {
            log.error("Failed to parse Excel question file", e);
            throw new BadRequestException("Failed to read Excel file: " + e.getMessage());
        }

        return BulkImportResultDto.builder()
            .totalRowsProcessed(processed)
            .totalImported(imported)
            .failedCount(failed)
            .errors(errors)
            .build();
    }

    private String getCellString(Cell cell) {
        if (cell == null) return null;
        DataFormatter formatter = new DataFormatter();
        return formatter.formatCellValue(cell).trim();
    }
}
