package com.books.bookstorium.config;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

// Bu etiketin anlamı: "Bu sınıf, proje için özel ayarlar ve bileşenler (Beans) içerir."
@Configuration
public class RabbitMQConfig {

    // Kodun içinde sürekli metin yazmamak için sabit değişkenler tanımlıyoruz.
    public static final String EXCHANGE_NAME = "book-exchange";
    public static final String QUEUE_NAME = "book-queue";
    public static final String ROUTING_KEY = "book.created";

    // Adım 1: Bir "Posta Kutusu" (Queue) tanımlıyoruz.
    // Mesajlarımızın, birisi onları alana kadar bekleyeceği yer burasıdır.
    @Bean
    Queue queue() {
        return new Queue(QUEUE_NAME, false);
    }

    // Adım 2: Bir "Postane" (Exchange) tanımlıyoruz.
    // Mesajları ilk olarak buraya göndeririz, o da doğru posta kutusuna yönlendirir.
    @Bean
    TopicExchange exchange() {
        return new TopicExchange(EXCHANGE_NAME);
    }

    // Adım 3: Posta Kutusunu Postaneye bağlıyoruz (Binding).
    // Bu, bir kuraldır: "Eğer postaneye 'book.created' anahtarıyla bir mektup gelirse,
    // onu 'book-queue' isimli posta kutusuna at."
    @Bean
    Binding binding(Queue queue, TopicExchange exchange) {
        return BindingBuilder.bind(queue).to(exchange).with(ROUTING_KEY);
    }
}
