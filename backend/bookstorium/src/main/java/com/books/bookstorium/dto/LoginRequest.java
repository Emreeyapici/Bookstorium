package com.books.bookstorium.dto;

// Bu sınıfın tek görevi, bir yerden bir yere veri taşımaktır.
// Hiçbir @Entity veya @Component gibi özel etiketi yoktur.
public class LoginRequest {

    private String email;
    private String password;

    // Getter ve Setter metotları
    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
