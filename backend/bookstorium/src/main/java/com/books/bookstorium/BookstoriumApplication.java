package com.books.bookstorium;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@SpringBootApplication
@EnableCaching
public class BookstoriumApplication {

	public static void main(String[] args) {
		SpringApplication.run(BookstoriumApplication.class, args);
	}

}
