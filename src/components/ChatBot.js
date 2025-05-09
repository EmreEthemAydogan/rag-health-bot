import React, { useState } from 'react';
import botAvatar from '../assets/bot-avatar.png';
import userAvatar from '../assets/user-avatar.png';
import '../chatbotStyles.css';

const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { fromUser: false, text: "Merhaba! Ben sağlık asistanınızım. Sorularınızı bekliyorum. 😊" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { fromUser: true, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Geçici yükleniyor mesajı
    setMessages(prev => [
      ...prev,
      { fromUser: false, text: "Yanıt oluşturuluyor... ⏳" }
    ]);

    try {
      const response = await fetch("http://localhost:8000/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ question: input })
      });

      const data = await response.json();

      // Yükleniyor mesajını kaldır ve gerçek yanıtı ekle
      setMessages(prev => [
        ...prev.slice(0, -1),
        { fromUser: false, text: data.answer || "Üzgünüm, şu anda bir cevap veremiyorum." }
      ]);

    } catch (error) {
      console.error("Hata:", error);
      setMessages(prev => [
        ...prev.slice(0, -1),
        { fromUser: false, text: "Bir hata oluştu. Lütfen tekrar deneyin." }
      ]);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="chatbox-container">
      <div className="chatbox-header">
        Sohbet Asistanı
        <button className="chatbox-close" onClick={onClose}>×</button>
      </div>

      <div className="chatbox-messages">
        {messages.map((msg, i) => (
          <div key={i} className="chat-msg">
            <img
              src={msg.fromUser ? userAvatar : botAvatar}
              alt="avatar"
              className="chat-avatar"
            />
            <div className={msg.fromUser ? "chat-user" : "chat-bot"}>
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <div className="chatbox-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Mesajınızı yazın..."
        />
        <button onClick={handleSend}>Gönder</button>
      </div>
    </div>
  );
};

export default ChatBot;
