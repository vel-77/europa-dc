# Builds the Spring Boot jar and runs it on a Java runtime image.
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app
COPY .mvn .mvn
COPY mvnw pom.xml ./
RUN ./mvnw -q dependency:go-offline
COPY src src
RUN ./mvnw -q -DskipTests package && cp target/*.jar app.jar

FROM eclipse-temurin:21-jre
WORKDIR /app
# Runs as an unprivileged user; /data holds the database and uploaded files.
RUN useradd --system --uid 10001 europa && mkdir /data && chown europa /data
COPY --from=build /app/app.jar app.jar
USER europa
ENV SERVER_ADDRESS=0.0.0.0 PORT=8090 DATA_DIR=/data
EXPOSE 8090
CMD ["java", "-jar", "app.jar"]
