package com.books.bookstorium.service;

import com.books.bookstorium.entity.Book;
import com.books.bookstorium.entity.CartItem;
import com.books.bookstorium.entity.User;
import com.books.bookstorium.repository.BookRepository;
import com.books.bookstorium.repository.CartItemRepository;
import com.books.bookstorium.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class CartService {

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private UserRepository userRepository;

    // Belirli bir kullanıcının sepetini getiren metot
    public List<CartItem> getCartItems(User user) {
        return cartItemRepository.findByUser(user);
    }

    // Bir kullanıcının sepetine kitap ekleyen metot
    public CartItem addBookToCart(User user, Long bookId) {
        // 1. Kullanıcının mevcut sepetini veritabanından alıyoruz.
        List<CartItem> cartItems = getCartItems(user);

        // 2. Eklenmek istenen kitabın, sepette zaten olup olmadığını kontrol ediyoruz.
        Optional<CartItem> existingCartItem = cartItems.stream()
                .filter(item -> item.getBook().getId().equals(bookId))
                .findFirst();

        if (existingCartItem.isPresent()) {
            // 3a. Eğer kitap zaten sepetteyse, miktarını 1 artırıyoruz.
            CartItem cartItem = existingCartItem.get();
            cartItem.setQuantity(cartItem.getQuantity() + 1);
            return cartItemRepository.save(cartItem);
        } else {
            // 3b. Eğer kitap sepette yoksa, yeni bir sepet öğesi oluşturuyoruz.
            // Önce kitabı ve kullanıcıyı veritabanından bulmamız lazım.
            Book book = bookRepository.findById(bookId)
                    .orElseThrow(() -> new RuntimeException("Kitap bulunamadı"));

            CartItem newCartItem = new CartItem();
            newCartItem.setUser(user);
            newCartItem.setBook(book);
            newCartItem.setQuantity(1);
            return cartItemRepository.save(newCartItem);
        }
    }
    // Bir kullanıcının sepetindeki tüm ürünleri siler.
    @CacheEvict(value = "books", allEntries = true)
    public void clearCart(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        cartItemRepository.deleteByUser(user);
        System.out.println(user.getEmail() + " kullanıcısının sepeti temizlendi.");
    }
    // Sepetten bir öğeyi ID'si ile siler ve önbelleği temizler.
    @CacheEvict(value = "books", allEntries = true) // Sepet değiştiği için kitap listesi önbelleğini de temizleyebiliriz.
    public void removeItemFromCart(Long cartItemId) {
        cartItemRepository.deleteById(cartItemId);
        System.out.println(cartItemId + " ID'li sepet ogesi veritabanindan silindi.");
    }
    // Sepetteki bir öğenin miktarını günceller.
    @CacheEvict(value = "books", allEntries = true)
    public CartItem updateItemQuantity(Long cartItemId, int quantity) {
        // Önce güncellenecek sepet öğesini ID'si ile buluyoruz.
        CartItem cartItem = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Sepet ogesi bulunamadi: " + cartItemId));

        if (quantity <= 0) {
            // Eğer yeni miktar 0 veya daha az ise, öğeyi sepetten tamamen siliyoruz.
            cartItemRepository.delete(cartItem);
            return null; // Silindiğini belirtmek için null döndürüyoruz.
        } else {
            // Eğer yeni miktar 0'dan büyükse, miktarı güncelleyip kaydediyoruz.
            cartItem.setQuantity(quantity);
            return cartItemRepository.save(cartItem);
        }
    }
}
