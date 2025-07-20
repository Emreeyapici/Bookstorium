package com.books.bookstorium.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.*;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // Tüm endpoint'ler için geçerli
                .allowedOrigins(
                    "https://bookstorium.vercel.app", // Vercel frontend
                    "https://bookstorium.shop", // Backend domain (HTTPS)
                    "http://bookstorium.shop", // Backend domain (HTTP)
                    "http://localhost:3000", // Geliştirme ortamı
                    "http://localhost:5500", // Live Server
                    "http://127.0.0.1:5500"  // Live Server alternatif
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600); // Preflight cache süresi
    }
}
