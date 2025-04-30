import React, { useState, useEffect } from 'react';
import '../loginStyles.css';

function RegisterPage({ onGoLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false); // 

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePassword = (password) =>
    password.length >= 6 && /[A-Z]/.test(password) && /\d/.test(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSuccess('');
    setIsSubmitting(true);

    let newErrors = {};
    if (!formData.name) newErrors.name = "Ad zorunludur";
    if (!formData.surname) newErrors.surname = "Soyad zorunludur";
    if (!validateEmail(formData.email)) newErrors.email = "Geçerli bir e-posta girin";
    if (!validatePassword(formData.password)) newErrors.password = "Şifre en az 6 karakter, büyük harf ve rakam içermelidir";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Şifreler eşleşmiyor";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          surname: formData.surname,
          email: formData.email.toLowerCase(),
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("✅ Kayıt başarılı! Lütfen e-postanızı doğrulayın.");
        setCooldown(60);
        setTimeout(() => {
          onGoLogin();
        }, 4000);
      } else {
        setErrors({ general: data.message || "Kayıt başarısız!" });
      }
    } catch (err) {
      setErrors({ general: "Sunucuya bağlanılamadı!" });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="login-wrapper page-fade">
      <div className="login-box">
      <h2 className="login-title">
  <span role="img" aria-label="kayıt">📝</span> Kayıt Ol
</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <label className="login-label">Ad</label>
          <input type="text" name="name" className="login-input" onChange={handleChange} required />

          <label className="login-label">Soyad</label>
          <input type="text" name="surname" className="login-input" onChange={handleChange} required />

          <label className="login-label">E-posta</label>
          <input type="email" name="email" className="login-input" onChange={handleChange} required />

          <label className="login-label">Şifre</label>
          <input type="password" name="password" className="login-input" onChange={handleChange} required />

          <label className="login-label">Şifre (Tekrar)</label>
          <input type="password" name="confirmPassword" className="login-input" onChange={handleChange} required />

          {Object.values(errors).map((msg, i) => (
            <p className="login-error" key={i}>{msg}</p>
          ))}

          {success && <p className="login-success">{success}</p>}
          {errors.general && <p className="login-error">{errors.general}</p>}

          <button type="submit" className="login-button" disabled={cooldown > 0 || isSubmitting}>
            {cooldown > 0 ? `Lütfen ${cooldown} saniye bekleyin...` : isSubmitting ? "Kaydediliyor..." : "Kaydol"}
          </button>

          <p className="login-link" onClick={onGoLogin}>
            Zaten hesabınız var mı? <span className="highlight-login">Giriş yapın</span>
          </p>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
