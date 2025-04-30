import React, { useState } from 'react';
import './loginStyles.css';


function LoginPage({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showResetBox, setShowResetBox] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        if (!data.user.email_verified) {
          setError("Lütfen önce e-posta adresinizi doğrulayın.");
          return;
        }

        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('currentUser', JSON.stringify(data.user));
        const time = new Date().getTime() + 60 * 60 * 1000;
        localStorage.setItem('sessionTime', time);

        onLogin(data.user);
      } else {
        setError(data.message || "Giriş başarısız!");
      }
    } catch (err) {
      setError("Sunucuya bağlanılamadı!");
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  const handleForgotPassword = async () => {
    if (!resetEmail) return;
    setIsSending(true);
    setResetMessage('');

    try {
      const response = await fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();
      setResetMessage(data.message || "İşlem tamamlandı.");
    } catch (error) {
      setResetMessage("Bir hata oluştu.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="login-wrapper page-fade">
      <div className="login-box">
        <h2 className="login-title">
          <span role="img" aria-label="giriş">🔐</span> Giriş Yap
        </h2>
        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">E-posta</label>
          <input
            type="email"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="login-label">Şifre</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              className="login-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
      
          </div>

          <div className="remember-forgot">
            <label className="remember-me">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={() => setRememberMe(!rememberMe)}
              /> Beni Hatırla
            </label>
            <span className="forgot-password" onClick={() => {
              setShowResetBox(true);
              setResetEmail('');
              setResetMessage('');
              setIsSending(false);
            }}>Parolamı unuttum?</span>
          </div>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-button">Giriş Yap</button>

          <p className="login-link" onClick={onGoRegister}>
            Hesabınız yok mu? <span className="highlight-register">Kaydolun</span>
          </p>
        </form>

        {showResetBox && (
          <form
            className="reset-box"
            onSubmit={(e) => {
              e.preventDefault();
              handleForgotPassword();
            }}
          >
            <label>Lütfen kayıtlı e-posta adresinizi girin:</label>
            <input
              type="email"
              className="reset-input"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="ornek@gmail.com"
              required
            />

            <button type="submit" className="reset-button" disabled={isSending}>
              Gönder
            </button>

            {isSending && (
              <div className="spinner-container">
                <span className="loading-icon"></span>
                <span className="sending-text">Gönderiliyor...</span>
              </div>
            )}

            {resetMessage && <p className="reset-message">{resetMessage}</p>}

            <button type="button" className="reset-cancel" onClick={() => setShowResetBox(false)}>İptal</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
