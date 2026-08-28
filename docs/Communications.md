Схема взаимодействия микросервисов
Этот документ описывает все синхронные (REST API) и асинхронные (RabbitMQ) взаимодействия между микросервисами на основе фактической реализации в коде.

Основные принципы
Синхронные запросы (REST) используются для немедленной валидации данных или получения информации, необходимой для продолжения операции.
Асинхронные сообщения (RabbitMQ) используются для уведомления о произошедших событиях. Это позволяет слабо связать сервисы и избежать блокировок.
Прямые подключения к БД других сервисов запрещены. Вся коммуникация происходит через API или брокер сообщений.

Фактическое состояние
user-service не публикует события user.created/updated/deleted — в нём только мёртвый каркас RabbitMQ (RabbitMQConfig с myQueue, consumer только println). Эти события не реализованы.
sprints-service не имеет интеграции с RabbitMQ вообще (ничего не публикует и не потребляет). События sprint.* не реализованы.
notifications-service не реализован (дефолтный шаблон ASP.NET, эндпоинт /weatherforecast). Уведомления не генерируются.
dashboard-service только потребляет события (MassTransit, queue activity.all) и не публикует никаких событий.
Издатели событий в RabbitMQ: только board-service и issue-service (exchange activity.exchange, TopicExchange).

user-service
Этот сервис в основном предоставляет информацию. Он почти не зависит от других.

Что он предоставляет другим (REST API, внутренние эндпоинты /api/internal/...):
Эти эндпоинты защищены @PreAuthorize("hasRole('SYSTEM')") и недоступны снаружи через шлюз напрямую.

GET /api/internal/users/{userId}
Назначение: Профиль пользователя по ID (без пароля).
Кто использует: board-service, issue-service (через Feign).

POST /api/internal/users/batch
Назначение: Профили нескольких пользователей по списку id за один запрос.
Кто использует: board-service, issue-service (через Feign).

Какие события он публикует (RabbitMQ):
Никакие. В коде есть только мёртвый каркас (RabbitMQConfig + RabbitMQConsumer с System.out.println). События user.created / user.updated / user.deleted не реализованы.

board-service (управление проектами)
Этот сервис управляет проектами, участниками, ролями, правами и приглашениями. Он — источник истины по правам доступа для всех остальных сервисов.

Что он предоставляет другим (REST API, внутренние эндпоинты /api/internal/...):

GET /api/internal/projects/{projectId}
Назначение: Информация о проекте.
Кто использует: issue-service (Feign), sprints-service (Refit), dashboard-service (Refit).

GET /api/internal/permissions?userId=&projectId=
Назначение: Права пользователя в проекте (матрица permissions, isOwner).
Кто использует: issue-service (Feign), sprints-service (Refit), dashboard-service (Refit) — для резолва прав (с кэшем в Redis).

GET /api/internal/projects/{projectId}/members/{userId}
Назначение: Проверка членства пользователя в проекте.
Кто использует: issue-service (Feign).

Какие запросы он отправляет (REST API):
board-service -> user-service: GET /api/internal/users/{userId} и POST /api/internal/users/batch (через Feign UserServiceClient + InternalAuthInterceptor).
Цель: получить профили/имена участников проекта.

Какие события он публикует (RabbitMQ, exchange activity.exchange, TopicExchange):
board-service -> dashboard-service (через очередь activity.all, routing key "#"):
project.created
project.updated
project.deleted
project.member.added
project.member.removed
Сообщения несут заголовок MT-MessageType = "urn:message:Backend.Shared.DTOs:<ClassName>".
Публикация происходит после коммита БД (TransactionalEventForwarder -> EventProducerService).
Кто слушает: dashboard-service (пишет ActivityLog).

issue-service (центр логики задач; зависит от user-service и board-service)

Какие запросы он отправляет (REST API):
При создании задачи (POST /api/issues):
issue-service -> board-service: GET /api/internal/projects/{projectId}
Цель: проверить существование проекта.
issue-service -> user-service: GET /api/internal/users/{userId}
Цель: проверить существование создателя.

При назначении исполнителя (POST /api/issues/{id}/assignees):
issue-service -> user-service: GET /api/internal/users/{assigneeId}
Цель: проверить существование пользователя.

При отображении задачи (GET /api/issues/{id}) и резолве прав:
issue-service -> user-service: GET /api/internal/users/batch (профили)
issue-service -> board-service: GET /api/internal/permissions (права, с кэшем в Redis через PermissionCacheReader)

При старте спринта (вызывается sprints-service):
sprints-service -> issue-service: POST /api/internal/issues/startsprint?projectId=
Цель: перевести задачи спринта в активное состояние.

Какие события он публикует (RabbitMQ, exchange activity.exchange, TopicExchange):
issue-service -> dashboard-service (через очередь activity.all, routing key "#"):
issue.created
issue.updated
issue.deleted
issue.status.changed
issue.assignee.added
issue.assignee.removed
issue.comment.created
issue.comment.updated
issue.comment.deleted
attachment.created (в коде публикуется с ключом project.created — BUG)
attachment.deleted (в коде публикуется с ключом project.deleted — BUG)
Сообщения несут заголовок MT-MessageType.
Кто слушает: dashboard-service (пишет ActivityLog).

sprints-service (управление спринтами)
Управляет спринтами и привязкой задач. Не имеет интеграции с RabbitMQ.

