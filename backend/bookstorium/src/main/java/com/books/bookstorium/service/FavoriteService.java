package com.books.bookstorium.service;

import com.books.bookstorium.model.Book;
import com.books.bookstorium.entity.FavoriteItem;
import com.books.bookstorium.entity.User;
import com.books.bookstorium.repository.BookRepository;
import com.books.bookstorium.repository.FavoriteItemRepository;
import com.books.bookstorium.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FavoriteService {

    @Autowired
    private FavoriteItemRepository favoriteItemRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private BookRepository bookRepository;

    // Favoriye ekleme veya çıkarma mantığı
    public boolean toggleFavorite(Long userId, Long bookId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        Book book = bookRepository.findById(bookId).orElseThrow(() -> new RuntimeException("Kitap bulunamadı"));

        Optional<FavoriteItem> existingFavorite = favoriteItemRepository.findByUserAndBook(user, book);

        if (existingFavorite.isPresent()) {
            // Eğer zaten favorilerdeyse, sil.
            favoriteItemRepository.delete(existingFavorite.get());
            System.out.println("Favorilerden çıkarıldı: " + book.getTitle());
            return false; // Çıkarıldığını belirtmek için false döndür
        } else {
            // Eğer favorilerde değilse, ekle.
            FavoriteItem newFavorite = new FavoriteItem();
            newFavorite.setUser(user);
            newFavorite.setBook(book);
            favoriteItemRepository.save(newFavorite);
            System.out.println("Favorilere eklendi: " + book.getTitle());
            return true; // Eklendiğini belirtmek için true döndür
        }
    }

    // Bir kullanıcının favori listesini getiren metot.
    public List<FavoriteItem> getFavorites(Long userId) {
        User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        return favoriteItemRepository.findByUser(user);
    }
}