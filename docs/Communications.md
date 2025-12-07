Схема взаимодействия микросервисов
Этот документ описывает все синхронные (REST API) и асинхронные (RabbitMQ) взаимодействия между микросервисами.

Основные принципы
Синхронные запросы (REST) используются для немедленной валидации данных или получения информации, необходимой для продолжения операции.
Асинхронные сообщения (RabbitMQ) используются для уведомления о произошедших событиях. Это позволяет слабо связать сервисы и избежать блокировок.
Прямые подключения к БД других сервисов запрещены. Вся коммуникация происходит через API или брокер сообщений.


1. user-service

Этот сервис в основном предоставляет информацию. Он почти не зависит от других.

Что он предоставляет другим (REST API):
Эти эндпоинты должны быть "внутренними" (/api/internal/...) и не доступны напрямую снаружи (через API Gateway).

GET /api/internal/users/{id}
Назначение: Получить информацию о пользователе по его ID.
Кто использует: project-service, issue-service.
Возвращает: JSON с id, email, avatar_id. Без пароля!

GET /api/internal/users?ids={id1,id2,id3}
Назначение: Получить информацию о нескольких пользователях за один запрос. Критически важно для производительности!
Кто использует: issue-service (чтобы показать имена создателя, исполнителей, комментаторов на одной странице).
Возвращает: Массив JSON-объектов пользователей.

Какие события он публикует (RabbitMQ):

user.created: Когда регистрируется новый пользователь.
Payload: { "userId": 123, "email": "test@example.com" }
Кто слушает: project-service (может, нужно создать приветственную задачу?), notification-service .

user.updated: Когда пользователь меняет email или аватар.
Payload: { "userId": 123, "newEmail": "new@example.com", "newAvatarId": 456 }
Кто слушает: issue-service, project-service (чтобы обновить кэшированную информацию о пользователе).

user.deleted: Когда пользователь удаляет аккаунт.
Payload: { "userId": 123 }
Кто слушает: Все. Это сложное событие, требующее бизнес-логики (что делать с его проектами и задачами?).

2. project-service (Зависит от user-service)
Этот сервис управляет проектами и их участниками.

Какие запросы он отправляет (REST API):

При добавлении участника в проект (POST /projects/{id}/members):
project-service -> user-service: GET /api/internal/users/{userId}
Цель: Проверить, что такой пользователь вообще существует, прежде чем добавлять его в проект.

При отображении списка участников проекта (GET /projects/{id}/members):
project-service -> user-service: GET /api/internal/users?ids={id1,id2,...}
Цель: Получить email'ы и имена всех участников для отображения в UI.

Какие события он публикует (RabbitMQ):
project.created: Создан новый проект.
Payload: { "projectId": 55, "creatorId": 123, "projectName": "JiroProj" }

project.member.added: В проект добавлен новый участник.
Payload: { "projectId": 55, "userId": 456, "addedBy": 123 }
Кто слушает: issue-service (чтобы знать, кого теперь можно назначать на задачи в этом проекте).

project.member.removed: Участник удален из проекта.
Payload: { "projectId": 55, "userId": 456 }

project.deleted: Проект удален.
Payload: { "projectId": 55 }

3. issue-service (Самый сложный, зависит от user-service и project-service)
Этот сервис — центр логики задач.

Какие запросы он отправляет (REST API):
При создании задачи (POST /issues):
issue-service -> project-service: GET /api/internal/projects/{projectId}
Цель: Проверить, что проект существует и что creator_id имеет на это право.
issue-service -> user-service: GET /api/internal/users/{creatorId}
Цель: Проверить, что создатель задачи существует.

При назначении исполнителя на задачу (POST /issues/{id}/assignees):
issue-service -> user-service: GET /api/internal/users/{assigneeId}
Цель: Проверить, что такой пользователь существует и является участником проекта (информацию об участниках можно взять из project-service или кэшировать).

При отображении полной информации о задаче (GET /issues/{id}):
issue-service -> user-service: GET /api/internal/users?ids={creatorId, assigneeId1, assigneeId2, commenterId1, ...}
Цель: Получить имена и аватары всех упомянутых в задаче пользователей за ОДИН запрос.

issue-service -> project-service: GET /api/internal/projects/{projectId}
Цель: Получить название проекта.

Какие события он публикует (RabbitMQ):
issue.created: Создана новая задача.
Payload: { "issueId": 789, "projectId": 55, "creatorId": 123, "title": "Fix login bug" }
Кто слушает: notification-service (в будущем), аналитические сервисы.

issue.assigned: Задачу назначили на исполнителя.
Payload: { "issueId": 789, "assigneeId": 456, "assignedBy": 123 }
Кто слушает: notification-service (отправить уведомление исполнителю).

issue.status.changed: Изменился статус задачи (ToDo -> In Progress).
Payload: { "issueId": 789, "oldStatus": "ToDo", "newStatus": "In Progress", "changedBy": 123 }

