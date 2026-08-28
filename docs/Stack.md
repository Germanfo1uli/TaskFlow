# Stack.md — Полный технологический стек бэкенда TaskFlow

Версии указаны дословно из pom.xml / .csproj. Проект мультиязычный: Java 25 (Spring Boot) + .NET 8 (C#).

---

## Языки и рантаймы
- Java 25 (user-service, board-service, issue-service, gateway-service, eureka-server)
- C# / .NET 8.0 (dashboard-service, sprints-service, notifications-service, shared-libs)
  - Внимание: часть NuGet-пакетов имеет версию 10.0.0 (см. ниже) при target framework net8.0 — микс пакетов разных линеек.

## Сборка и зависимости
- Maven (mvnw) — Java-сервисы
- NuGet / .NET SDK — C#-сервисы
- Docker: per-service Dockerfile.dev, backend/docker-compose.dev.yml, backend/.env.example, backend/init.sql, backend/servers.json.template

---

## Java-стек (Spring Boot)

### Платформа
- Spring Boot 3.5.7 (spring-boot-starter-parent)
- Spring Cloud 2025.0.0 (BOM: spring-cloud-dependencies)
- Java 25

### Общие стартеры (во всех Java-сервисах, где применимо)
- spring-boot-starter 3.5.7
- spring-boot-starter-web 3.5.7
- spring-boot-starter-webflux 3.5.7 (подключён во всех бизнес-сервисах, но не используется — сервлет-приложения)
- spring-boot-starter-test 3.5.7
- spring-boot-starter-actuator 3.5.7
- spring-boot-starter-validation 3.5.7
- lombok (без версии в pom — управляется parent)
- xstream 1.4.21
- httpclient 4.5.14
- guava 33.3.1-jre

### user-service
- spring-boot-starter-data-jpa 3.5.7
- spring-boot-starter-security 3.5.7
- spring-boot-starter-data-redis-reactive 3.5.7
- spring-boot-starter-amqp 3.5.7
- postgresql (runtime JDBC-драйвер, версия от parent)
- jjwt-api / jjwt-impl / jjwt-jackson 0.11.5
- springdoc-openapi-starter-webmvc-ui 2.8.6
- springdoc-openapi-starter-webflux-ui 2.8.6
- spring-cloud-starter-netflix-eureka-client 5.0.0

### board-service
- spring-boot-starter-data-jpa 3.5.7
- spring-boot-starter-security 3.5.7
- spring-boot-starter-data-redis-reactive 3.5.7
- spring-boot-starter-amqp 3.5.7
- spring-cloud-starter-openfeign (без версии — от BOM) + spring-cloud-starter-loadbalancer
- postgresql (runtime)
- springdoc-openapi-starter-webmvc-ui 2.8.6
- springdoc-openapi-starter-webflux-ui 2.8.6
- spring-cloud-starter-netflix-eureka-client 5.0.0
- xstream 1.4.21, httpclient 4.5.14, guava 33.3.1-jre
- Заметка: circuitbreaker.enabled=true, но resilience4j НЕ в зависимостях.

### issue-service
- spring-boot-starter-data-jpa 3.5.7
- spring-boot-starter-security 3.5.7
- spring-boot-starter-data-redis-reactive 3.5.7
- spring-boot-starter-amqp 3.5.7
- spring-cloud-starter-openfeign + spring-cloud-starter-loadbalancer
- postgresql (runtime)
- org.jetbrains:annotations RELEASE
- springdoc-openapi-starter-webmvc-ui 2.8.6
- springdoc-openapi-starter-webflux-ui 2.8.6
- spring-cloud-starter-netflix-eureka-client 5.0.0
- Заметка: circuitbreaker.enabled=true, но resilience4j НЕ в зависимостях.

### gateway-service
- spring-cloud-starter-gateway 4.3.2
- spring-cloud-gateway-server 4.3.2
- spring-boot-starter-data-redis-reactive 3.5.7
- jjwt-api / jjwt-impl / jjwt-jackson 0.12.6
- spring-boot-starter-actuator 3.5.7
- springdoc-openapi-starter-webflux-ui 2.8.6
- spring-cloud-starter-netflix-eureka-client 5.0.0
- xstream 1.4.21, httpclient 4.5.14, guava 33.3.1-jre

### eureka-server
- spring-cloud-starter-netflix-eureka-server (версия от spring-cloud-dependencies 2025.0.0)
- xstream 1.4.21, httpclient 4.5.14

---

## .NET-стек (C#)

### Общее
- Target framework: net8.0 (Nullable, ImplicitUsings включены)
- Microsoft.AspNetCore.OpenApi 8.0.8
- Swashbuckle.AspNetCore 6.4.0 (dashboard, notifications) / 6.5.0 (sprints)
- Steeltoe.Discovery.Eureka 4.0.0
- Steeltoe.Discovery.Configuration 4.0.0
- System.Text.Json 10.0.0 (пакет уровня .NET 10 при target net8.0)

### dashboard-service (Backend.Dashboards.Api)
- Microsoft.EntityFrameworkCore 8.0.0
- Microsoft.EntityFrameworkCore.Relational 8.0.0
- Microsoft.EntityFrameworkCore.Design 8.0.0
- Microsoft.EntityFrameworkCore.Tools 10.0.0 (пакет уровня .NET 10)
- Npgsql 8.0.4
- Npgsql.EntityFrameworkCore.PostgreSQL 8.0.0
- MassTransit 8.5.7
- MassTransit.RabbitMQ 8.5.7
- Refit.HttpClientFactory 9.0.2
- StackExchange.Redis 2.10.1
- Microsoft.Extensions.Caching.Memory 10.0.0 (подключён, НЕ используется)
- Microsoft.Extensions.Caching.StackExchangeRedis 8.0.22
- Microsoft.Extensions.Diagnostics.HealthChecks 8.0.0
- Microsoft.CodeAnalysis.Analyzers 3.11.0
- ProjectReference → shared-libs/Backend.Shared

### sprints-service (Backend.Sprints.Api)
- Microsoft.EntityFrameworkCore 8.0.0
- Microsoft.EntityFrameworkCore.Design 8.0.0
- Microsoft.EntityFrameworkCore.Relational 8.0.0
- Microsoft.EntityFrameworkCore.Tools 8.0.0
- Npgsql 8.0.4
- Npgsql.EntityFrameworkCore.PostgreSQL 8.0.0
- Refit.HttpClientFactory 8.0.0
- StackExchange.Redis 2.10.1
- Microsoft.Extensions.Caching.Memory 10.0.0
- Microsoft.Extensions.Caching.StackExchangeRedis 8.0.22
- Microsoft.Extensions.Diagnostics.HealthChecks 8.0.0
- Swashbuckle.AspNetCore 6.5.0
- System.Text.Json 10.0.0
- Steeltoe.Discovery.Eureka 4.0.0 / Configuration 4.0.0
- ProjectReference → shared-libs/Backend.Shared

### notifications-service (Backend.Notifications.Api)
- Microsoft.AspNetCore.OpenApi 8.0.8
- Microsoft.EntityFrameworkCore 8.0.0
- Microsoft.EntityFrameworkCore.Design 8.0.0
- Microsoft.EntityFrameworkCore.Relational 8.0.0
- Microsoft.EntityFrameworkCore.Tools 8.0.0
- Npgsql 8.0.8
- RabbitMQ.Client 7.2.0 (подключён, НЕ используется)
- Microsoft.Extensions.Caching.Memory 10.0.0
- Microsoft.Extensions.Diagnostics.HealthChecks 10.0.0
- Steeltoe.Discovery.Eureka 4.0.0 / Configuration 4.0.0
- Swashbuckle.AspNetCore 6.4.0
- System.Text.Json 10.0.0
- Microsoft.CodeAnalysis.Analyzers 3.11.0
- ProjectReference → shared-libs/Backend.Shared

### shared-libs (Backend.Shared)
- Целевая платформа: net8.0 (Nullable, ImplicitUsings)
- Внешних PackageReference НЕТ (только POCO/record DTO)
- Содержит Class1.cs (пустой дефолтный класс-заглушка)

---

## Базы данных
- PostgreSQL — основная СУБД всех сервисов, раздельные схемы:
  - user_service_schema (user-service)
  - board_service_schema (board-service)
  - issue_service_schema (issue-service)
  - dashboard_service_schema (dashboard-service)
  - sprints_service_schema (sprints-service)
- Redis — кэш и чёрный список токенов (user/board/issue/sprints/dashboard/gateway)
- Драйверы: PostgreSQL JDBC (Java), Npgsql 8.0.4 / Npgsql.EntityFrameworkCore.PostgreSQL 8.0.0 (.NET)
- ORM: Spring Data JPA (Java), EF Core 8.0.0 (.NET), авто-миграции (ddl-auto=update у Java; MigrateAsync у .NET)

## Брокер сообщений
- RabbitMQ — exchange "activity.exchange" (topic)
  - Издатели: board-service (Java AMQP), issue-service (Java AMQP)
  - Потребитель: dashboard-service (MassTransit 8.5.7 + MassTransit.RabbitMQ 8.5.7, queue "activity.all", routing key "#")
  - Клиенты: spring-boot-starter-amqp 3.5.7 (Java), RabbitMQ.Client 7.2.0 (notifications, не используется)

## Сервис-дискавери
- Netflix Eureka: spring-cloud-starter-netflix-eureka-server 2025.0.0 (eureka-server), spring-cloud-starter-netflix-eureka-client 5.0.0 (Java-клиенты), Steeltoe.Discovery.Eureka 4.0.0 (C#-клиенты)

## API Gateway
- Spring Cloud Gateway 4.3.2 (gateway-service), маршрутизация lb://<service>, JWT-фильтр, Redis-blacklist, агрегация Swagger

## Межсервисные HTTP-клиенты
- Java: Spring Cloud OpenFeign + spring-cloud-starter-loadbalancer (board-service, issue-service) с InternalAuthInterceptor
- .NET: Refit.HttpClientFactory 8.0.0 (sprints) / 9.0.2 (dashboard) с InternalAuthHandler (DelegatingHandler)

## Документация API
- Java: springdoc-openapi-starter-webmvc-ui 2.8.6
- .NET: Swashbuckle.AspNetCore 6.4.0 / 6.5.0, Microsoft.AspNetCore.OpenApi 8.0.8

## Безопасность (JWT)
- JJWT 0.11.5 (user-service, выпуск/валидация токенов)
- JJWT 0.12.6 (gateway-service, валидация на границе)
- Spring Security 3.5.7 (Java-сервисы, header-driven, не MVC Security)
- BCrypt (через spring-security) для паролей
- Заметка: общий секрет jwt.secret между user-service и gateway-service; downstream-сервисы доверяют заголовку X-Gateway-Source, а не подписи JWT.
