package com.example.userservice.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import java.nio.file.AccessDeniedException;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
@Slf4j
@RequiredArgsConstructor
public class GlobalExceptionHandler {

    // 400 ошибка валидации полей
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Object> handleValidation(MethodArgumentNotValidException ex,
                                                   HttpServletRequest request) {
        var errors = ex.getBindingResult().getFieldErrors().stream()
                .collect(Collectors.toMap(FieldError::getField,
                        FieldError::getDefaultMessage,
                        (m1, m2) -> m1));

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

    // 400 кастом ошибка валидации (для файлов)
    @ExceptionHandler(InvalidFileException.class)
    public ResponseEntity<Object> handleInvalidCredentials(InvalidFileException ex,
                                                           HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 400 слабый пароль
    @ExceptionHandler(WeakPasswordException.class)
    public ResponseEntity<Object> handleWeakPassword(WeakPasswordException ex,
                                                     HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 400 username не соотв. требованиям
    @ExceptionHandler(InvalidUsernameException.class)
    public ResponseEntity<Object> handleInvalidUsername(InvalidUsernameException ex,
                                                     HttpServletRequest request) {
        return buildResponse(HttpStatus.BAD_REQUEST, ex.getMessage(), request);
    }

    // 401 неверный логин пароль
    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<Object> handleInvalidCredentials(AuthenticationException ex,
                                                           HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    // 401 проблемы с токенами
    @ExceptionHandler(InvalidTokenException.class)
    public ResponseEntity<Object> handleInvalidJwt(InvalidTokenException ex,
                                                   HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    // 401 несовпадение информации об устройстве
    @ExceptionHandler(DeviceMismatchException.class)
    public ResponseEntity<Object> handleInvalidJwt(DeviceMismatchException ex,
                                                   HttpServletRequest request) {
        return buildResponse(HttpStatus.UNAUTHORIZED, ex.getMessage(), request);
    }

    // 403 доступ запрещен (не ADMIN роль)
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<Object> handleDenied(AccessDeniedException ex,
                                               HttpServletRequest req) {
        return buildResponse(HttpStatus.FORBIDDEN, "Access denied", req);
    }

    // 403 аккаунт помечен удаленным
    @ExceptionHandler(AccountDeletedException.class)
    public ResponseEntity<Object> handleDeleted(AccountDeletedException ex,
                                                HttpServletRequest req) {
        return buildResponse(HttpStatus.FORBIDDEN, "Account is deleted", req);
    }

    // 403 аккаунт заблокирован админом
    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<Object> handleLocked(AccountLockedException ex,
                                               HttpServletRequest req) {
        return buildResponse(HttpStatus.FORBIDDEN, "Access is locked", req);
    }

    // 404 пользователь не найден
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Object> handleUserNotFound(UserNotFoundException ex,
                                                     HttpServletRequest request) {
        return buildResponse(HttpStatus.NOT_FOUND, ex.getMessage(), request);
    }

    // 409 email уже занят
    @ExceptionHandler(EmailAlreadyExistsException.class)
    public ResponseEntity<Object> handleEmailAlreadyExists(EmailAlreadyExistsException ex,
                                                           HttpServletRequest request) {
        return buildResponse(HttpStatus.CONFLICT, ex.getMessage(), request);
    }

    // 413 большой размер файла
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Object> handleTooLarge(MaxUploadSizeExceededException ex,
                                                 HttpServletRequest req) {
        return buildResponse(HttpStatus.PAYLOAD_TOO_LARGE,
                "File size must not exceed 10 MB", req);
    }

    // 422 ошибка генерации тега
    @ExceptionHandler(UsernameTagExhaustedException.class)
    public ResponseEntity<Object> handleTagExhausted(UsernameTagExhaustedException ex,
                                                     HttpServletRequest request) {
        return buildResponse(HttpStatus.UNPROCESSABLE_ENTITY, ex.getMessage(), request);
    }

    // 500 обработка всех RuntimeException
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleAllUncaughtException(Exception ex,
                                                             HttpServletRequest request) {
        log.error("Uncaught exception", ex);

        return buildResponse(
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Internal server error.",
                request
        );
    }

    // маппер ответа
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