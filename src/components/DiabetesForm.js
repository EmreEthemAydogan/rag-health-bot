import React, { useState, useRef, useEffect } from 'react';
import { FaRobot } from 'react-icons/fa';
import { FaComments } from 'react-icons/fa';
import botAvatar from '../assets/diyabet.png';
import html2pdf from 'html2pdf.js';
import HeartStats from './HeartStats'; 
import ChatBot from './ChatBot';
import '../styles.css';

const diabetesLabels = {
  glucose: 'Glikoz Seviyesi',
  bloodPressure: 'Kan Basıncı (mm Hg)',
  skinThickness: 'Cilt Kalınlığı (mm)',
  insulin: 'İnsülin (mu U/ml)',
  bmi: 'Vücut Kitle İndeksi (BMI)',
  diabetesPedigree: 'Diyabet Genetik Skoru',
  age: 'Yaş',
};

const heartLabels = {
  age: 'Yaş',
  sex: 'Cinsiyet (1=Erkek, 0=Kadın)',
  cp: 'Göğüs Ağrısı Tipi (0-3)',
  trestbps: 'Dinlenme Kan Basıncı',
  chol: 'Kolesterol',
  fbs: 'Açlık Kan Şekeri (>120 mg/dl: 1)',
  restecg: 'EKG Sonucu (0-2)',
  thalach: 'Maksimum Kalp Atış Hızı',
  exang: 'Egzersizle Tetiklenen Angina (1=Evet)',
  oldpeak: 'ST Depresyonu',
  slope: 'ST Eğimi (0-2)',
  ca: 'Renkli Damarlarda Sayı (0-4)',
  thal: 'Thal Tipi (1=Normal, 2=Sabit, 3=Ters)',
};

