package com.books.bookstorium.repository;

import com.books.bookstorium.model.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    // Şimdilik burası boş kalacak! Tüm sihir JpaRepository'de.
}
