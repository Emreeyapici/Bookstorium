package com.books.bookstorium.service;

import com.books.bookstorium.entity.CartItem;
import com.books.bookstorium.entity.OrderItem;
import com.books.bookstorium.entity.User;
import com.books.bookstorium.entity.UserOrder;
import com.books.bookstorium.repository.CartItemRepository;
import com.books.bookstorium.repository.OrderRepository;
import com.books.bookstorium.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    public UserOrder createOrder(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı: " + userId));

        List<CartItem> cartItems = cartItemRepository.findByUser(user);

        if (cartItems.isEmpty()) {
            throw new RuntimeException("Sipariş verilemez, sepet boş.");
        }

        UserOrder newOrder = new UserOrder();
        newOrder.setUser(user);
        newOrder.setOrderDate(LocalDateTime.now());

        double currentTotal = 0.0;

        for (CartItem cartItem : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(newOrder);
            orderItem.setBook(cartItem.getBook());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPriceAtPurchase(cartItem.getBook().getPrice()); // Fiyatı kaydet

            newOrder.getOrderItems().add(orderItem);

            currentTotal += (cartItem.getBook().getPrice() * cartItem.getQuantity());
        }

        newOrder.setTotalAmount(currentTotal); // Toplam tutarı kaydet

        UserOrder savedOrder = orderRepository.save(newOrder);
        cartItemRepository.deleteAll(cartItems);

        return savedOrder;
    }

    public List<UserOrder> getUserOrders(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Kullanıcı bulunamadı"));
        return orderRepository.findByUserOrderByOrderDateDesc(user);
    }
}