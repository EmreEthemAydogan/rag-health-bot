import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../loginStyles.css';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();

    if (!password || !confirm) {
      setMessage("Lütfen tüm alanları doldurun.");
      setIsSuccess(false);
      return;
    }

    if (password.length < 6) {
      setMessage("Şifre en az 6 karakter olmalı.");
      setIsSuccess(false);
      return;
    }

    if (password !== confirm) {
      setMessage("Şifreler uyuşmuyor!");
      setIsSuccess(false);
      return;
    }

    setIsSending(true);
    setMessage("");

    try {
      const response = await fetch(`http://localhost:5000/reset-password/${token}`, {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password })
      });

      const data = await response.json();
      setMessage(data.message);
      setIsSuccess(response.ok);

      if (response.ok) {
        setTimeout(() => navigate('/'), 2500);
      }
    } catch (error) {
      setMessage("❌ Sunucu hatası oluştu.");
      setIsSuccess(false);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="login-wrapper page-fade">
      <div className="login-box">
        <h2 className="login-title">
          <span role="img" aria-label="kilit">🔐</span> Yeni Şifre Belirle
        </h2>
        <form onSubmit={handleReset}>
          <input
            type="password"
            className="login-input"
            placeholder="Yeni şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            type="password"
            className="login-input"
            placeholder="Şifreyi tekrar girin"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <button type="submit" className="login-button" disabled={isSending}>
            {isSending ? (
              <>
                <span className="loading-icon"></span> Gönderiliyor...
              </>
            ) : (
              "Şifreyi Güncelle"
            )}
          </button>

          {message && (
            <p className={isSuccess ? "login-success" : "login-error"}>{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
