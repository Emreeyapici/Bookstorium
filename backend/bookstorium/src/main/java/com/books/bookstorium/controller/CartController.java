package com.books.bookstorium.controller;

import com.books.bookstorium.entity.CartItem;
import com.books.bookstorium.entity.User;
import com.books.bookstorium.repository.UserRepository;
import com.books.bookstorium.service.CartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/cart") // Bu controller'daki tüm API'ların adresi /api/cart ile başlayacak.
public class CartController {

    @Autowired
    private CartService cartService;

    // CartService'in User nesnesine ihtiyacı olduğu için,
    // ID'den User'ı bulabilmek üzere UserRepository'yi de buraya enjekte ediyoruz.
    @Autowired
    private UserRepository userRepository;


    // Belirli bir kullanıcının sepetindeki tüm ürünleri getiren API.
    // Örneğin: /api/cart/1 -> 1 ID'li kullanıcının sepetini getirir.
    @GetMapping("/{userId}")
    public List<CartItem> getCartItems(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi: " + userId));
        return cartService.getCartItems(user);
    }
    // Bir kullanıcının sepetine yeni bir kitap ekleyen API.
    // Örneğin: /api/cart/1/add/3 -> 1 ID'li kullanıcıya, 3 ID'li kitabı ekler.
    @PostMapping("/{userId}/add/{bookId}")
    public CartItem addBookToCart(@PathVariable Long userId, @PathVariable Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanici bulunamadi: " + userId));
        return cartService.addBookToCart(user, bookId);
    }
    // Bir sepet öğesini kendi ID'si ile silen API.
    // Örneğin: /api/cart/item/2 -> 2 ID'li sepet öğesini siler.
    @DeleteMapping("/item/{cartItemId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeItemFromCart(@PathVariable Long cartItemId) {
        cartService.removeItemFromCart(cartItemId);
    }
    // Bir sepet öğesinin miktarını güncelleyen API.
    // Örneğin: /api/cart/item/2/update?quantity=5 -> 2 ID'li sepet öğesinin miktarını 5 yapar.
    @PutMapping("/item/{cartItemId}/update")
    public CartItem updateItemQuantity(@PathVariable Long cartItemId, @RequestParam int quantity) {
        return cartService.updateItemQuantity(cartItemId, quantity);
    }
    // Bir kullanıcının sepetindeki tüm ürünleri silen API.
    @DeleteMapping("/{userId}")
    public void clearCart(@PathVariable Long userId) {
        cartService.clearCart(userId);
    }
}
