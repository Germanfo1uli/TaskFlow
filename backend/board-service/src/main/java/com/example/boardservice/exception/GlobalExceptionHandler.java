package com.example.boardservice.exception;

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

    // 400 Кастом ошибка валидации (для файлов)
    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<Object> handleInvalidCredentials(InvalidFileException ex,
                                                           HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 400 Невалидное приглашение
    @ExceptionHandler(InvalidInviteException.class)
    public ResponseEntity<Object> handleInvalidInvite(InvalidInviteException ex,
                                                      HttpServletRequest request) {
        log.warn("Invalid invite for {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 400 Пользователь уже является участником проекта
    @ExceptionHandler(AlreadyMemberException.class)
    public ResponseEntity<Object> handleAlreadyMember(AlreadyMemberException ex,
                                                      HttpServletRequest request) {
        log.warn("Member already exists for {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 400 Невалидная комбинация permission в матрице
    @ExceptionHandler(InvalidPermissionException.class)
    public ResponseEntity<Object> handleInvalidPermission(InvalidPermissionException ex,
                                                          HttpServletRequest request) {
        log.warn("Invalid permission for {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 400 Роль не принадлежит проекту
    @ExceptionHandler(RoleNotInProjectException.class)
    public ResponseEntity<Object> handleRoleNotInProject(RoleNotInProjectException ex,
                                                         HttpServletRequest request) {
        log.warn("Role mismatch for {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 400 Невалидное имя роли
    @ExceptionHandler(InvalidRoleNameException.class)
    public ResponseEntity<Object> handleInvalidRoleName(InvalidRoleNameException ex,
                                                        HttpServletRequest request) {
        log.warn("Invalid role name for {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 401 Ошибка аутентификации между сервисами
    @ExceptionHandler(ServiceAuthException.class)
    public ResponseEntity<Object> handleServiceAuth(ServiceAuthException ex,
                                                    HttpServletRequest request) {
        log.error("Service auth error for {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    // 403 Доступ запрещен (нет прав на действие)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleAccessDenied(AccessDeniedException ex,
                                                     HttpServletRequest request) {
        log.warn("Access denied for {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request);
    }

    // 403 Проект удален (soft delete)
    @ExceptionHandler(ProjectDeletedException.class)
    public ResponseEntity<Object> handleProjectDeleted(ProjectDeletedException ex,
                                                       HttpServletRequest request) {
        log.warn("Attempt to access deleted project at {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.FORBIDDEN, ex.getMessage(), request);
    }

    // 404 Пользователь не найден в проекте
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Object> handleUserNotFound(UserNotFoundException ex,
                                                     HttpServletRequest request) {
        log.warn("User not found for {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // 404 Роль не найдена
    @ExceptionHandler(RoleNotFoundException.class)
    public ResponseEntity<Object> handleRoleNotFound(RoleNotFoundException ex,
                                                     HttpServletRequest request) {
        log.warn("Role not found for {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // 404 Проект не найден
    @ExceptionHandler(ProjectNotFoundException.class)
    public ResponseEntity<Object> handleProjectNotFound(ProjectNotFoundException ex,
                                                        HttpServletRequest request) {
        log.warn("Project not found for {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // 500 Отсутствует дефолтная роль
    @ExceptionHandler(MissingDefaultRoleException.class)
    public ResponseEntity<Object> handleMissingDefaultRole(MissingDefaultRoleException ex,
                                                           HttpServletRequest request) {
        log.error("Missing default role for {} {}: {}", request.getMethod(), request.getRequestURI(), ex.getMessage());
        return buildResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "System configuration error: " + ex.getMessage(), request);
    }

    // 500 Обработка всех остальных неожиданных исключений
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