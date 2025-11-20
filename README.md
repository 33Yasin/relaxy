````markdown
# Nefes Alıp Verme Uygulaması 🧘‍♂️

<div style="display: flex; gap: 10px; justify-content: center;">
![relaxy 1](https://github.com/user-attachments/assets/35f8ffff-8ec9-4a6f-9e75-9cbb6d6dfc5d)
![relaxy 2](https://github.com/user-attachments/assets/39bbdeb0-aa3b-405b-a04c-c2d11b7abe3a)
![relaxy 3](https://github.com/user-attachments/assets/20833069-519e-4a31-9f61-9f3d9a58f0c1)
</div>

**Kısa Açıklama:**  
Derin nefes egzersizleri ile stres azaltmayı, odaklanmayı, enerji artırmayı ve uyku kalitesini destekleyen mobil uygulama.

---

## Özellikler

- Farklı nefes egzersizi türleri:
  - **Box Breathing (Anksiyete)**
  - **4-7-8 Nefesi (Uyku)**
  - **Diyafram Nefesi (Enerji)**
  - **Alternatif Burun Deliği Nefesi (Odak)**
- Her egzersiz için özel animasyonlar: Çiçek, kar, su damlası ve eğik animasyonlar
- Nefes fazlarını gösteren görsel geri bildirim
- Sesli rehber veya sessiz seçenek
- Başlat / Durdur kontrolleri
- Detaylı açıklama ve ritim bilgileri

---

## Kurulum

1. Projeyi klonlayın:

```bash
git clone https://github.com/kullaniciadi/proje-adi.git
cd proje-adi
````

2. Bağımlılıkları yükleyin:

```bash
npm install
# veya
yarn install
```

3. Expo Go ile çalıştırın:

```bash
npx expo start
```

Ardından QR kodu Expo Go uygulaması ile tarayarak mobil cihazınızda uygulamayı görüntüleyebilirsiniz.

---

## Kullanım

* Ana ekranda egzersiz kartlarından birini seçin.
* Egzersizi başlatmak için **Başla** butonuna basın.
* Egzersiz sırasında nefes alma, tutma ve verme fazları görsel olarak gösterilir.
* İstersen egzersize ses ekleyebilirsiniz (loop veya sessiz seçenekler mevcut).
* Egzersizi durdurmak için **Bitir** butonuna basın.

---

## Dosya Yapısı (Önemli)

```
/components/animations        -> Egzersiz animasyonları
/constants/breathingSettings.js -> Egzersiz süreleri ve ayarlar
/screens/HomeScreen.js        -> Ana ekran
/screens/ExerciseScreen.js    -> Egzersiz ekranı
/assets/sounds                -> Ses dosyaları
```

---

## Teknolojiler

* React Native
* Expo
* Expo AV (Ses oynatma)
* React Native Safe Area Context
* Expo Blur (Blur efekti)
* @expo/vector-icons (İkonlar)

---

## Katkıda Bulunma

Projeye katkı yapmak istersen:

1. Fork yap
2. Branch oluştur: `git checkout -b feature/ozellik`
3. Değişiklikleri commit et: `git commit -m 'Yeni özellik ekledim'`
4. Push yap: `git push origin feature/ozellik`
5. Pull Request oluştur

---

## Lisans

Bu proje MIT Lisansı ile lisanslanmıştır.

```

---

İstersen ben bunu bir adım ileriye taşıyıp **daha profesyonel, güzel başlık ve renkli simgelerle süslü bir GitHub README** hâline de getirebilirim. Bunu yapayım mı?
```
