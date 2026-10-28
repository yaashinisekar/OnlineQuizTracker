package com.quiztrack.dto.question;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkImportResultDto {
    private int totalRowsProcessed;
    private int totalImported;
    private int failedCount;
    @Builder.Default
    private List<String> errors = new ArrayList<>();
}
