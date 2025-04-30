import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, Legend, ResponsiveContainer
} from 'recharts';

function HeartStats({ userId }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;

    fetch(`http://localhost:5000/heart-history-analytics/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("Sunucudan veri alınamadı");
        return res.json();
      })
      .then(json => {
        if (json.dates && json.risks && json.ages && json.modes) {
          const combined = json.dates.map((date, i) => ({
            date,
            risk: json.risks[i],
            age: json.ages[i],
            mode: json.modes[i]
          }));
          setData(combined);
        } else {
          setError("Eksik veri alanları alındı.");
        }
      })
      .catch(err => {
        console.error("Hata:", err);
        setError("Sunucuya bağlanılamadı.");
      })
      .finally(() => setLoading(false));
  }, [userId]);

  if (loading) return <p>⏳ Yükleniyor...</p>;
  if (error) return <p style={{ color: "red" }}>❌ {error}</p>;
  if (data.length === 0) return <p>📉 Yeterli veri bulunamadı.</p>;

  // 🧠 Yaşlara göre klasik vs gelişmiş ayrıştırılmış veri grubu
  const grouped = data.reduce((acc, item) => {
    const existing = acc.find(a => a.age === item.age);
    if (existing) {
      if (item.mode === "heart") existing.risk_heart = item.risk;
      if (item.mode === "heart-pro") existing.risk_pro = item.risk;
    } else {
      acc.push({
        age: item.age,
        risk_heart: item.mode === "heart" ? item.risk : 0,
        risk_pro: item.mode === "heart-pro" ? item.risk : 0
      });
    }
    return acc;
  }, []);

  return (
    <div style={{ marginTop: "30px", background: "#fff2", padding: 20, borderRadius: 12 }}>
      <h3>📊 Kalp Tahmini Risk Trendleri</h3>

      <h4>📈 Tarihe Göre Risk Değişimi</h4>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" type="category" allowDuplicatedCategory={false} />
          <YAxis domain={[0, 100]} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="risk"
            data={data.filter(d => d.mode === "heart")}
            stroke="#f44336"
            name="❤️ Klasik"
          />
          <Line
            type="monotone"
            dataKey="risk"
            data={data.filter(d => d.mode === "heart-pro")}
            stroke="#9C27B0"
            name="🚀 Gelişmiş"
          />
        </LineChart>
      </ResponsiveContainer>

      <h4 style={{ marginTop: 30 }}>🧠 Yaşlara Göre Tahmin Dağılımı</h4>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={grouped}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="age" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="risk_heart" fill="#f44336" name="❤️ Klasik" />
          <Bar dataKey="risk_pro" fill="#9C27B0" name="🚀 Gelişmiş" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default HeartStats;
