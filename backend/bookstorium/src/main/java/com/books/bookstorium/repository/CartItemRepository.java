package com.books.bookstorium.repository;

import com.books.bookstorium.entity.CartItem;
import com.books.bookstorium.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByUser(User user);
    // Bir kullanıcıya ait tüm sepet öğelerini siler.
    void deleteByUser(User user);
    // Spring Data JPA'nın sihri sayesinde, temel veritabanı işlemleri için metot yazmamıza gerek yok.
}