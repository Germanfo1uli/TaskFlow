# Документация по ручному запуску сервисов (WIP)
- **Проект:** `JiraCopy` (Исправить)  
- **СУБД:** `PostgreSQL`
- **Технологии бэкенда:** `Java Spring + .NET Web-API`

## Предварительная подготовка для подвязки API:
#### В Postgres создается база данных, в базе данных нужно создать схемы (например user_schema_service), название схемы можно взять из application.properties. 
#### После в каталоге подключаемого сервиса нужно создать файл с локальными переменными (root: src/main/java/recources): application-local.properties.

#### В него закидываются следующие строки:
```
spring.datasource.url=jdbc:postgresql://localhost:5432/JiravayaDB?currentSchema=user_service_schema
spring.datasource.username=postgres
spring.datasource.password=358711565
```
#### JiravayaDB заменить на свою бд, user_service_schema на нужную схему, username и password по усмотрению

## Гайд по запуску Java Spring приложений

#### В папке с сервисом (с файлом pom.xml) прописать команду:
```
mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

#### После запуска через нужный порт можно обращаться к эндпоинтам сервиса
#### По https://localhost:*/swagger-ui/index.html# можно зайти на сваггер, где расписана документация по эндпоинтам