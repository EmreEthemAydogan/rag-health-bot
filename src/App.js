import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import RegisterPage from './components/RegisterPage';
import DiabetesForm from './components/DiabetesForm';
import ResetPasswordPage from './components/ResetPasswordPage';
import EmailVerifyPage from './components/EmailVerifyPage';
import backgroundImage from './assets/diyabet.png';
import './styles.css';

const appStyle = {
  backgroundImage: `url(${backgroundImage})`,
  backgroundSize: 'cover',
  backgroundRepeat: 'no-repeat',
  backgroundPosition: 'center',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  overflow: 'auto',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',
  alignItems: 'center',
  paddingTop: '40px',
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const storedUser =
      JSON.parse(localStorage.getItem('currentUser')) ||
      JSON.parse(sessionStorage.getItem('currentUser'));

    const sessionTime = localStorage.getItem('sessionTime');

    if (
      storedUser &&
      storedUser.email_verified &&
      (!sessionTime || new Date().getTime() < parseInt(sessionTime))
    ) {
      setCurrentUser(storedUser);
      setIsLoggedIn(true);
    } else {
      handleLogout();
    }
  }, []);

  const handleLogin = (userData) => {
    setCurrentUser(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionTime');
    sessionStorage.removeItem('currentUser');
  };

  return (
    <Router>
      <div style={appStyle}>
        <Routes>
          <Route
            path="/"
            element={
              isLoggedIn ? (
                <div style={{ width: '100%' }}>
                  <p className="welcome-text">
  <span role="img" aria-label="selam">👋</span> Hoş geldin, {currentUser?.name}!
</p>

                  <button className="logout-button" onClick={handleLogout}>Çıkış Yap</button>
                  <DiabetesForm currentUser={currentUser} />
                  
                </div>
              ) : showRegister ? (
                <RegisterPage onGoLogin={() => setShowRegister(false)} />
              ) : (
                <LoginPage
                  onLogin={handleLogin}
                  onGoRegister={() => setShowRegister(true)}
                />
              )
            }
          />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="/verify-email/:token" element={<EmailVerifyPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
