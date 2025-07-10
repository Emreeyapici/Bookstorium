package com.books.bookstorium.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// Bu etiketin anlamı: "Spring, bu sınıf dışarıdan gelen web isteklerini dinleyecek özel bir sınıftır."
@RestController
public class HelloController {

    // Bu etiketin anlamı: "Eğer birisi '/api/hello' adresine bir GET web isteği atarsa, aşağıdaki metodu çalıştır."
    @GetMapping("/api/hello")
    public String sayHello() {
        return "Merhaba Dunya! Ilk API'miz calisiyor!";
    }
}
