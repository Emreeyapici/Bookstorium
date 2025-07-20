package com.books.bookstorium.service;

import com.books.bookstorium.entity.CartItem;
import com.books.bookstorium.entity.FavoriteItem;
import com.books.bookstorium.entity.User;
import com.books.bookstorium.entity.UserOrder;
import com.books.bookstorium.repository.CartItemRepository;
import com.books.bookstorium.repository.FavoriteItemRepository;
import com.books.bookstorium.repository.OrderRepository;
import com.books.bookstorium.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private FavoriteItemRepository favoriteItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    public User registerUser(User user) {
        System.out.println("registerUser çağrıldı: " + user);
        
        // Email kontrolü
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            System.out.println("Email zaten kayıtlı: " + user.getEmail());
            throw new RuntimeException("Bu email adresi zaten kayıtlı: " + user.getEmail());
        }
        
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        System.out.println("Yeni kullanici kaydediliyor: " + user.getEmail());
        
        User savedUser = userRepository.save(user);
        System.out.println("Kullanıcı başarıyla kaydedildi: " + savedUser.getId());
        return savedUser;
    }

    public User loginUser(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi veya e-posta hatali."));

        if (passwordEncoder.matches(password, user.getPassword())) {
            System.out.println("Kullanici giris yapti: " + user.getEmail());
            return user;
        } else {
            throw new RuntimeException("Hatali sifre.");
        }
    }

    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi: " + userId));

        // 1. Kullanıcıya ait tüm sepet öğelerini bul ve sil.
        List<CartItem> cartItems = cartItemRepository.findByUser(user);
        if (!cartItems.isEmpty()) {
            cartItemRepository.deleteAll(cartItems);
            System.out.println(user.getEmail() + " kullanicisina ait sepet temizlendi.");
        }

        // 2. Kullanıcıya ait tüm favori öğelerini bul ve sil.
        List<FavoriteItem> favoriteItems = favoriteItemRepository.findByUser(user);
        if (!favoriteItems.isEmpty()) {
            favoriteItemRepository.deleteAll(favoriteItems);
            System.out.println(user.getEmail() + " kullanicisina ait favoriler temizlendi.");
        }

        // 3. Kullanıcıya ait tüm siparişleri bul ve sil.
        List<UserOrder> orders = orderRepository.findByUserOrderByOrderDateDesc(user);
        if (!orders.isEmpty()) {
            orderRepository.deleteAll(orders);
            System.out.println(user.getEmail() + " kullanicisina ait siparişler temizlendi.");
        }

        // 4. Son olarak kullanıcının kendisini sil.
        userRepository.deleteById(userId);
        System.out.println(user.getEmail() + " kullanicisi veritabanindan silindi.");
    }
}

