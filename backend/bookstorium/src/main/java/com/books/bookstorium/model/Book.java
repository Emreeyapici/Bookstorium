package com.books.bookstorium.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

// @Entity: Bu sınıfın bir veritabanı tablosuna karşılık geldiğini belirtir.
// Tablonun adı, sınıf adıyla aynı (Book) olacaktır.
@Entity
public class Book implements java.io.Serializable {

    // @Id: 'id' alanının bu tablonun birincil anahtarı (Primary Key) olduğunu belirtir.
    @Id
    // @GeneratedValue: 'id' değerlerinin veritabanı tarafından otomatik olarak
    // (1, 2, 3... diye artarak) oluşturulacağını belirtir.
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String author;

    // JPA'nın bu sınıftan nesneler yaratabilmesi için gereken boş bir yapıcı metot.
    public Book() {
    }

    // Bu, bizim kodda kolayca nesne yaratmamız için gereken yapıcı metot.
    public Book(Long id, String title, String author) {
        this.id = id;
        this.title = title;
        this.author = author;
    }

    // Getter metotları...
    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getAuthor() {
        return author;
    }

    // Setter metotları...
    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setAuthor(String author) {
        this.author = author;
    }
}