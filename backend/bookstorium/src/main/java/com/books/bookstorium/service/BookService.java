package com.books.bookstorium.service;

import com.books.bookstorium.config.RabbitMQConfig;
import com.books.bookstorium.model.Book;
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

    public Book save(Book book) {
        // 1. Önce kitabı veritabanına kaydediyoruz.
        Book savedBook = bookRepository.save(book);

        // 2. Sonra RabbitMQ'ya bir mesaj gönderiyoruz.
        String message = "Yeni kitap eklendi: ID=" + savedBook.getId() + ", Baslik=" + savedBook.getTitle();
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, message);

        // 3. Konsola da bir işaret fişeği bırakıyoruz.
        System.out.println("Mesaj RabbitMQ'ya gonderildi: " + message);

        return savedBook;
    }
}
