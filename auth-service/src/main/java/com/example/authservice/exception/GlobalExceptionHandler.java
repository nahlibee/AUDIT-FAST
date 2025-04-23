package com.example.authservice.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(TokenRefreshException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleTokenRefreshException(TokenRefreshException ex, WebRequest request) {
        return new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                new Date(),
                ex.getMessage(),
                request.getDescription(false));
    }
    
    @ExceptionHandler(BadCredentialsException.class)
    @ResponseStatus(HttpStatus.UNAUTHORIZED)
    public ErrorResponse handleBadCredentialsException(BadCredentialsException ex, WebRequest request) {
        return new ErrorResponse(
                HttpStatus.UNAUTHORIZED.value(),
                new Date(),
                "Invalid username or password",
                request.getDescription(false));
    }
    
    @ExceptionHandler(AccessDeniedException.class)
    @ResponseStatus(HttpStatus.FORBIDDEN)
    public ErrorResponse handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        return new ErrorResponse(
                HttpStatus.FORBIDDEN.value(),
                new Date(),
                "You don't have permission to access this resource",
                request.getDescription(false));
    }
    
    @ExceptionHandler(Exception.class)
    @ResponseStatus(HttpStatus.INTERNAL_SERVER_ERROR)
    public ErrorResponse handleGlobalException(Exception ex, WebRequest request) {
        return new ErrorResponse(
                HttpStatus.INTERNAL_SERVER_ERROR.value(),
                new Date(),
                ex.getMessage(),
                request.getDescription(false));
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        
        ValidationErrorResponse errorResponse = new ValidationErrorResponse(
                HttpStatus.BAD_REQUEST.value(),
                new Date(),
                "Validation Error",
                errors);
        
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }
    
    // Inner class for standard error responses
    public static class ErrorResponse {
        private int status;
        private Date timestamp;
        private String message;
        private String details;
        
        public ErrorResponse(int status, Date timestamp, String message, String details) {
            this.status = status;
            this.timestamp = timestamp;
            this.message = message;
            this.details = details;
        }
        
        // Getters
        public int getStatus() {
            return status;
        }
        
        public Date getTimestamp() {
            return timestamp;
        }
        
        public String getMessage() {
            return message;
        }
        
        public String getDetails() {
            return details;
        }
    }
    
    // Inner class for validation error responses
    public static class ValidationErrorResponse extends ErrorResponse {
        private Map<String, String> errors;
        
        public ValidationErrorResponse(int status, Date timestamp, String message, Map<String, String> errors) {
            super(status, timestamp, message, "Validation failed");
            this.errors = errors;
        }
        
        public Map<String, String> getErrors() {
            return errors;
        }
    }
}