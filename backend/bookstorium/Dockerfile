# Adım 1: Temel Olarak Hangi Ortamı Kullanacağımızı Belirtiyoruz.
# Eclipse Temurin'in 17. versiyonu, iyi ve standart bir seçimdir.
# Bu satır, "İşe temiz bir Java 17 kurulu Linux makinesiyle başla" der.
FROM eclipse-temurin:21-jdk-jammy

# Adım 2: Projemizin .jar dosyasını Container'ın İçine Kopyalıyoruz.
# 'target/*.jar' -> Proje derlendiğinde target klasöründe oluşan .jar dosyasını seçer.
# 'app.jar' -> Container içindeki adının app.jar olmasını sağlarız.
COPY target/*.jar app.jar

# Adım 3: Bu Container Çalıştığında Hangi Komutun Yürütüleceğini Belirtiyoruz.
# 'java -jar app.jar' komutu, bizim Spring Boot uygulamamızı başlatır.
ENTRYPOINT ["java","-jar","/app.jar"]