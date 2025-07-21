package com.books.bookstorium.service;

import org.springframework.cache.annotation.CacheEvict;
import com.books.bookstorium.config.RabbitMQConfig;
import com.books.bookstorium.entity.Book;
import com.books.bookstorium.repository.BookRepository;
import org.springframework.amqp.core.AmqpTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookService {

    @Autowired
    private BookRepository bookRepository;

    // Spring'in mesaj gönderme yardımcısını buraya enjekte ediyoruz.
    @Autowired
    private AmqpTemplate rabbitTemplate;

    @Cacheable("books")
    public List<Book> findAll() {
        System.out.println("Veritabanindan kitaplar getiriliyor...");
        return bookRepository.findAll();
    }
    @CacheEvict(value = "books", allEntries = true)
    public Book save(Book book) {
        // Debug: Gelen kitap bilgilerini yazdır
        System.out.println("Gelen kitap bilgileri: " + book);
        
        // 1. Önce kitabı veritabanına kaydediyoruz.
        Book savedBook = bookRepository.save(book);
        
        // Debug: Kaydedilen kitap bilgilerini yazdır
        System.out.println("Kaydedilen kitap bilgileri: " + savedBook);

        // 2. Sonra RabbitMQ'ya bir mesaj gönderiyoruz.
        String message = "Yeni kitap eklendi: ID=" + savedBook.getId() + ", Baslik=" + savedBook.getTitle();
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, message);

        // 3. Konsola da bir işaret fişeği bırakıyoruz.
        System.out.println("Mesaj RabbitMQ'ya gonderildi: " + message);

        return savedBook;
    }

// ...

    // Kitabı ID ile siler ve önbelleği temizler.
    @CacheEvict(value = "books", allEntries = true)
    public void deleteBook(Long id) {
        bookRepository.deleteById(id);
        System.out.println(id + " ID'li kitap veritabanindan silindi.");
    }

    // Bir kitabı ID'si ile günceller ve önbelleği temizler.
    @CacheEvict(value = "books", allEntries = true)
    public Book updateBook(Long id, Book bookDetails) {
        // 1. Önce güncellenecek kitabı veritabanında ID'si ile buluyoruz.
        // .orElseThrow() -> Eğer o ID'de bir kitap bulamazsa, hata fırlatır.
        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bu ID'de kitap bulunamadi: " + id));

        // 2. Bulunan kitabın bilgilerini, dışarıdan gelen yeni bilgilerle güncelliyoruz.
        existingBook.setTitle(bookDetails.getTitle());
        existingBook.setAuthor(bookDetails.getAuthor());
        existingBook.setPrice(bookDetails.getPrice());
        existingBook.setImageUrl(bookDetails.getImageUrl());

        // Debug: Güncellenen kitap bilgilerini yazdır
        System.out.println("Güncellenen kitap bilgileri: " + existingBook);

        // 3. Güncellenmiş kitabı veritabanına geri kaydediyoruz.
        // JpaRepository, aynı ID'ye sahip bir nesneyi save() yaparsan, eskisini günceller.
        return bookRepository.save(existingBook);
    }

    // Kitapları anahtar kelimeye göre arayan metot.
    public List<Book> searchBooks(String keyword) {
        System.out.println("'" + keyword + "' için veritabanında arama yapılıyor...");
        return bookRepository.findByTitleContainingIgnoreCase(keyword);
    }
}
