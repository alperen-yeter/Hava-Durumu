# Hava Durumu Uygulaması

Bu uygulama, kullanıcıların şehir ismine göre 5 günlük hava durumu tahminlerini görebileceği basit ve modern bir hava durumu web sitesidir. OpenWeatherMap API kullanılarak gerçek zamanlı veriler çekilmektedir.

### Özellikler:
- Şehir ismine göre arama yapılabilir.
- 5 günlük hava durumu bilgisi (maksimum & minimum sıcaklık, açıklama, nem, rüzgar).
- Türkçe ve İngilizce dil desteği.
- Geçmiş aramalar kaydedilir (LocalStorage).
- Hava sıcaklığına göre arka plan rengi otomatik değişir.
- Mobil uyumlu ve responsive tasarım.
- Açıklayıcı hata mesajları içerir.
- Kullanıcı dostu arayüz.

### Kullanılan Teknolojiler:
- HTML
- CSS
- JavaScript
- OpenWeatherMap API

### Açıklama:
Uygulama sade yapısı sayesinde kolayca kullanılabilir. Arama kutusuna şehir adı yazılır, dil seçilir ve "Ara" butonuna basılır. API'den alınan verilerle o güne ve sonraki 4 güne ait hava durumu kartları gösterilir. Arka plan rengi sıcaklık değerine göre dinamik olarak değişir. Ayrıca geçmişte yapılan aramalar listelenir, istenirse temizlenebilir.
