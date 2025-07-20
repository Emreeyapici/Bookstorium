package com.books.bookstorium.repository;

import com.books.bookstorium.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {

    // Başlığında belirli bir kelimeyi içeren (büyük/küçük harf duyarsız) kitapları bulur.
    List<Book> findByTitleContainingIgnoreCase(String keyword);
}
