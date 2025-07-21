package com.books.bookstorium.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(withDefaults()) // Alttaki corsConfigurationSource Bean'ini kullan
                .csrf(csrf -> csrf.disable()) // CSRF korumasını kapat

                // YETKİLENDİRME KURALLARI:
                .authorizeHttpRequests(auth -> auth
                        // NE OLURSA OLSUN, GELEN TÜM İSTEKLERE İZİN VER.
                        .anyRequest().permitAll()
                )

                .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.sameOrigin())); // H2 Console için

        return http.build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        // İzin verdiğimiz adresleri tek tek, açıkça listeliyoruz.
        configuration.setAllowedOrigins(List.of(
                "http://localhost:63342", // IntelliJ'nin kullandığı yerel adres
                "http://127.0.0.1:5500"    // Live Server gibi diğer yerel sunucular için
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}