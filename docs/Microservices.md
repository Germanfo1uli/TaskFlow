# Документация по микросервисной архитектуре проекта (WIP)
- **Проект:** `JiraCopy` (Исправить)  
- **СУБД:** `PostgreSQL`
- **ERD-диаграмма:** `SUPERServer.drawio (модули: Users, Board, Issues, Deadlines, Dashboard, Notifications)`

#### ВАЖНОЕ УКАЗАНИЕ: документация по микросервисам свойственна к сильным изменениям из за потребности в определенных эндпоинтах

#### Язык и фреймворк:
1. **Java Spring Boot (Maven)**
2. **.NET C#**

- **Каждый модуль (Users, Board, Issues, Deadlines, Dashboard, Notifications) - отдельный сервис**

## Ниже представлено разделение БД на 6 микросервисов в соответствии с модулями из DB_docs.md.
#### Каждый микросервис — отдельный сервис (Spring Boot или .NET), со своей схемой БД (можно в одной физической PostgreSQL, но с префиксами схем). Для каждого отдельного микросервиса в отдельных сущностях реализуются методы CRUD.

#### Важное указание: название схемы указывается как <название сервиса>_schema, например, user_service_schema.

#### Микросервисы для модулей Users, Board и Issues будут реализованы на Spring; Deadlines, Dashboard и Notifications - на .NET с использованием Entity Framework.

#### Для работы с продом будет создан API Gateway (Инструмент пока хз), настроен докер для запуска микросервисов и брокер для сообщений RabbitMQ, а также автоматическая миграция базы данных(Задача Dev-Ops разработчика).


## ВАЖНО:
#### На начале работы над микросервисом нужно реализовать все модели, определить в моделях связи (связи между отдельными модулями не нужны) и создать DbContext (.NET, в Spring использовать альтернативу), который позволит автоматически провести миграцию базы данных. 

#### База данных будет поделена на отдельные схемы, к которым и будет обращаться отдельный микросервис
#### Пример для .NET:
```"ConnectionStrings": {
    "Default": "Host=pg-primary;Database=jira_db;Username=issues_service;Password=xxx;SearchPath=issue_service_schema"
}
```

## Указаны:

- **Таблицы (из документации)**
- **Ключевые эндпоинты (из ТЗ + логически необходимые)**
- **Внутренняя логика / сервисы**
- **Внешние зависимости (другие микросервисы)**


## 1. Микросервис: Users
#### Назначение: Аутентификация, профили, аватары, сессии (JWT + Refresh), OAuth (WIP)

#### Основные эндпоинты (Auth API)
- **POST   /api/auth/login**
- **POST   /api/auth/refresh**
- **POST   /api/auth/logout**
- **POST   /api/auth/register**
- **GET    /api/users/me**
- **PUT    /api/users/me/profile**
- **PUT    /api/users/me/avatar**
- **GET    /api/users/me/preferences**
- **PUT    /api/users/me/preferences**

#### Внутренняя логика

- **AuthService: login, refresh, logout, ротация токенов**
- **UserService: профиль, аватар (S3/MinIO), настройки**
- **OAuth (WIP): Google/GitHub — WIP**


## 2. Микросервис: Board
#### Назначение: Проекты, участники, роли, права, кастомные статусы/теги

#### Основные эндпоинты
- **POST   /api/projects**
- **GET    /api/projects**
- **GET    /api/projects/{id}**
- **PUT    /api/projects/{id}**
- **DELETE /api/projects/{id}**
- **POST   /api/projects/{id}/members**
- **DELETE /api/projects/{id}/members/{userId}**
- **GET    /api/projects/{id}/members**
- **POST   /api/projects/{id}/roles**
- **GET    /api/projects/{id}/roles**
- **PUT    /api/projects/{id}/roles/{roleId}**

#### Внутренняя логика

- **ProjectService: CRUD, архивация**
- **RoleService: кастомные роли + права**
- **Проверка прав: middleware -> AuthorizationService.checkPermission(userId, projectId, action, resource)**


## 3. Микросервис: Issues
#### Назначение: Задачи, подзадачи, комментарии, вложения, иерархия, Kanban-доски

#### Основные эндпоинты
- **POST   /api/issues/{issueId}/convert-to-complex**
- **POST   /api/boards/{boardId}/issues**
- **PUT    /api/issues/{issueId}/column**
- **GET    /api/projects/{projectId}/tree**
- **GET    /api/issues/{id}**
- **PUT    /api/issues/{id}**
- **POST   /api/issues/{id}/comments**
- **POST   /api/issues/{id}/attachments**

#### Логика

- **IssueService: CRUD, иерархия, конвертация в сложную**
- **BoardService: создание доски при конвертации, колонки по умолчанию**
- **Drag & Drop: обновление status_id через колонку**
- **Дерево задач: один запрос → плоский список → фронт строит дерево**


## 4. Микросервис: Deadlines
#### Назначение: Спринты, планирование, привязка задач, завершение

#### Основные эндпоинты
- **POST   /api/projects/{projectId}/sprints**
- **GET    /api/projects/{projectId}/sprints**
- **GET    /api/sprints/{id}**
- **PUT    /api/sprints/{id}**
- **POST   /api/sprints/{sprintId}/issues**
- **POST   /api/sprints/{sprintId}/complete**
- **GET    /api/sprints/{sprintId}/board**

#### Логика

- **SprintService:**
    - **Валидация пересечения дат**
    - **Авто-удаление из других спринтов**
    - **Завершение: перенос незавершённых задач**
    - **getSprintBoard() -> список задач -> фронт рисует Kanban**


## 5. Микросервис: Dashboard (WIP)
#### Назначение: Аналитика, снапшоты, логи действий

#### Основные эндпоинты
- **GET    /api/projects/{projectId}/dashboard**
- **GET    /api/projects/{projectId}/activity**


## 6. Микросервис: Notifications (WIP)
#### Назначение: Генерация, доставка, настройки уведомлений

#### Основные эндпоинты
- **GET    /api/notifications**
- **PUT    /api/notifications/{id}/read**
- **DELETE /api/notifications**

#### Логика

- **NotificationService.notify(eventType, context)**
    - **Определяет получателей**
    - **Фильтрует по user_notification_preferences (из Users)**
    - **Создаёт notifications**
    - **Добавляет в очередь email (worker)**

#### События (примеры)

- **task_assigned, comment_added, sprint_started, issue_moved**