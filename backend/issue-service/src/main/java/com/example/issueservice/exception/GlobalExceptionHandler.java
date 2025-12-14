package com.example.issueservice.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    // 400 ошибка валидации полей (для @Valid)
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidation(MethodArgumentNotValidException ex,
                                                   HttpServletRequest request) {
        var errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField,
                        FieldError::getDefaultMessage,
                        (m1, m2) -> m1));

        log.warn("Validation failed for {} {}: {}", request.getMethod(), request.getRequestURI(), errors);

        var body = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", HttpStatus.BAD_REQUEST.value(),
                "error", HttpStatus.BAD_REQUEST.getReasonPhrase(),
                "path", request.getRequestURI(),
                "method", request.getMethod(),
                "errors", errors
        );
        return ResponseEntity.badRequest().body(body);
    }

    // 400 ошибка загрузки файла
    @ExceptionHandler(FileUploadException.class)
    public ResponseEntity<Object> handleFileUpload(FileUploadException ex,
                                                   HttpServletRequest request) {
        log.warn("File upload failed for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 400 ошибка валидации иерархии задач
    @ExceptionHandler(InvalidIssueHierarchyException.class)
    public ResponseEntity<Object> handleInvalidHierarchy(InvalidIssueHierarchyException ex,
                                                         HttpServletRequest request) {
        log.warn("Invalid issue hierarchy for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 400 ошибка валидации перехода статуса
    @ExceptionHandler(InvalidStatusTransitionException.class)
    public ResponseEntity<Object> handleInvalidTransition(InvalidStatusTransitionException ex,
                                                          HttpServletRequest request) {
        log.warn("Invalid status transition for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 400 роль в задаче уже назначена
    @ExceptionHandler(RoleAlreadyAssignedException.class)
    public ResponseEntity<Object> handleRoleAlreadyAssigned(RoleAlreadyAssignedException ex,
                                                            HttpServletRequest request) {
        log.warn("Role already assigned for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 400 родительская задача не принадлежит проекту
    @ExceptionHandler(IssueNotInProjectException.class)
    public ResponseEntity<Object> handleIssueNotInProject(IssueNotInProjectException ex,
                                                          HttpServletRequest request) {
        log.warn("Issue not in project for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 403 доступ запрещен
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDenied(AccessDeniedException ex,
                                                     HttpServletRequest request) {
        log.warn("Access denied for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request);
    }

    // 404 задача не найдена
    @ExceptionHandler(IssueNotFoundException.class)
    public ResponseEntity<Object> handleIssueNotFound(IssueNotFoundException ex,
                                                      HttpServletRequest request) {
        log.warn("Issue not found for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // 404 пользователь не найден
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Object> handleUserNotFound(UserNotFoundException ex,
                                                     HttpServletRequest request) {
        log.warn("User not found for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // 404 тег не найден
    @ExceptionHandler(ProjectTagNotFoundException.class)
    public ResponseEntity<Object> handleProjectTagNotFound(ProjectTagNotFoundException ex,
                                                           HttpServletRequest request) {
        log.warn("Project tag not found for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // 404 комментарий не найден
    @ExceptionHandler(CommentNotFoundException.class)
    public ResponseEntity<Object> handleCommentNotFound(CommentNotFoundException ex,
                                                        HttpServletRequest request) {
        log.warn("Comment not found for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // 404 проект не найден
    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<Object> handleProjectNotFound(ProjectNotFoundException ex,
                                                        HttpServletRequest request) {
        log.warn("Project not found for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // 404 файл не найден
    @ExceptionHandler(AttachmentNotFoundException.class)
    public ResponseEntity<Object> handleProjectNotFound(AttachmentNotFoundException ex,
                                                        HttpServletRequest request) {
        log.warn("Attachment not found for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // 409 тег уже существует
    @ExceptionHandler(TagAlreadyExistsException.class)
    public ResponseEntity<Object> handleTagAlreadyExists(TagAlreadyExistsException ex,
                                                        HttpServletRequest request) {
        log.warn("Conflict for tag {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    // 503 сервис недоступен
    @ExceptionHandler(ServiceUnavailableException.class)
    public ResponseEntity<Object> handleServiceUnavailable(ServiceUnavailableException ex,
                                                           HttpServletRequest request) {
        log.error("Service unavailable for {} {}: {}",
                request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.SERVICE_UNAVAILABLE, ex.getMessage(), request);
    }

    // 500 неожиданная ошибка
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllUncaughtException(Exception ex,
                                                             HttpServletRequest request) {
        log.error("Uncaught exception at {} {}", request.getMethod(), request.getRequestURI(), ex);
        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal server error. Please contact support.",
                request
        );
    }

    // Универсальный маппер ответа
    private ResponseEntity<Object> buildResponse(HttpStatus status, String message,
                                                 HttpServletRequest request) {
        var body = Map.of(
                "timestamp", LocalDateTime.now().toString(),
                "status", status.value(),
                "error", status.getReasonPhrase(),
                "message", message,
                "path", request.getRequestURI(),
                "method", request.getMethod()
        );
        return ResponseEntity.status(status).body(body);
    }
}