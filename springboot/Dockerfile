FROM maven:3.9-eclipse-temurin-17-alpine AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn package -DskipTests

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
COPY --from=build /app/target/nearbuy-springboot-1.0.0.jar app.jar
EXPOSE 8080
CMD ["java", "-jar", "app.jar"]