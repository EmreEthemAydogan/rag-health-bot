import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../loginStyles.css';

function EmailVerifyPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('E-posta doğrulanıyor...');
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    const verify = async () => {
      try {
        const res = await fetch(`http://localhost:5000/verify-email/${token}`);
        const text = await res.text();

        if (res.ok) {
          setStatus('success');
          setMessage("✅ E-postanız başarıyla doğrulandı. Giriş sayfasına yönlendiriliyorsunuz...");
          setTimeout(() => navigate('/'), 4000); // 4 saniye sonra otomatik yönlendirme
        } else {
          setStatus('error');
          setMessage("❌ Geçersiz veya süresi dolmuş bağlantı!");
        }
      } catch (err) {
        setStatus('error');
        setMessage("❌ Doğrulama sırasında bir hata oluştu.");
      }
    };

    verify();
  }, [token, navigate]);

  const getColor = () => {
    if (status === 'success') return "#4caf50";
    if (status === 'error') return "#f44336";
    return "#333";
  };

  return (
    <div className="login-wrapper page-fade">
      <div className="login-box">
        <h2 className="login-title">📩 E-posta Doğrulama</h2>

        <p style={{
          marginTop: "20px",
          fontSize: "18px",
          color: getColor(),
          fontWeight: "500"
        }}>
          {message}
        </p>

        {status === 'pending' && (
          <div className="spinner-container" style={{ marginTop: "15px" }}>
            <span className="loading-icon"></span>
            <span className="sending-text">Doğrulama yapılıyor...</span>
          </div>
        )}

        {status === 'error' && (
          <button
            className="login-button"
            style={{ marginTop: "20px", backgroundColor: "#f44336" }}
            onClick={() => navigate('/')}
          >
            Ana Sayfaya Dön
          </button>
        )}
      </div>
    </div>
  );
}

export default EmailVerifyPage;
