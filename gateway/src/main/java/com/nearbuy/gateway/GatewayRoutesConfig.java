package com.nearbuy.gateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class GatewayRoutesConfig {

    private static String httpUri(String host, int port) {
        return "http://" + host + ":" + port;
    }

    @Bean
    @Profile("docker")
    public RouteLocator dockerRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("springboot-route", r -> r
                        .path("/api/**")
                        .filters(f -> f
                                .rewriteLocationResponseHeader(
                                        "Location", "http://springboot-app:8080", "http://localhost:8000")
                                .rewriteLocationResponseHeader(
                                        "Location", "http://host.docker.internal:8080", "http://localhost:8000")
                                .rewriteLocationResponseHeader(
                                        "Location", "http://springboot-app", "http://localhost:8000"))
                        .uri(httpUri("host.docker.internal", 8080)))
                .route("django-route", r -> r
                        .path("/django/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri(httpUri("django-api", 8000)))
                .route("php-route", r -> r
                        .path("/php/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri(httpUri("php-api", 80)))
                .build();
    }

    @Bean
    @Profile("!docker")
    public RouteLocator localRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("springboot-route", r -> r
                        .path("/api/**")
                        .uri(httpUri("localhost", 8080)))
                .route("django-route", r -> r
                        .path("/django/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri(httpUri("localhost", 8002)))
                .route("php-route", r -> r
                        .path("/php/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri(httpUri("localhost", 8001)))
                .build();
    }
}
