## 🎥 Demo
[Demo videosunu izlemek için tıklayın](./demo.mp4)

## 💻 Kaynak Kod
Projenin kaynak kodları [`master` branch’inde](../../tree/master) bulunmaktadır.

# rag-health-bot

Diyabet ve kalp krizi riskini tahmin eden, RAG tabanlı sağlık destekli yapay zekâ sohbet botu.

## 🧠 Proje Özeti
Bu proje, kullanıcıdan alınan sağlık verileri ile **Yapay Sinir Ağı (YSA)** modelleri üzerinden **diyabet** ve **kalp krizi** risk tahmini yapar.  
Ayrıca, **RAG (Retrieval-Augmented Generation)** yaklaşımıyla tasarlanmış bir sohbet botu üzerinden kullanıcıya sağlık odaklı, bağlama uygun yanıtlar üretir.

## ✨ Özellikler
- 🧬 **YSA ile hastalık tahmini:** Diyabet ve kalp krizi risk skoru/sonucu üretme
- 🤖 **RAG tabanlı sohbet botu:** Kullanıcının sorularına bağlam ve bilgi destekli yanıt üretme
- 🖼️ **Görsel işleme:** Image captioning benzeri akışlarla görselden anlam çıkarma
- 📄 **PDF işleme:** PDF’ten metin çıkarma ve içerik üzerinden analiz/yorumlama
- 📦 **Docker:** Uygulamayı container hâline getirme
- 🔁 **GitHub & DockerHub entegrasyonu:** Sürümleme ve imaj yönetimi

## 🧱 Kullanılan Teknolojiler
### Frontend
- **React.js**
- JavaScript, HTML, CSS

### Backend & ML
- **Python**
- **Flask**
- **TensorFlow / Keras** (YSA modelleri)

### RAG / LLM
- **RAG (Retrieval-Augmented Generation)**
- (Projede yer alan akışlara göre) **LangChain** ve **OpenAI API** entegrasyonu

### DevOps
- **Docker**
- Git, GitHub, DockerHub

## 🎯 Proje Amaçları
- Diyabet ve kalp krizi risklerini yapay zekâ ile tahmin etmek
- Kullanıcılara sağlık sorularında bağlama uygun ve tutarlı yanıtlar sunmak
- RAG mimarisi ile bilgi destekli cevap üretim mantığını uçtan uca göstermek
- Görsel/PDF gibi farklı veri türleriyle çalışabilen bir asistan altyapısı oluşturmak