function DiabetesForm({ currentUser }) {
  const [mode, setMode] = useState("diabetes");
  const [formData, setFormData] = useState({});
  const [result, setResult] = useState(null);
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);
  const [risk, setRisk] = useState(0);
  const [darkMode, setDarkMode] = useState(true);
  const [history, setHistory] = useState([]);
  const [emailStatus, setEmailStatus] = useState("");
  const [showChatbot, setShowChatbot] = useState(false);
  const [advancedHeart, setAdvancedHeart] = useState(false);
  const responseRef = useRef(null);

  const labels = mode === "diabetes" ? diabetesLabels : heartLabels;

  useEffect(() => {
    const initial = {};
    Object.keys(labels).forEach(key => (initial[key] = ''));
    setFormData(initial);
    setResult(null);
    setExplanation("");
    setRisk(0);
    setEmailStatus("");
  }, [mode]);

  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : '';
  }, [darkMode]);

  useEffect(() => {
    if (currentUser?.id) {
      fetch(`http://localhost:5000/history/${currentUser.id}`)
        .then(res => res.json())
        .then(data => setHistory(data.history || []))
        .catch(err => console.error("Geçmiş alınamadı:", err));
    }
  }, [currentUser]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateExplanation = () => {
    const exp = [];
    if (mode === "diabetes") {
      if (formData.glucose > 180) exp.push("🔹Glikoz seviyesi çok yüksek.");
      if (formData.bmi > 35) exp.push("🔹Yüksek BMI obezite riskine işaret eder.");
      if (formData.age > 60) exp.push("🔹İleri yaş diyabet riskini artırabilir.");
    } else {
      if (formData.chol > 250) exp.push("🔹Yüksek kolesterol seviyesi tespit edildi.");
      if (formData.oldpeak > 2) exp.push("🔹ST depresyonu kalp riski göstergesi olabilir.");
      if (formData.age > 65) exp.push("🔹Yaş faktörü kalp riskini artırabilir.");
    }
    return exp.length > 0 ? exp.join(" ") : "🔹Değerler normal aralıklarda görünüyor.";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setExplanation("");
    setEmailStatus("");

    try {
      const endpoint = mode === "diabetes"
        ? "/predict"
        : advancedHeart ? "/predict-heart-advanced" : "/predict-heart";


      const response = await fetch(`http://localhost:5000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: currentUser?.id,
          input_data: Object.fromEntries(
            Object.entries(formData).map(([key, val]) => [key, parseFloat(val)])
          ),
          mode: mode
        })
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data.tahmin);
        setRisk(data.oran * 100);
        setExplanation(generateExplanation());
        setEmailStatus("📨 Tahmin sonucu PDF olarak e-posta adresinize gönderildi.");

        if (currentUser?.id) {
          const historyRes = await fetch(`http://localhost:5000/history/${currentUser.id}`);
          const historyData = await historyRes.json();
          setHistory(historyData.history || []);
        }
      } else {
        setResult("Sunucu hatası: " + data.hata);
        setRisk(0);
      }
    } catch (err) {
      setResult("Bağlantı kurulamadı: " + err.message);
    }

    setLoading(false);
  };

  const handlePDFDownload = () => {
    if (responseRef.current) {
      html2pdf().from(responseRef.current).save("tahmin_sonucu.pdf");
    }
  };

  useEffect(() => {
    if (result && responseRef.current) {
      responseRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [result]);

  return (
    <>
      <div className="slide-bar">
        <h3>🩺 Menü</h3>
        <a onClick={() => setMode("diabetes")} href="#">💉 Diyabet Tahmini</a>
        <a onClick={() => setMode("heart")} href="#">❤️ Kalp Tahmini</a>
        <a href="#" onClick={() => setShowChatbot(prev => !prev)}>🤖 Sohbet Asistanı</a>
        <a href="#" onClick={() => setDarkMode(prev => !prev)}>🌓 Tema Değiştir</a>
      </div>

      <div className="form-container">
        <img src={botAvatar} alt="Asistan Görseli" className="chatbot-avatar" />
        <h2>Sağlık Asistanı</h2>

        <form onSubmit={handleSubmit}>
          {Object.entries(labels).map(([key, label]) => (
            <div key={key} className="form-group">
              <label className="form-label">{label}</label>
              <input
                type="number"
                name={key}
                value={formData[key] || ''}
                onChange={handleChange}
                required
                className="form-input"
                step="any"
              />
            </div>
          ))}

          {mode === "diabetes" && (
            <button type="submit" className="tahmin-button">
              <FaRobot style={{ marginRight: "8px" }} /> Tahmin Et
            </button>
          )}

          {mode === "heart" && (
            <div className="heart-button-group">
              <button
                type="submit"
                className="heart-option-button"
                onClick={() => setAdvancedHeart(false)}
              >
                ❤️ Klasik Kalp Tahmini
              </button>
              <button
                type="submit"
                className="heart-option-button"
                onClick={() => setAdvancedHeart(true)}
              >
                🚀 Gelişmiş Kalp Tahmini
              </button>
            </div>
          )}
        </form>

        {loading && <p className="typing">Asistan yazıyor...</p>}

        {result && (
          <div ref={responseRef} className="chatbox-response">
            <strong>Asistan:</strong> {result}
            <div className="risk-bar">
              <div className="risk-fill" style={{ width: `${risk}%` }}></div>
            </div>
            <p className="risk-text">Tahmini risk oranı: %{risk.toFixed(1)}</p>
            <p style={{ marginTop: '10px', fontStyle: 'italic' }}>🧠 Asistan: {explanation}</p>
            <p style={{ marginTop: '10px', color: '#4caf50', fontWeight: 'bold' }}>{emailStatus}</p>
            <button onClick={handlePDFDownload} className="tahmin-button" style={{ marginTop: '15px', backgroundColor: '#4CAF50' }}>
              📄 PDF İndir
            </button>
          </div>
        )}

        {history.length > 0 && (
          <div className="chatbox-response" style={{ marginTop: 30 }}>
            <strong>📜 Geçmiş Tahminler:</strong>
            <ul style={{ marginTop: 10, paddingLeft: 20 }}>
              {history.map((h, i) => (
                <li key={i}>
                  [{h.timestamp}] <strong>{h.mod}</strong> → {h.result} (%{h.oran})
                </li>
              ))}
            </ul>
            {mode === "heart" && currentUser?.id && (
  <div className="chatbox-response" style={{ marginTop: 30 }}>
    <strong>📉 Kalp Tahmini Analizi:</strong>
    <HeartStats userId={currentUser.id} />
  </div>
)}


            <button
              onClick={() => window.open(`http://localhost:5000/download-history/${currentUser.id}`, '_blank')}
              className="tahmin-button"
              style={{ marginTop: "20px", backgroundColor: "#2196F3" }}
            >
              📥 Tüm Geçmişi İndir (CSV)
            </button>
          </div>
        )}
      </div>

      {showChatbot && (
        <div className="chatbot-fixed">
          <ChatBot onClose={() => setShowChatbot(false)} />
        </div>
      )}
    </>
  );
}

export default DiabetesForm;
