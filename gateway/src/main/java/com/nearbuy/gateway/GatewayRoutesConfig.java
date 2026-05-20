package com.nearbuy.gateway;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

@Configuration
public class GatewayRoutesConfig {

    @Bean
    @Profile("docker")
    public RouteLocator dockerRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("springboot-route", r -> r
                        .path("/api/**")
                        .uri("http://host.docker.internal:8080"))
                .route("django-route", r -> r
                        .path("/django/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://django-api:8000"))
                .route("php-route", r -> r
                        .path("/php/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://php-api:80"))
                .build();
    }

    @Bean
    @Profile("!docker")
    public RouteLocator localRoutes(RouteLocatorBuilder builder) {
        return builder.routes()
                .route("springboot-route", r -> r
                        .path("/api/**")
                        .uri("http://localhost:8080"))
                .route("django-route", r -> r
                        .path("/django/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8002"))
                .route("php-route", r -> r
                        .path("/php/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri("http://localhost:8001"))
                .build();
    }
}
