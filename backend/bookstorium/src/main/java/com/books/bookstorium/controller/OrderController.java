package com.books.bookstorium.controller;

import com.books.bookstorium.entity.UserOrder;
import com.books.bookstorium.service.OrderService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class OrderController {

    @Autowired
    private OrderService orderService;

    // Belirli bir kullanıcının sepetinden bir sipariş oluşturan API.
    @PostMapping("/{userId}")
    @ResponseStatus(HttpStatus.CREATED)
    public UserOrder createOrder(@PathVariable Long userId) {
        return orderService.createOrder(userId);
    }

    // Belirli bir kullanıcının tüm siparişlerini getiren API.
    @GetMapping("/user/{userId}")
    public List<UserOrder> getUserOrders(@PathVariable Long userId) {
        return orderService.getUserOrders(userId);
    }
}