# FEATURES.md — Функциональный разбор backend TaskFlow

Разбивка по доменам функциональности (не по сервисам). Названия классов, эндпоинтов и библиотек — дословно из кода.

---

## 1. АУТЕНТИФИКАЦИЯ И АВТОРИЗАЦИЯ

### user-service
**Реализация:**
- JWT-аутентификация через access (15 мин) + refresh (7 дней) токены.
- Access-токен (JJWT) несёт `sub=userId`, `email`, `role`; refresh-токен несёт `jti` и хранится в БД (таблица `tokens`) с `deviceFingerprint`, `revoked`, `expiresAt`.
- Ротация refresh-токенов: при `/refresh` старый отзывается, выдаётся новый.
- Привязка к отпечатку устройства: несовпадение отзывает ВСЕ токены пользователя.
- Пароли через BCrypt.
- На входе — `GatewayAuthFilter`, доверяет заголовку `X-Gateway-Source` от шлюза, НЕ валидирует подпись JWT повторно.

**Ключевые классы/файлы:**
- `AuthService` (service/AuthService.java)
- `JwtHelper` (service/JwtHelper.java)
- `TokenService` (service/TokenService.java)
- `TokenRevocationService` (service/TokenRevocationService.java)
- `GatewayAuthFilter` (security/GatewayAuthFilter.java)
- `JwtUser` (security/JwtUser.java), `SystemPrincipal` (security/SystemPrincipal.java)
- `SecurityConfig`, `SecurityWhiteList`, `JwtConfig` (config/*)
- `User`, `RefreshToken`, `SystemRole` (dto/models/*)

**Используемые библиотеки:** JJWT 0.11.5 (jjwt-api/impl/jackson), Spring Security, BCrypt (spring-security), Spring Cache

**Endpoints:**
1. POST /api/auth/register Регистрация пользователя, выдача пары токенов
2. POST /api/auth/login Вход, выдача пары токенов
3. POST /api/auth/refresh Ротация access+refresh по refresh-токену
4. PATCH /api/auth/change-password Смена пароля, отзыв всех токенов, перевыпуск
5. PATCH /api/auth/change-email Смена email, отзыв всех токенов, перевыпуск
6. POST /api/auth/logout Отзыв refresh-токена
7. DELETE /api/auth/account Soft-delete аккаунта (deletedAt)

### gateway-service
**Реализация:**
- Валидация JWT access-токена (JJWT 0.12.6) на границе, проверка чёрного списка отозванных токенов в Redis.
- Инъекция заголовков `X-User-Id` / `X-User-Role` / `X-User-Email` / `X-Gateway-Source` в пересылаемый запрос.
- Отзыв access-токена (Redis-blacklist на 15 мин) при выходе/смене пароля/смене email/удалении аккаунта.
- Нет Spring Security MVC — кастомные `GatewayFilterFactory` / `GlobalFilter`.

**Ключевые классы/файлы:**
- `JwtAuthenticationFilter` (security/JwtAuthenticationFilter.java)
- `TokenRevocationFilter` (security/TokenRevocationFilter.java)
- `TokenService` (service/TokenService.java)
- `TokenBlacklistService` (service/TokenBlacklistService.java)
- `GatewayConfig`, `CorsConfig`, `OpenApiRoutes` (config/*)

**Используемые библиотеки:** Spring Cloud Gateway 4.3.2, JJWT 0.12.6, spring-boot-starter-data-redis-reactive, springdoc-openapi-starter-webflux-ui 2.8.6

**Заметки:**
- JWT-библиотека шлюза (0.12.6) отличается по API от user-service (0.11.5); общий секрет `jwt.secret`.
- Чёрный список ключается по `token.hashCode()` (риск коллизий).
- CORS разрешает credentials с origin `*` (некорректно по спецификации).
- `skipPaths` через regex `.*` матчит только один сегмент.

### board-service / issue-service / sprints-service / dashboard-service
**Реализация:**
- На стороне сервисов нет валидации подписи JWT.
- Входящий `GatewayAuthFilter` (Java) / `GatewayAuthenticationMiddleware` (C#) доверяет заголовку `X-Gateway-Source` и строит `JwtUser`/`SystemPrincipal` (Java) или `ClaimsPrincipal` (C#).
- Межсервисные вызовы идут с заголовками `X-Gateway-Source` + `X-Source-Service` и трактуются как `ROLE_SYSTEM`.
- Модель прав доступа — кастомная матрица разрешений, хранимая в board-service (`permissions.matrix.*`) и кэшируемая в Redis; резолвер прав — `AuthService.getUserPermissions` (board) / `PermissionCacheReader` (issue, sprints, dashboard).

**Ключевые классы/файлы:**
- Java: `GatewayAuthFilter` (security/GatewayAuthFilter.java), `InternalAuthInterceptor` (config/InternalAuthInterceptor.java)
- board: `AuthService`, `PermissionMatrixService`, `PermissionMatrixProperties` (config/*)
- issue: `PermissionCacheReader`, `RedisCacheService`, `RedisConstants` (config/, cache/)
- .NET: `GatewayAuthenticationMiddleware.cs` + `GatewayAuthenticationMiddlewareExtensions.cs`, `AuthService.cs`, `CurrentUserService.cs`, `PermissionCacheReader.cs`, `RedisConstants.cs`, `InternalAuthHandler.cs`

**Используемые библиотеки:** Spring Security (Java), StackExchange.Redis 2.10.1 + Microsoft.Extensions.Caching.StackExchangeRedis 8.0.22 (.NET), Refit.HttpClientFactory 8.0.0/9.0.2

**Заметки:**
- `GatewayAuthenticationMiddleware` (.NET) читает `GatewaySecretValue`, но НИКОГДА не сравнивает его с `X-Gateway-Source` и не возвращает 401 (`SendUnauthorizedResponse` — мёртвый код).
- `AuthService.HasPermissionAsync` в .NET выбрасывает `UnauthorizedAccessException`, который контроллеры ловят как 500 (нет маппинга в 401/403).
- В sprints-service доступ при `userId==0` (SYSTEM) всегда разрешён — им пользуется `SprintExpirationService` (фоновый авто-старт/завершение спринтов).

---

## 2. УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ (ПРОФИЛИ, АВАТАРЫ, ПОИСК)

### user-service
**Реализация:**
- CRUD профиля (username, bio, tag).
- Загрузка/выдача/удаление аватаров (байты в БД, таблица `avatars`).
- Универсальный поиск по тегу/префиксу (мин. 2 символа).
- Внутренние эндпоинты `/api/internal/users/*` доступны только `ROLE_SYSTEM` (вызываются другими сервисами через Feign).

**Ключевые классы/файлы:**
- `UserController`, `AvatarController`, `InternalController` (controller/*)
- `UserService`, `AvatarService`, `AvatarValidator` (service/*)
- `UserRepository`, `AvatarRepository` (repositories)
- `IdListRequest` (dto/data/IdListRequest.java)

**Используемые библиотеки:** Spring Data JPA, Spring Validation, PostgreSQL

**Endpoints:**
1. PATCH /api/users/me/update Обновить свои username/bio
2. GET /api/users/me/profile Полный профиль текущего пользователя
3. GET /api/users/{userId}/profile Публичный профиль по id
4. GET /api/users/search?q= Универсальный поиск (мин. 2 символа)
5. POST /api/users/me/avatar Загрузка аватара (multipart)
6. GET /api/users/me/avatar Получить свой аватар (байты)
7. GET /api/users/{userId}/avatar Получить аватар другого пользователя
8. DELETE /api/users/me/avatar Удалить свой аватар
9. GET /api/internal/users/{userId} Профиль по id (SYSTEM, вызывается board/issue)
10. POST /api/internal/users/batch Пакетная выдача профилей по списку id (SYSTEM)

**Заметки:** Возвращаемый внутренний профиль не содержит пароля. Внутренние эндпоинты помечены `@PreAuthorize("hasRole('SYSTEM')")`.

---

## 3. УПРАВЛЕНИЕ ПРОЕКТАМИ (ПРОЕКТЫ, УЧАСТНИКИ, РОЛИ, ПРАВА, ПРИГЛАШЕНИЯ, АВАТАРЫ)

### board-service
**Реализация:**
- Полный жизненный цикл проектов (создание, список своих, детали, обновление, soft-delete).
- Управление участниками (kick, leave).
- Кастомные роли проекта с матрицей прав (`PermissionMatrixProperties`, `permissions.matrix.*`); назначение ролей.
- Приглашения через токен-ссылку (invite/regenerate/join).
- Аватар проекта (байты в БД).
- Источник истины по правам доступа для всех сервисов (внутренний `/api/internal/permissions`).
- Публикует события в RabbitMQ (exchange `activity.exchange`).

**Ключевые классы/файлы:**
- Контроллеры: `ProjectController`, `MemberController`, `RoleController`, `InviteController`, `AvatarController`, `InternalController` (controller/*)
- Сервисы: `ProjectService`, `ProjectMemberService`, `ProjectRoleService`, `ProjectInviteService`, `ProjectAvatarService`, `AuthService`, `PermissionMatrixService`, `RolePermissionFactory`, `EventProducerService`, `TransactionalEventForwarder` (service/*)
- Клиент: `UserServiceClient` (client/UserServiceClient.java)
- Конфиг: `RabbitMqConfig`, `PermissionMatrixProperties` (config/*)
- Сущности: `Project`, `ProjectMember`, `ProjectRole`, `RolePermission`, `ProjectAvatar` (dto/models/*)
- События: `ProjectCreatedEvent`, `ProjectUpdatedEvent`, `ProjectDeletedEvent`, `ProjectMemberAddedEvent`, `ProjectMemberRemovedEvent` (dto/rabbit/*)

**Используемые библиотеки:** Spring Data JPA, Spring Cloud OpenFeign + LoadBalancer, spring-boot-starter-amqp, PostgreSQL, Redis

**Endpoints:**
1. POST /api/projects Создать проект
2. GET /api/projects/me Проекты текущего пользователя
3. GET /api/projects/{projectId} Детали проекта
4. PATCH /api/projects/{projectId} Обновить проект
5. PATCH /api/projects/{projectId}/delete Soft-delete проекта
6. GET /api/projects/{projectId}/members Список участников
7. DELETE /api/projects/{projectId}/members/{userId} Исключить участника
8. DELETE /api/projects/{projectId}/members/me Покинуть проект
9. POST /api/projects/{projectId}/roles Создать роль
10. PATCH /api/projects/{projectId}/roles/{roleId} Обновить роль
11. DELETE /api/projects/{projectId}/roles/{roleId} Удалить роль
12. GET /api/projects/{projectId}/roles Список ролей
13. GET /api/projects/{projectId}/roles/me Роль текущего пользователя
14. PATCH /api/projects/{projectId}/roles/assign Назначить роль пользователю
15. POST /api/projects/join/{token} Вступить по invite-ссылке
16. POST /api/projects/{projectId}/invite Пригласить пользователя
17. POST /api/projects/{projectId}/invite/regenerate Перегенерировать invite-ссылку
18. GET /api/projects/{projectId}/invite Получить invite-ссылку
19. POST /api/projects/{projectId}/avatar Загрузить аватар проекта (multipart)
20. GET /api/projects/{projectId}/avatar Получить аватар проекта
21. DELETE /api/projects/{projectId}/avatar Удалить аватар проекта
22. GET /api/internal/projects/{projectId} Информация о проекте (SYSTEM)
23. GET /api/internal/permissions?userId=&projectId= Права пользователя в проекте (SYSTEM)
24. GET /api/internal/projects/{projectId}/members/{userId} Проверка членства (SYSTEM)

**Заметки:**
- `circuitbreaker.enabled=true` без зависимости resilience4j (риск старта).
- Нет собственной валидации секрета шлюза.
- События публикуются после коммита БД через `TransactionalEventForwarder`.

---

## 4. УПРАВЛЕНИЕ ЗАДАЧАМИ (ISSUES, ТЕГИ, ИСПОЛНИТЕЛИ, ПЕРЕХОДЫ СТАТУСОВ, КОММЕНТАРИИ, ВЛОЖЕНИЯ)

### issue-service
**Реализация:**
- CRUD задач (Issue), теги проекта (ProjectTag), назначение исполнителей (Assignee).
- Переходы статусов (роль-зависимые: Developer→CODE_REVIEW, Reviewer→QA/IN_PROGRESS, QA→STAGING/IN_PROGRESS), комментарии, вложения (файлы в БД).
- Проверка прав через board-service (`/api/internal/permissions`) с кэшем в Redis.
- Межсервисные вызовы через Feign: board-service (проект/права/участники) и user-service (профили).
- Публикует события в RabbitMQ (`activity.exchange`).

**Ключевые классы/файлы:**
- Контроллеры: `IssueController`, `TagController`, `AssigneeController`, `TransitionController`, `IssueCommentController`, `AttachmentController`, `InternalController` (controllers/*)
- Сервисы: `IssueService`, `TagService`, `AssignService`, `AssignHelper`, `TransitionService`, `IssueCommentService`, `AttachmentService`, `IssueHierarchyValidator`, `AuthService`, `EventProducerService`, `TransactionalEventForwarder` (service/*)
- Клиенты: `BoardServiceClient`, `UserServiceClient` (client/*)
- `PermissionCacheReader` (config/PermissionCacheReader.java)
- Сущности/перечисления: `Issue`, `IssueComment`, `ProjectTag`, `Attachment`; `IssueStatus`, `IssueType`, `Priority`, `ActionType`, `AssignmentType`, `EntityType`
- События: `IssueCreatedEvent`, `IssueUpdatedEvent`, `IssueDeletedEvent`, `IssueStatusChangedEvent`, `IssueAssigneeAddedEvent`, `IssueAssigneeRemovedEvent`, `IssueCommentCreatedEvent`, `IssueCommentUpdatedEvent`, `IssueCommentDeletedEvent`, `AttachmentCreatedEvent`, `AttachmentDeletedEvent` (dto/rabbit/*)

**Используемые библиотеки:** Spring Data JPA, Spring Cloud OpenFeign + LoadBalancer, spring-boot-starter-amqp, PostgreSQL, Redis

**Endpoints:**
1. POST /api/issues Создать задачу (с тегами)
2. GET /api/issues/{issueId} Получить задачу
3. GET /api/issues?projectId= Список задач проекта
4. PATCH /api/issues/{issueId} Обновить задачу
5. DELETE /api/issues/{issueId} Каскадное удаление задачи
6. PATCH /api/issues/{issueId}/tags Пакетное назначение тегов (только исполнитель)
7. POST /api/tags Создать тег
8. GET /api/tags?projectId= Список тегов
9. PATCH /api/tags/{tagId} Обновить тег
10. DELETE /api/tags/{tagId} Удалить тег
11. POST /api/issues/{issueId}/assignees Назначить исполнителя (владелец)
12. POST /api/issues/{issueId}/assignees/own Назначить себя (developer)
13. DELETE /api/issues/{issueId}/assignees Снять исполнителя
14. DELETE /api/issues/{issueId}/assignees/own Снять себя
15. POST /api/issues/{issueId}/status Полный переход статуса (владелец)
16. POST /api/issues/{issueId}/transitions/role Роль-зависимый переход статуса
17. POST /api/issues/{issueId}/comments Создать комментарий
18. PATCH /api/issues/{issueId}/comments/{commentId} Обновить комментарий
19. DELETE /api/issues/{issueId}/comments/{commentId} Удалить комментарий (автор или владелец)
20. POST /api/issues/{issueId}/attachments Загрузить вложение (multipart)
21. GET /api/issues/{issueId}/attachments/{attachmentId} Скачать вложение
22. DELETE /api/issues/{issueId}/attachments/{attachmentId} Удалить вложение
23. GET /api/internal/issues/{issueId} Информация о задаче (SYSTEM)
24. GET /api/internal/issues?projectId= Задачи проекта (SYSTEM)
25. GET /api/internal/issues/batch Пакет по id (SYSTEM, GET с телом — нестандарт)
26. POST /api/internal/issues/startsprint?projectId= Запуск спринта (вызывается sprints-service)

**Заметки:**
- BUG — `sendAttachmentCreatedEvent` публикует с ключом `project.created`, `sendAttachmentDeletedEvent` — `project.deleted` (опечатка, должно быть `attachment.created`/`attachment.deleted`).
- `BoardServiceClient.getMember` ожидает `UserPermissionsResponse`, а board возвращает `MemberExistResponse` (риск десериализации).
- `circuitbreaker.enabled=true` без resilience4j.
- `InternalController.getIssuesByIds` — GET с `@RequestBody`.

---

## 5. УПРАВЛЕНИЕ СПРИНТАМИ (СПРИНТЫ, ПРИВЯЗКА ЗАДАЧ, АВТО-ЗАВЕРШЕНИЕ)

### sprints-service
**Реализация:**
- Жизненный цикл Scrum-спринтов (create/read/update/delete/start) и связка задач со спринтом (таблица `sprint_issues`).
- Backlog реализован как sentinel `sprintId=0`.
- Валидация проекта/задач через board-service и issue-service (Refit).
- Права (`SPRINT:VIEW`/`MANAGE`) резолвятся через Redis-кэш прав с фолбэком на board-service.
- Фоновый `SprintExpirationService` (каждые 1 мин) авто-стартует и авто-завершает просроченные спринты (от имени SYSTEM, `userId=0`).
- Авто-миграция БД при старте.
- НЕ имеет интеграции с RabbitMQ (ничего не публикует и не потребляет).

**Ключевые классы/файлы:**
- `SprintsController`, `SprintIssuesController` (Controllers/*)
- `SprintService`/`ISprintService`, `SprintIssueService`/`ISprintIssueService`, `AuthService`, `CurrentUserService`, `SprintExpirationService` (Services/*)
- `SprintRepository`, `SprintIssueRepository` (Data/Repositories/*)
- `Sprint`, `SprintIssue` (Models/Entities/*)
- `IIssueClient`, `IProjectClient` (Clients/*)
- `InternalAuthHandler` (Handlers/*), `PermissionsCacheReader`, `RedisConstants` (Cache/*)
- `SprintsDbContext` (Data/SprintsDbContext.cs), `GatewayAuthenticationMiddleware.cs`

**Используемые библиотеки:** EF Core 8.0.0 + Npgsql.EntityFrameworkCore.PostgreSQL 8.0.0, Refit.HttpClientFactory 8.0.0, StackExchange.Redis 2.10.1, Microsoft.Extensions.Caching.StackExchangeRedis 8.0.22, Steeltoe.Discovery.Eureka 4.0.0, Swashbuckle.AspNetCore 6.5.0

**Endpoints:**
1. GET api/sprints/projects/{projectId} Спринты проекта + backlog (SPRINT:VIEW)
2. GET api/sprints/{sprintId}?projectId= Один спринт (id=0 → backlog) (SPRINT:VIEW)
3. POST api/sprints/projects/{projectId} Создать спринт (SPRINT:MANAGE)
4. PATCH api/sprints/{id} Обновить спринт (SPRINT:MANAGE)
5. DELETE api/sprints/{id} Удалить спринт (SPRINT:MANAGE)
6. POST api/sprints/{sprintId}/start Стартовать спринт (SPRINT:MANAGE)
7. POST api/sprints/{sprintId}/issues/batch Добавить задачи в спринт (SPRINT:MANAGE)
8. DELETE api/sprints/{sprintId}/issues/{issueId} Убрать задачу из спринта (SPRINT:MANAGE)

**Заметки:**
- Нет `[Authorize]` на контроллерах — авторизация только в `AuthService.HasPermissionAsync`.
- `GetIssuesByIds` у `IIssueClient` — GET с телом.
- TTL кэша прав (`RedisConstants`) объявлены, но не применяются.
- Версии `Microsoft.Extensions.Caching.Memory` 10.0.0 и `System.Text.Json` 10.0.0 при target `net8.0` (микс .NET 10 пакетов).

---

## 6. АНАЛИТИКА И ЛОГИ АКТИВНОСТИ (ДАШБОРД, МЕТРИКИ, ACTIVITY LOGS)

### dashboard-service
**Реализация:**
- Потребитель доменных событий из RabbitMQ (MassTransit, exchange `activity.exchange`, queue `activity.all`, routing key `#`) — на каждое событие пишет строку в таблицу `activity_logs`.
- По запросу считает и сохраняет снапшоты метрик проекта (`DashboardSnapshot`: total/completed/todo/in-progress, completion rate, эффективность по пользователям).
- Проверка прав (`ANALYTICS:VIEW`, `LOGS:VIEW`) через Redis-кэш с фолбэком на board-service.
- НЕ публикует события. Авто-миграция БД при старте.

**Ключевые классы/файлы:**
- `DashboardController`, `ActivityController` (Controllers/*)
- `DashboardService`, `ActivityLogService`, `AuthService`, `CurrentUserService` (Services/*)
- `DashboardSnapshotRepository`, `ActivityLogRepository` (Repositories/*)
- `ActivityLog`, `DashboardSnapshot` (Models/Entities/*)
- `IProjectClient` (Clients/IProjectClient.cs)
- `InternalAuthHandler` (Handlers/*), `PermissionCacheReader`, `RedisConstants` (Cache/*)
- 21 consumer в `Messages/*` (`ProjectCreatedConsumer` ... `SprintIssueRemovedConsumer`)
- `DashboardDbContext` (Data/DashboardDbContext.cs), `GatewayAuthenticationMiddleware.cs`

**Используемые библиотеки:** EF Core 8.0.0 + Npgsql.EntityFrameworkCore.PostgreSQL 8.0.0, MassTransit 8.5.7 + MassTransit.RabbitMQ 8.5.7, Refit.HttpClientFactory 9.0.2, StackExchange.Redis 2.10.1, Microsoft.Extensions.Caching.StackExchangeRedis 8.0.22, Steeltoe.Discovery.Eureka 4.0.0, Swashbuckle.AspNetCore 6.4.0

**Endpoints:**
1. GET api/dashboards/{projectId}/dashboard Рассчитать+сохранить дашборд (ANALYTICS:VIEW)
2. GET api/dashboards/{projectId}/dashboard/metrics/{metricName}/trend Тренд метрики (БЕЗ проверки прав)
3. GET api/logs/projects/{projectId}/activity Лог активности проекта (LOGS:VIEW)

**Заметки:**
- `GatewayAuthenticationMiddleware` не валидирует секрет шлюза и не возвращает 401.
- `PermissionCacheReader` только читает Redis, никогда не пишет — кэш всегда мимо, всё уходит в board-service.
- Отказ в праве → 500 (а не 403).
- `ActivityController` логирует через `ILogger<GatewayAuthenticationMiddleware>` (ошибка generic-типа).
- `IssueStatusChangedConsumer` пишет сырой `NewStatus` как `action_type`.
- Версии `System.Text.Json` 10.0.0, EF Tools 10.0.0 при `net8.0`.

---

## 7. МЕЖСЕРВИСНАЯ ШИНА СОБЫТИЙ (RABBITMQ / MASSTRANSIT)

### board-service (издатель)
**Реализация:**
- `spring-boot-starter-amqp`, `TopicExchange("activity.exchange")`.
- Публикация через `EventProducerService` после коммита БД (`TransactionalEventForwarder`).
- Сообщения несут заголовок `MT-MessageType = "urn:message:Backend.Shared.DTOs:<ClassName>"`.

**Ключевые классы/файлы:**
- `RabbitMqConfig` (config/RabbitMqConfig.java)
- `EventProducerService`, `TransactionalEventForwarder` (service/*)
- `ProjectCreatedEvent`, `ProjectUpdatedEvent`, `ProjectDeletedEvent`, `ProjectMemberAddedEvent`, `ProjectMemberRemovedEvent` (dto/rabbit/*)

**Публикуемые ключи маршрутизации:**
1. project.created
2. project.updated
3. project.deleted
4. project.member.added
5. project.member.removed

### issue-service (издатель)
**Реализация:** аналогично board-service, `TopicExchange("activity.exchange")`, публикация после коммита.

**Ключевые классы/файлы:**
- `RabbitMqConfig` (config/RabbitMqConfig.java)
- `EventProducerService`, `TransactionalEventForwarder` (service/*)
- `Issue*Event` (dto/rabbit/*)

**Публикуемые ключи маршрутизации:**
1. issue.created
2. issue.updated
3. issue.deleted
4. issue.status.changed
5. issue.assignee.added
6. issue.assignee.removed
7. issue.comment.created
8. issue.comment.updated
9. issue.comment.deleted
10. attachment.created (BUG: фактически публикуется с ключом project.created)
11. attachment.deleted (BUG: фактически публикуется с ключом project.deleted)

---

## 8. ШЛЮЗ И СЕРВИС-ДИСКОВЕРИ (API GATEWAY, EUREKA)

### gateway-service
**Реализация:**
- Spring Cloud Gateway как edge-прокси.
- Маршруты через `lb://<service>` (Eureka + load-balancer).
- JWT-фильтр на границе, инъекция заголовков идентичности, Redis-blacklist отозванных токенов.
- Агрегация Swagger через `OpenApiRoutes`. `DedupeResponseHeader` для CORS.

**Ключевые классы/файлы:**
- `GatewayConfig`, `CorsConfig`, `OpenApiRoutes` (config/*)
- `JwtAuthenticationFilter`, `TokenRevocationFilter` (security/*)
- `TokenService`, `TokenBlacklistService` (service/*)

**Используемые библиотеки:** spring-cloud-starter-gateway 4.3.2, spring-cloud-gateway-server 4.3.2, spring-boot-starter-data-redis-reactive, JJWT 0.12.6, springdoc-openapi-starter-webflux-ui 2.8.6, spring-cloud-starter-netflix-eureka-client 5.0.0

**Маршруты (из application.properties):**
1. user-service → /api/auth/**, /api/users/**
2. board-service → /api/projects/**
3. issue-service → /api/issues/**, /api/tags/**
4. sprints-service → /api/sprints/**, /api/sprint-issues/**
5. dashboard-service → /api/dashboards/**, /api/logs/**

**Заметки:**
- `skipPaths` для auth: `/api/auth/register`, `/api/auth/login`, `/api/auth/refresh` и swagger-пути.
- Маршрут `/api/sprint-issues/**` не соответствует реальному пути sprints-service (`/api/sprints/{id}/issues`).

---

## 9. КЭШИРОВАНИЕ (REDIS)

### user-service
**Реализация:** Spring Cache (`@EnableCaching`) через Redis. Ключи `USER_PROFILE`, `USER_PROFILE_BATCH` (`CacheConstants`). Конфиг `RedisConfig`.
**Ключевые классы/файлы:** `RedisConfig` (config/RedisConfig.java), `CacheConstants` (cache/CacheConstants.java)
**Используемые библиотеки:** spring-boot-starter-data-redis-reactive

### board-service
**Реализация:** кастомный `RedisCacheService` (обёртка над RedisTemplate). Константы в `RedisConstants`.
**Ключевые классы/файлы:** `RedisCacheService` (cache/RedisCacheService.java), `RedisConstants` (cache/RedisConstants.java), `RedisConfig` (config/RedisConfig.java)
**Используемые библиотеки:** spring-boot-starter-data-redis-reactive

### issue-service
**Реализация:** `RedisTemplate` для кэша прав доступа (`user:{userId}:project:{projectId}` → roleId; `role:{roleId}:permissions`; `role:{roleId}:isOwner`). Чтение через `PermissionCacheReader`, фолбэк на board-service.
**Ключевые классы/файлы:** `RedisConfig` (config/RedisConfig.java), `PermissionCacheReader` (config/PermissionCacheReader.java)
**Используемые библиотеки:** spring-boot-starter-data-redis-reactive

### sprints-service / dashboard-service (.NET)
**Реализация:** StackExchange.Redis `IConnectionMultiplexer` (singleton). `PermissionsCacheReader` читает ключи `user:{userId}:project:{projectId}`, `role:{roleId}:permissions`, `role:{roleId}:isOwner` с фолбэком на board-service. TTL из `RedisConstants` НЕ применяются (только чтение).
**Ключевые классы/файлы:** `PermissionsCacheReader.cs` (Cache/), `RedisConstants.cs` (Cache/), `Program.cs` (регистрация IConnectionMultiplexer)
**Используемые библиотеки:** StackExchange.Redis 2.10.1, Microsoft.Extensions.Caching.StackExchangeRedis 8.0.22

### gateway-service
**Реализация:** `ReactiveRedisTemplate` для чёрного списка access-токенов (ключ `blacklist:token:<hashCode>`, TTL 15 мин).
**Ключевые классы/файлы:** `TokenBlacklistService` (service/TokenBlacklistService.java)
**Используемые библиотеки:** spring-boot-starter-data-redis-reactive
**Заметки:** Ключи чёрного списка по `hashCode()` — риск коллизий между разными токенами.
