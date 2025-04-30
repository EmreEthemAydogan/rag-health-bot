import React, { useState } from 'react';
import botAvatar from '../assets/bot-avatar.png';
import userAvatar from '../assets/user-avatar.png';
import '../chatbotStyles.css';

const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([
    { fromUser: false, text: "Merhaba! Ben sağlık asistanınızım. Sorularınızı bekliyorum. 😊" }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { fromUser: true, text: input };
    setMessages(prev => [...prev, userMessage]);

    setTimeout(() => {
      const botResponse = {
        fromUser: false,
        text: "Bu sadece örnek bir yanıttır. Yakında gerçek cevaplarla bağlanacağım! 🤖"
      };
      setMessages(prev => [...prev, botResponse]);
    }, 800);

    setInput('');
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
