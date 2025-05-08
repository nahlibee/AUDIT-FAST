package com.sapaudit.auth.exception;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.NoHandlerFoundException;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Global exception handler for centralized exception handling across the application.
 * This class handles various exceptions and returns appropriate HTTP responses.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    private static final String LOG_FORMAT = "Exception handled: {} - {}";
    
    // ========== Custom application exceptions ==========

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleResourceNotFoundException(ResourceNotFoundException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), ex.getMessage());
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(ex.getMessage())
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<ApiError> handleUserAlreadyExistsException(UserAlreadyExistsException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), ex.getMessage());
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error(HttpStatus.CONFLICT.getReasonPhrase())
                .message(ex.getMessage())
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.CONFLICT);
    }

    @ExceptionHandler(UnauthorizedAccessException.class)
    public ResponseEntity<ApiError> handleUnauthorizedAccessException(UnauthorizedAccessException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), ex.getMessage());
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error(HttpStatus.FORBIDDEN.getReasonPhrase())
                .message(ex.getMessage())
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.FORBIDDEN);
    }
    
    // ========== Security exceptions ==========

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDeniedException(AccessDeniedException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), ex.getMessage());
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.FORBIDDEN.value())
                .error(HttpStatus.FORBIDDEN.getReasonPhrase())
                .message("You don't have permission to access this resource")
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.FORBIDDEN);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiError> handleBadCredentialsException(BadCredentialsException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), "Invalid login attempt");
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message("Invalid username or password")
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiError> handleUsernameNotFoundException(UsernameNotFoundException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), ex.getMessage());
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message(ex.getMessage())
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.UNAUTHORIZED);
    }
    
    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiError> handleDisabledException(DisabledException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), "Disabled account login attempt");
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message("Account is disabled")
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.UNAUTHORIZED);
    }
    
    @ExceptionHandler(LockedException.class)
    public ResponseEntity<ApiError> handleLockedException(LockedException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), "Locked account login attempt");
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message("Account is locked")
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.UNAUTHORIZED);
    }
    
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthenticationException(AuthenticationException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), ex.getMessage());
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNAUTHORIZED.value())
                .error(HttpStatus.UNAUTHORIZED.getReasonPhrase())
                .message("Authentication failed")
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.UNAUTHORIZED);
    }
    
    // ========== Validation exceptions ==========

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ValidationApiError> handleMethodArgumentNotValidException(MethodArgumentNotValidException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), "Validation failed");
        
        // Extract field-specific validation errors
        Map<String, String> errors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            errors.put(error.getField(), error.getDefaultMessage());
        }
        
        // Extract global validation errors
        for (ObjectError error : ex.getBindingResult().getGlobalErrors()) {
            errors.put(error.getObjectName(), error.getDefaultMessage());
        }
        
        ValidationApiError apiError = ValidationApiError.validationBuilder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Validation failed")
                .path(extractPath(request))
                .errors(errors)
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ValidationApiError> handleConstraintViolationException(ConstraintViolationException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), "Constraint validation failed");
        
        Map<String, String> errors = ex.getConstraintViolations().stream()
                .collect(Collectors.toMap(
                        violation -> violation.getPropertyPath().toString(),
                        ConstraintViolation::getMessage,
                        (error1, error2) -> error1 + ", " + error2
                ));
        
        ValidationApiError apiError = ValidationApiError.validationBuilder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Constraint validation failed")
                .path(extractPath(request))
                .errors(errors)
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ApiError> handleMissingServletRequestParameterException(MissingServletRequestParameterException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), ex.getMessage());
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(ex.getMessage())
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiError> handleMethodArgumentTypeMismatchException(MethodArgumentTypeMismatchException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), ex.getMessage());
        
        String message = String.format("Parameter '%s' should be of type '%s'", 
                ex.getName(), ex.getRequiredType().getSimpleName());
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message(message)
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), ex.getMessage());
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.BAD_REQUEST.value())
                .error(HttpStatus.BAD_REQUEST.getReasonPhrase())
                .message("Malformed JSON request")
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }
    
    // ========== HTTP request exceptions ==========
    
    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ApiError> handleHttpRequestMethodNotSupportedException(HttpRequestMethodNotSupportedException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), ex.getMessage());
        
        StringBuilder message = new StringBuilder("Method ");
        message.append(ex.getMethod()).append(" is not supported for this endpoint. ");
        
        if (ex.getSupportedHttpMethods() != null && !ex.getSupportedHttpMethods().isEmpty()) {
            message.append("Supported methods are: ");
            message.append(ex.getSupportedHttpMethods().stream()
                    .map(HttpMethod::name)
                    .collect(Collectors.joining(", ")));
        }
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.METHOD_NOT_ALLOWED.value())
                .error(HttpStatus.METHOD_NOT_ALLOWED.getReasonPhrase())
                .message(message.toString())
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.METHOD_NOT_ALLOWED);
    }
    
    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ApiError> handleHttpMediaTypeNotSupportedException(HttpMediaTypeNotSupportedException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), ex.getMessage());
        
        StringBuilder message = new StringBuilder("Media type ");
        message.append(ex.getContentType()).append(" is not supported. ");
        
        if (ex.getSupportedMediaTypes() != null && !ex.getSupportedMediaTypes().isEmpty()) {
            message.append("Supported media types are: ");
            message.append(ex.getSupportedMediaTypes().stream()
                    .map(Object::toString)
                    .collect(Collectors.joining(", ")));
        }
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.UNSUPPORTED_MEDIA_TYPE.value())
                .error(HttpStatus.UNSUPPORTED_MEDIA_TYPE.getReasonPhrase())
                .message(message.toString())
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.UNSUPPORTED_MEDIA_TYPE);
    }
    
    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ApiError> handleNoHandlerFoundException(NoHandlerFoundException ex, WebRequest request) {
        log.warn(LOG_FORMAT, ex.getClass().getName(), ex.getMessage());
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.NOT_FOUND.value())
                .error(HttpStatus.NOT_FOUND.getReasonPhrase())
                .message(String.format("No handler found for %s %s", ex.getHttpMethod(), ex.getRequestURL()))
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
    }
    
    // ========== Database exceptions ==========
    
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> handleDataIntegrityViolationException(DataIntegrityViolationException ex, WebRequest request) {
        log.error(LOG_FORMAT, ex.getClass().getName(), ex.getMessage());
        
        String message = "Database error occurred";
        // Check for common constraint violations
        if (ex.getMessage().contains("unique constraint") || 
            ex.getMessage().contains("Duplicate entry")) {
            message = "A resource with the same identifier already exists";
        } else if (ex.getMessage().contains("foreign key constraint")) {
            message = "Cannot delete or update a parent row referenced by other records";
        }
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.CONFLICT.value())
                .error(HttpStatus.CONFLICT.getReasonPhrase())
                .message(message)
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.CONFLICT);
    }
    
    // ========== Fallback exception handler ==========
    
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGlobalException(Exception ex, WebRequest request) {
        // Log with stacktrace for unexpected exceptions
        log.error("Unhandled exception occurred", ex);
        
        ApiError apiError = ApiError.builder()
                .timestamp(LocalDateTime.now())
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .error(HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase())
                .message("An unexpected error occurred")
                .path(extractPath(request))
                .build();
        
        return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
    
    // ========== Helper methods ==========
    
    /**
     * Extracts the request path from WebRequest
     */
    private String extractPath(WebRequest request) {
        return request.getDescription(false).replace("uri=", "");
    }
    
    // ========== Error response models ==========
    
    /**
     * Standard API error response
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ApiError {
        private LocalDateTime timestamp;
        private int status;
        private String error;
        private String message;
        private String path;
    }
    
    /**
     * Extended API error response for validation errors
     */
    @Data
    @EqualsAndHashCode(callSuper = true)
    public static class ValidationApiError extends ApiError {
        private Map<String, String> errors;
        
        @Builder(builderMethodName = "validationBuilder")
        public ValidationApiError(LocalDateTime timestamp, int status, String error, 
                                String message, String path, Map<String, String> errors) {
            super(timestamp, status, error, message, path);
            this.errors = errors;
        }
    }
}