FROM openjdk:17-jdk-slim
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN ./mvnw package -DskipTests
CMD ["java", "-jar", "target/order-0.0.1-SNAPSHOT.jar"]