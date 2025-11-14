import React, { useState } from 'react';

const Support = () => {
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showChatItem, setShowChatItem] = useState(false);

  const handleCategoryClick = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowChat(true);
    setShowChatItem(true);
    // Добавляем приветственное сообщение
    setMessages([{
      id: 1,
      text: 'Здравствуйте! Чем могу помочь?',
      isSupport: true,
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      isSupport: false,
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Симуляция ответа поддержки
    setTimeout(() => {
      const supportResponse = {
        id: messages.length + 2,
        text: 'Спасибо за обращение. Мы обработаем ваш запрос и свяжемся с вами в ближайшее время.',
        isSupport: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, supportResponse]);
    }, 1000);
  };

  const handleCloseChat = () => {
    setShowChat(false);
  };

  return (
    <div className="content-section active" id="info">
      <div className="support-container">
        <div className="header" style={{ marginBottom: '32px' }}>
          <div className="icon-wrapper">
            <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </div>
          <h1>Поддержка</h1>
          <p className="subtitle">Мы поможем решить вашу проблему</p>
        </div>

        {!showChat && (
          <div className="support-categories" id="supportCategories">
            <div className="support-category" onClick={() => handleCategoryClick('auth')}>
              <div className="support-category-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
              </div>
              <h3>Проблемы с авторизацией</h3>
              <p>Не могу войти в аккаунт, забыл пароль, проблемы с телефоном</p>
            </div>

            <div className="support-category" onClick={() => handleCategoryClick('sendMoney')}>
              <div className="support-category-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23"></line>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                </svg>
              </div>
              <h3>Проблемы с переводом средств</h3>
              <p>Не могу отправить деньги, перевод не прошел, проблемы с реквизитами</p>
            </div>

            <div className="support-category" onClick={() => handleCategoryClick('receiveMoney')}>
              <div className="support-category-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3>Проблемы с получением средств</h3>
              <p>Не пришли деньги, проблемы с верификацией, пост не отображается</p>
            </div>

            <div className="support-category" onClick={() => handleCategoryClick('other')}>
              <div className="support-category-icon">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
              <h3>Иное</h3>
              <p>Другие вопросы и проблемы</p>
            </div>
          </div>
        )}

        {showChatItem && !showChat && (
          <div className="support-chat-item" id="supportChatItem">
            <div className="support-chat-item-avatar">
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
              </svg>
            </div>
            <div className="support-chat-item-info" onClick={() => setShowChat(true)}>
              <div className="support-chat-item-name">Поддержка</div>
              <div className="support-chat-item-last-message" id="supportChatLastMessage">
                {messages.length > 0 ? messages[messages.length - 1].text : 'Начните диалог'}
              </div>
            </div>
          </div>
        )}

        {showChat && (
          <div className="support-chat-container" id="supportChatContainer">
            <div className="support-chat-window">
              <div className="support-chat-header">
                <div className="support-chat-header-info">
                  <div className="support-chat-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                    </svg>
                  </div>
                  <div>
                    <div className="support-chat-operator">Поддержка</div>
                    <div className="support-chat-status">онлайн</div>
                  </div>
                </div>
                <button className="support-close-btn" onClick={handleCloseChat}>
                  <svg viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
              <div className="support-chat-messages" id="supportChatMessages">
                {messages.map((msg) => (
                  <div key={msg.id} className={`support-chat-message ${msg.isSupport ? 'support-message' : 'user-message'}`}>
                    <div className="support-chat-message-text">{msg.text}</div>
                    <div className="support-chat-message-time">
                      {msg.timestamp.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
              </div>
              <div className="support-chat-input-container">
                <form onSubmit={handleSendMessage}>
                  <input
                    type="text"
                    className="support-chat-input"
                    id="supportChatInput"
                    placeholder="Напишите сообщение..."
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                  />
                  <button type="submit" className="support-chat-send-btn">
                    <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Support;

