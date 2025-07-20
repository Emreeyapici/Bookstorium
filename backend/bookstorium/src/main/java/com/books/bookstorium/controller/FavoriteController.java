package com.books.bookstorium.controller;

import com.books.bookstorium.entity.FavoriteItem;
import com.books.bookstorium.service.FavoriteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/favorites")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE})
public class FavoriteController {

    @Autowired
    private FavoriteService favoriteService;

    // Bir kitabın favori durumunu değiştiren (ekleyen/çıkaran) API.
    @PostMapping("/{userId}/toggle/{bookId}")
    public ResponseEntity<?> toggleFavorite(@PathVariable Long userId, @PathVariable Long bookId) {
        boolean isFavorited = favoriteService.toggleFavorite(userId, bookId);
        return ResponseEntity.ok().body("{\"isFavorited\":" + isFavorited + "}");
    }

    // Belirli bir kullanıcının favori listesini getiren API.
    @GetMapping("/{userId}")
    public List<FavoriteItem> getFavorites(@PathVariable Long userId) {
        return favoriteService.getFavorites(userId);
    }
}