package com.srtk.journeygram.config;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.client.HttpClientErrorException;

import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(HttpClientErrorException.class)
    public ResponseEntity<?> handleHttpClientError(HttpClientErrorException e) {
        // Return the actual status code from the external API (e.g. 401, 404, 429)
        return ResponseEntity.status(e.getStatusCode())
                .body(Map.of(
                    "error", "External API Error",
                    "message", e.getMessage(),
                    "status", e.getStatusCode().value()
                ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "error", "Server Error",
                    "message", e.getMessage()
                ));
    }
}
