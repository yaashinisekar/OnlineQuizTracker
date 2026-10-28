package com.quiztrack.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.FORBIDDEN)
public class AntiCheatViolationException extends RuntimeException {
    public AntiCheatViolationException(String message) {
        super(message);
    }
}
