package com.books.bookstorium.repository;

import com.books.bookstorium.entity.User;
import com.books.bookstorium.entity.UserOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<UserOrder, Long> {
    // Belirli bir kullanıcıya ait tüm siparişleri, sipariş tarihine göre
    // en yeniden en eskiye doğru sıralayarak getirir.
    List<UserOrder> findByUserOrderByOrderDateDesc(User user);
}
