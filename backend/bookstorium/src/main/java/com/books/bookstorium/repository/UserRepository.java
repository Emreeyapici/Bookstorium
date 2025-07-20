package com.books.bookstorium.repository;

import com.books.bookstorium.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA'nın sihirli metotlarından biri:
    // Sadece isimlendirme kuralına uyarak bu metodu yazdığımızda,
    // Spring bizim için e-postaya göre bir kullanıcı arayan SQL kodunu otomatik olarak yazar.
    Optional<User> findByEmail(String email);
}