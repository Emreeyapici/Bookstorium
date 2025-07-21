package com.books.bookstorium.entity;

import jakarta.persistence.*;
import java.io.Serializable;

@Entity
@Table(name = "cart_items")
public class CartItem implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Bu sepet öğesinin hangi kullanıcıya ait olduğunu belirtir.
    // @ManyToOne: "Çok" sepet öğesi, "Bir" kullanıcıya ait olabilir.
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false) // Veritabanında 'user_id' adında bir sütun oluşturur.
    private User user;

    // Bu sepet öğesinin hangi kitabı temsil ettiğini belirtir.
    // @ManyToOne: "Çok" sepet öğesi, "Bir" kitaba referans verebilir.
    @ManyToOne
    @JoinColumn(name = "book_id", nullable = false) // Veritabanında 'book_id' adında bir sütun oluşturur.
    private Book book;

    @Column(nullable = false)
    private int quantity; // Bu kitaptan sepette kaç adet olduğu.

    // --- Yapıcı Metotlar ---
    public CartItem() {
    }

    // --- Getter ve Setter Metotları ---
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Book getBook() {
        return book;
    }

    public void setBook(Book book) {
        this.book = book;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
