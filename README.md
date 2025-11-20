Nefes Alıp Verme Uygulaması 🧘‍♂️
<div style="display: flex; gap: 10px; justify-content: center;"> ![relaxy 1](https://github.com/user-attachments/assets/860894e3-c88c-423b-8bc3-68c0ef29ed05) ![relaxy 2](https://github.com/user-attachments/assets/81d86c13-9ebb-4896-8adc-ce41caf76dbd) ![relaxy 3](https://github.com/user-attachments/assets/bb0a42c7-7586-4db9-b9c5-e626133161ed) </div>

Kısa Açıklama:
Derin nefes egzersizleri ile stres azaltmayı, odaklanmayı, enerji artırmayı ve uyku kalitesini destekleyen mobil uygulama.

Özellikler

Farklı nefes egzersizi türleri:

Box Breathing (Anksiyete)

4-7-8 Nefesi (Uyku)

Diyafram Nefesi (Enerji)

Alternatif Burun Deliği Nefesi (Odak)

Her egzersiz için özel animasyonlar: Çiçek, kar, su damlası ve eğik animasyonlar

Nefes fazlarını gösteren görsel geri bildirim

Sesli rehber veya sessiz seçenek

Başlat / Durdur kontrolleri

Detaylı açıklama ve ritim bilgileri

Kurulum

Projeyi klonlayın:

git clone https://github.com/kullaniciadi/proje-adi.git
cd proje-adi


Bağımlılıkları yükleyin:

npm install
# veya
yarn install


Expo Go ile çalıştırın:

npx expo start


Ardından QR kodu Expo Go uygulaması ile tarayarak mobil cihazınızda uygulamayı görüntüleyebilirsiniz.

Kullanım

Ana ekranda egzersiz kartlarından birini seçin.

Egzersizi başlatmak için Başla butonuna basın.

Egzersiz sırasında nefes alma, tutma ve verme fazları görsel olarak gösterilir.

İstersen egzersize ses ekleyebilirsiniz (loop veya sessiz seçenekler mevcut).

Egzersizi durdurmak için Bitir butonuna basın.

Dosya Yapısı (Önemli)
/components/animations        -> Egzersiz animasyonları
/constants/breathingSettings.js -> Egzersiz süreleri ve ayarlar
/screens/HomeScreen.js        -> Ana ekran
/screens/ExerciseScreen.js    -> Egzersiz ekranı
/assets/sounds                -> Ses dosyaları

Teknolojiler

React Native

Expo

Expo AV (Ses oynatma)

React Native Safe Area Context

Expo Blur (Blur efekti)

@expo/vector-icons (İkonlar)

Katkıda Bulunma

Projeye katkı yapmak istersen:

Fork yap

Branch oluştur: git checkout -b feature/ozellik

Değişiklikleri commit et: git commit -m 'Yeni özellik ekledim'

Push yap: git push origin feature/ozellik

Pull Request oluştur

Lisans

Bu proje MIT Lisansı ile lisanslanmıştır.
