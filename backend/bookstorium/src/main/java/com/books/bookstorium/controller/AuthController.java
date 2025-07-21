package com.books.bookstorium.controller;

import com.books.bookstorium.dto.LoginRequest;
import com.books.bookstorium.entity.User;
import com.books.bookstorium.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    // Yeni kullanıcı kaydı için API endpoint'i
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public User registerUser(@RequestBody User user) {
        return userService.registerUser(user);
    }

    // Kullanıcı girişi için API endpoint'i
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody LoginRequest loginRequest) {
        try {
            // UserService'deki login metodunu çağırmayı deniyoruz.
            User user = userService.loginUser(loginRequest.getEmail(), loginRequest.getPassword());

            // Başarılı girişte, güvenlik için şifre alanını null yaparak geri döndürüyoruz.
            user.setPassword(null);
            return ResponseEntity.ok(user);

        } catch (RuntimeException e) {
            // Eğer UserService bir hata fırlatırsa (kullanıcı yok, şifre yanlış),
            // hatayı yakalayıp 401 Unauthorized (Yetkisiz) durum kodu ve hata mesajıyla geri döndürüyoruz.
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }

    // Bir kullanıcının hesabını ID'si ile silen API.
    @DeleteMapping("/user/{userId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable Long userId) {
        userService.deleteUser(userId);
    }
}