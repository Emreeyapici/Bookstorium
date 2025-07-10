package com.books.bookstorium.listener;

import com.books.bookstorium.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

// @Component: Bu sınıfın, Spring tarafından yönetilecek genel bir bileşen olduğunu belirtir.
@Component
public class BookListener {

    // @RabbitListener: Bu metodu, belirli bir kuyruğu dinleyen bir "postacı" haline getirir.
    // queues = RabbitMQConfig.QUEUE_NAME -> "Sadece 'book-queue' isimli posta kutusunu dinle."
    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void handleMessage(String message) {
        // Posta kutusuna yeni bir mesaj geldiğinde, bu metot otomatik olarak çalışır.
        // Gelen mesaj, 'message' değişkenine atanır.

        System.out.println("=============================================");
        System.out.println("RabbitMQ'dan yeni bir mesaj alindi!");
        System.out.println("Mesaj Icerigi: " + message);
        System.out.println("Arka planda ilgili islemler yapiliyor (ornek: e-posta gonderimi, stok guncelleme)...");
        System.out.println("=============================================");
    }
}
