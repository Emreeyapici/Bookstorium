package com.books.bookstorium.repository;

import com.books.bookstorium.entity.Book;
import com.books.bookstorium.entity.FavoriteItem;
import com.books.bookstorium.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FavoriteItemRepository extends JpaRepository<FavoriteItem, Long> {

    // Belirli bir kullanıcıya ait tüm favori öğelerini bulur.
    List<FavoriteItem> findByUser(User user);

    // Belirli bir kullanıcının belirli bir kitabı favorilerine ekleyip eklemediğini bulur.
    Optional<FavoriteItem> findByUserAndBook(User user, Book book);
}