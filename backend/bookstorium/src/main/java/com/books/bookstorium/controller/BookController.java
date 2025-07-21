package com.books.bookstorium.controller;

import com.books.bookstorium.entity.Book;
import com.books.bookstorium.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;



@RestController
@RequestMapping("/api/books") // BÜTÜN ADRESLERİN BAŞINA BUNU OTOMATİK EKLE DİYORUZ
public class BookController {


    @Autowired
    private BookService bookService;

    // GET /api/books
    @GetMapping
    public List<Book> getAllBooks() {
        return bookService.findAll();
    }

    // POST /api/books
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Book createBook(@RequestBody Book book) {
        return bookService.save(book);
    }

    // DELETE /api/books/{id}
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBook(@PathVariable Long id) {
        bookService.deleteBook(id);
    }

    // PUT /api/books/{id}
    @PutMapping("/{id}")
    public Book updateBook(@PathVariable Long id, @RequestBody Book bookDetails) {
        return bookService.updateBook(id, bookDetails);
    }

    // GET /api/books/search?query=...
    @GetMapping("/search")
    public List<Book> searchBooks(@RequestParam("query") String query) {
        return bookService.searchBooks(query);
    }
}

