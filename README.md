# 🧠 RAG Health Bot

Bu proje, sağlık verilerine dayalı olarak kullanıcıdan gelen metinleri analiz eden ve akıllı cevaplar üreten bir yapay zeka tabanlı asistandır. Diyabet ve kalp krizi tahmini için eğitilmiş Yapay Sinir Ağı (YSA) modelleriyle birlikte çalışır.

## 🚀 Proje Hakkında

- 🧬 Yapay Sinir Ağı modelleriyle hastalık tahmini (diyabet, kalp krizi)
- 🤖 Sağlık alanında RAG (Retrieval-Augmented Generation) mimarisi kullanılarak geliştirilen Chatbot
- 🌐 React tabanlı kullanıcı arayüzü
- 📦 Docker ile konteynerleştirme
- 🔁 GitHub & DockerHub entegrasyonu

## 🛠️ Kullanılan Teknolojiler

- Python (TensorFlow, Flask)
- JavaScript (React)
- Git, GitHub, Docker
- LangChain, OpenAI API (RAG tarafı için)

## 📁 Klasör Yapısı

```bash
├── src/                  # React bileşenleri
├── public/               # HTML ve genel dosyalar
├── app.py                # Flask backend
├── *.h5                  # Eğitilmiş modeller
├── *.csv                 # Veri setleri
├── .gitignore
├── README.md
