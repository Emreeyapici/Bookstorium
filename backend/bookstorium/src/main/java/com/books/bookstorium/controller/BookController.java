package com.books.bookstorium.controller;

import com.books.bookstorium.model.Book;
import com.books.bookstorium.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class BookController {

    // Spring'e "Bana BookService'i (mutfak şefini) bul ve otomatik olarak buraya bağla" diyoruz.
    // Buna "Dependency Injection" denir.
    @Autowired
    private BookService bookService;

    // GET isteği: Tüm kitapları getirir.
    @GetMapping("/api/books")
    public List<Book> getAllBooks() {
        // Artık listeyi kendi oluşturmuyor, işi BookService'e devrediyor.
        return bookService.findAll();
    }

    // POST isteği: Yeni bir kitap ekler.
    @PostMapping("/api/books")
    @ResponseStatus(HttpStatus.CREATED) // Başarılı olursa 201 Created durum kodu döndür.
    public Book createBook(@RequestBody Book book) {
        // Dışarıdan gelen JSON verisini Book nesnesine çevirip BookService'e kaydedilmesi için yollar.
        return bookService.save(book);
    }
}
