# ---- Build Stage ----
FROM maven:3.9.6-eclipse-temurin-21 AS build
WORKDIR /app
COPY . .
RUN mvn clean package -DskipTests
RUN ls -lah /app/target

# ---- Runtime Stage ----
FROM eclipse-temurin:21-jdk
WORKDIR /app
COPY --from=build /app/target/*.jar ignite.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "ignite.jar"]