issue.commented: Оставлен комментарий к задаче.
Payload: { "issueId": 789, "commentId": 101, "authorId": 456, "text": "Working on it..." }

4. sprint-service
Управляет спринтами и задачами в них.

Исходящие REST API (запросы к другим сервисам)
sprint-service -> project-service: GET /api/internal/projects/{id}
Цель: Валидация проекта при создании спринта.

sprint-service -> issue-service: GET /api/internal/issues/{id}
Цель: Валидация задачи при добавлении ее в спринт.

Публикуемые события (RabbitMQ)
sprint.created
Payload: { "sprintId": 11, "projectId": 55, "name": "Sprint 1" }

sprint.started
Payload: { "sprintId": 11, "projectId": 55 }

sprint.ended
Payload: { "sprintId": 11, "projectId": 55 }

issue.added.to.sprint
Payload: { "issueId": 789, "sprintId": 11, "projectId": 55 }

5. dashboard-service 
Агрегирует метрики и историю активности.

Исходящие REST API (запросы к другим сервисам)
dashboard-service -> user-service: GET /api/internal/users?ids=...
Цель: Разрешение user_id из ActivityLogs в данные о пользователях.

dashboard-service -> project-service: GET /api/internal/projects/{id}
Цель: Получение данных о проекте для дашборда.

Публикуемые события (RabbitMQ)
dashboard.snapshot.generated (публикуется по расписанию от SignalR сервера)
Payload: { "projectId": 55, "timestamp": "..." }

Подписанные события (RabbitMQ)
Слушает: project.created, project.member.added, issue.created, issue.assigned, issue.status.changed, sprint.created, sprint.started и т.д.
Действие: При получении события создает запись в таблице ActivityLogs.

6. notifications-service (Зависит от user-service)
Отправляет уведомления пользователям на основе их предпочтений.

Исходящие REST API (запросы к другим сервисам)
notifications-service -> user-service: GET /api/internal/users?ids={userId, triggeredById}
Цель: Валидация получателя и инициатора уведомления.

Публикуемые события (RabbitMQ)
notification.created
Payload: { "notificationId": 999, "userId": 456, "type": "issue_assigned", "message": "..." }
Назначение: Может быть использованоSignalR сервисом для real-time push-уведомления.

Подписанные события (RabbitMQ)
Слушает: project.member.added, issue.assigned, issue.commented, sprint.started и т.д.
Действие: При получении события проверяет userpreferences для целевого пользователя и, если уведомление разрешено, создает его в БД.

Итоговая таблица взаимодействия
project-service	user-service	    REST	GET /api/internal/users/{id}	      Валидация пользователя при добавлении в проект.
project-service	user-service	    REST	GET /api/internal/users?ids=...	      Получение данных о нескольких участниках.
issue-service	project-service	    REST	GET /api/internal/projects/{id}	      Валидация проекта и прав при изменении задачи.
issue-service	user-service	    REST	GET /api/internal/users/{id}	      Валидация создателя/исполнителя задачи.
issue-service	user-service	    REST	GET /api/internal/users?ids=	      Получение данных, упомянутых в задаче.
sprint-service	project-service	    REST	GET /api/internal/projects/{id}	      Валидация проекта при создании спринта.
sprint-service	issue-service	    REST	GET /api/internal/issues/{id}	      Валидация задачи при добавлении в спринт.
dashboard-service	user-service	REST	GET /api/internal/users?ids=...	      Разрешение ID пользователей в логах активности.
dashboard-service	project-service	REST	GET /api/internal/projects/{id}	      Получение данных о проекте для дашборда.
notifications-service	user-serviceREST	GET /api/internal/users?ids=...	      Валидация участников уведомления.

user-service	(All)	RabbitMQ	user.created	                          { "userId": 123, "email": "..." }
user-service	(All)	RabbitMQ	user.updated	                          { "userId": 123, "newEmail": "..." }
user-service	(All)	RabbitMQ	user.deleted	                          { "userId": 123 }
project-service	(All)	RabbitMQ	project.created	                          { "projectId": 55, "creatorId": 123 }
project-service	(All)	RabbitMQ	project.member.added	                  { "projectId": 55, "userId": 456 }
issue-service	(All)	RabbitMQ	issue.created	                          { "issueId": 789, "projectId": 55, "creatorId": 123 }
issue-service	(All)	RabbitMQ	issue.assigned	                          { "issueId": 789, "assigneeId": 456 }
issue-service	(All)	RabbitMQ	issue.status.changed	                  { "issueId": 789, "newStatus": "In Progress" }
sprint-service	(All)	RabbitMQ	sprint.created	                          { "sprintId": 11, "projectId": 55 }
sprint-service	(All)	RabbitMQ	sprint.started	                          { "sprintId": 11, "projectId": 55 }
dashboard-service	(All)	RabbitMQ	dashboard.snapshot.generated	      { "projectId": 55, "timestamp": "..." }
notifications-service	(All)	RabbitMQ	notification.created	          { "notificationId": 999, "userId": 456, "type": "..." }