Исходящие REST API (запросы к другим сервисам, через Refit + InternalAuthHandler):
sprints-service -> board-service: GET /api/internal/projects/{id}
Цель: валидация проекта при создании спринта.
sprints-service -> board-service: GET /api/internal/permissions?userId=&projectId=
Цель: резолв прав (SPRINT:VIEW / SPRINT:MANAGE), с кэшем в Redis.
sprints-service -> issue-service: GET /api/internal/issues/{id}
Цель: валидация задачи при добавлении в спринт.
sprints-service -> issue-service: GET /api/internal/issues?projectId=
Цель: получение задач проекта.
sprints-service -> issue-service: POST /api/internal/issues/startsprint?projectId=
Цель: старт спринта (перевод задач).
sprints-service -> issue-service: GET /api/internal/issues/batch
Цель: пакетная выдача задач по id (GET с телом — нестандарт).

Публикуемые события (RabbitMQ):
Отсутствуют. sprints-service не подключён к RabbitMQ. События sprint.created / sprint.started / sprint.ended / issue.added.to.sprint не реализованы.

dashboard-service
Агрегирует метрики и историю активности.

Исходящие REST API (запросы к другим сервисам, через Refit + InternalAuthHandler):
dashboard-service -> board-service: GET /api/internal/projects/{id}
Цель: проверка существования проекта для дашборда.
dashboard-service -> board-service: GET /api/internal/permissions?projectId=&userId=
Цель: резолв прав (ANALYTICS:VIEW, LOGS:VIEW), с кэшем в Redis (который фактически не пишется).

Публикуемые события (RabbitMQ):
Отсутствуют. dashboard-service только потребляет события.

Подписанные события (RabbitMQ, MassTransit):
Слушает exchange activity.exchange (topic) с routing key "#", очередь activity.all.
Потребляет 21 событие: ProjectCreated/Updated/Deleted, ProjectMemberAdded/Removed, IssueCreated/Updated/Deleted, IssueStatusChanged, IssueAssigneeAdded/Removed, IssueCommentCreated/Updated/Deleted, AttachmentCreated/Deleted, SprintCreated/Started/Completed, SprintIssueAdded/Removed.
Действие: при получении события создаёт запись в таблице activity_logs (через соответствующий consumer в Messages/*).

notifications-service
Отправляет уведомления пользователям на основе их предпочтений.

Фактическое состояние: сервис не реализован. Это дефолтный шаблон ASP.NET Core с эндпоинтом /weatherforecast. Нет контроллеров уведомлений, нет DbContext, нет RabbitMQ-кода, нет Eureka-регистрации, нет аутентификации. Модели Notifications/UserPreferences есть, но не используются.

Итоговая таблица взаимодействия (REST, фактическая)
board-service	user-service	REST	GET /api/internal/users/{userId}	Профили участников (Feign).
board-service	user-service	REST	POST /api/internal/users/batch	Пакет профилей (Feign).
issue-service	board-service	REST	GET /api/internal/projects/{projectId}	Валидация проекта.
issue-service	board-service	REST	GET /api/internal/permissions	Резолв прав задачи.
issue-service	board-service	REST	GET /api/internal/projects/{projectId}/members/{userId}	Проверка членства.
issue-service	user-service	REST	GET /api/internal/users/{userId}	Валидация создателя/исполнителя.
issue-service	user-service	REST	POST /api/internal/users/batch	Профили упомянутых в задаче.
sprints-service	board-service	REST	GET /api/internal/projects/{projectId}	Валидация проекта спринта.
sprints-service	board-service	REST	GET /api/internal/permissions	Резолв прав спринта.
sprints-service	issue-service	REST	GET /api/internal/issues/{issueId}	Валидация задачи.
sprints-service	issue-service	REST	GET /api/internal/issues?projectId=	Задачи проекта.
sprints-service	issue-service	REST	POST /api/internal/issues/startsprint	Старт спринта.
sprints-service	issue-service	REST	GET /api/internal/issues/batch	Пакет задач по id.
dashboard-service	board-service	REST	GET /api/internal/projects/{projectId}	Проверка проекта дашборда.
dashboard-service	board-service	REST	GET /api/internal/permissions	Резолв прав дашборда/логов.

Маршрутизация событий RabbitMQ (фактическая)
Издатель	Exchange	Routing key	Очередь	Потребитель
board-service	activity.exchange	topic	project.created/#	activity.all	dashboard-service
board-service	activity.exchange	topic	project.updated/#	activity.all	dashboard-service
board-service	activity.exchange	topic	project.deleted/#	activity.all	dashboard-service
board-service	activity.exchange	topic	project.member.added/#	activity.all	dashboard-service
board-service	activity.exchange	topic	project.member.removed/#	activity.all	dashboard-service
issue-service	activity.exchange	topic	issue.created/#	activity.all	dashboard-service
issue-service	activity.exchange	topic	issue.updated/#	activity.all	dashboard-service
issue-service	activity.exchange	topic	issue.deleted/#	activity.all	dashboard-service
issue-service	activity.exchange	topic	issue.status.changed/#	activity.all	dashboard-service
issue-service	activity.exchange	topic	issue.assignee.added/#	activity.all	dashboard-service
issue-service	activity.exchange	topic	issue.assignee.removed/#	activity.all	dashboard-service
issue-service	activity.exchange	topic	issue.comment.created/#	activity.all	dashboard-service
issue-service	activity.exchange	topic	issue.comment.updated/#	activity.all	dashboard-service
issue-service	activity.exchange	topic	issue.comment.deleted/#	activity.all	dashboard-service
issue-service	activity.exchange	topic	attachment.created (BUG: project.created)	activity.all	dashboard-service
issue-service	activity.exchange	topic	attachment.deleted (BUG: project.deleted)	activity.all	dashboard-service

Примечание: dashboard-service подписан на exchange activity.exchange с routing key "#", то есть получает все события независимо от конкретного ключа; mapping событие->consumer выполняется по типу сообщения (MassTransit), а не по routing key.
