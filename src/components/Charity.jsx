import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';

const Charity = ({ onOpenPost }) => {
  const { posts, loading } = useApp();
  const [mode, setMode] = useState('initial'); // 'initial', 'intro', 'posts', 'userPost'
  const [helperName, setHelperName] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptProcessing, setShowReceiptProcessing] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const receiptFileInputRef = useRef(null);
  const receiptUploadAreaRef = useRef(null);
  const postsToShow = posts && posts.length > 0 ? posts : [];

  useEffect(() => {
    const savedHelperName = localStorage.getItem('helperName');
    if (savedHelperName) {
      setHelperName(savedHelperName);
      setMode('posts');
    }
  }, []);

  const handleWantToHelp = () => {
    setMode('intro');
  };

  const handleNeedHelp = () => {
    // Открыть форму верификации (пока просто показываем сообщение)
    alert('Форма верификации будет добавлена');
  };

  const handleHelperFormSubmit = (e) => {
    e.preventDefault();
    if (helperName.trim()) {
      localStorage.setItem('helperName', helperName);
      setMode('posts');
    }
  };

  const handlePaymentDetails = () => {
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleReceiptFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10 МБ
      if (file.size > maxSize) {
        alert('Размер файла превышает 10 МБ. Пожалуйста, выберите файл меньшего размера.');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Неподдерживаемый формат файла. Пожалуйста, выберите JPG, PNG или PDF.');
        return;
      }
      setReceiptFile(file);
      setReceiptFileName(`Выбран файл: ${file.name}`);
    }
  };

  const handleReceiptUploadClick = () => {
    receiptFileInputRef.current?.click();
  };

  const handleReceiptSubmit = () => {
    if (!receiptFile) {
      alert('Пожалуйста, выберите файл чека');
      return;
    }
    setShowPaymentModal(false);
    setShowReceiptProcessing(true);
    // Здесь будет логика отправки чека на сервер
    setTimeout(() => {
      setShowReceiptProcessing(false);
      setReceiptFile(null);
      setReceiptFileName('');
      alert('Чек успешно отправлен!');
    }, 3000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (receiptUploadAreaRef.current) {
      receiptUploadAreaRef.current.style.borderColor = '#3b82f6';
      receiptUploadAreaRef.current.style.background = 'rgba(59, 130, 246, 0.1)';
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (receiptUploadAreaRef.current) {
      receiptUploadAreaRef.current.style.borderColor = '#334155';
      receiptUploadAreaRef.current.style.background = 'transparent';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (receiptUploadAreaRef.current) {
      receiptUploadAreaRef.current.style.borderColor = '#334155';
      receiptUploadAreaRef.current.style.background = 'transparent';
    }
    const file = e.dataTransfer.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Размер файла превышает 10 МБ. Пожалуйста, выберите файл меньшего размера.');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Неподдерживаемый формат файла. Пожалуйста, выберите JPG, PNG или PDF.');
        return;
      }
      setReceiptFile(file);
      setReceiptFileName(`Выбран файл: ${file.name}`);
    }
  };

  const generatePostId = (id) => {
    if (!id) return 'N/A';
    const str = String(id);
    return str.padStart(6, '0');
  };

  return (
    <div className="content-section active" id="charity">
      <div className="header">
        <div className="header-content">
          <div className="icon-wrapper">
            <svg className="user-icon" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <h1>Благотворительность</h1>
            <p className="subtitle">Помогите тем, кто нуждается в поддержке</p>
          </div>
        </div>
      </div>

      {mode === 'initial' && (
        <div id="charityInitial">
          <div className="charity-buttons">
            <button className="charity-button" onClick={handleWantToHelp}>
              <svg viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              Я хочу помочь
            </button>
            <button className="charity-button" onClick={handleNeedHelp}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Мне нужна помощь
            </button>
          </div>
        </div>
      )}

      {mode === 'intro' && (
        <div id="introForm">
          <div className="intro-form">
            <h2>Представьтесь, пожалуйста</h2>
            <p>Чтобы продолжить, пожалуйста, представьтесь</p>
            <form id="helperForm" onSubmit={handleHelperFormSubmit}>
              <div className="form-group">
                <label htmlFor="helperName">Ваше имя</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input 
                    type="text" 
                    id="helperName" 
                    placeholder="Введите ваше имя" 
                    required
                    value={helperName}
                    onChange={(e) => setHelperName(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="submit-button">Продолжить</button>
            </form>
          </div>
        </div>
      )}

      {mode === 'posts' && (
        <div id="postsList">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <button id="paymentDetailsBtn" className="payment-details-button" onClick={handlePaymentDetails}>
              <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', stroke: 'currentColor', strokeWidth: '2', fill: 'none' }}>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              Реквизиты для помощи
            </button>
          </div>
          
          {loading && postsToShow.length === 0 ? (
            <div className="empty-content">
              <p>Загрузка постов...</p>
            </div>
          ) : postsToShow.length === 0 ? (
            <div className="empty-content">
              <svg className="empty-icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3 className="empty-title">Пока нет доступных постов</h3>
              <p className="empty-description">Посты появятся здесь после загрузки с сервера</p>
            </div>
          ) : (
            <div className="posts-grid">
              {postsToShow.map((post) => {
                const collected = post.collected || 0;
                const amount = post.amount || 0;
                const progress = amount > 0 ? (collected / amount * 100) : 0;
                const uniqueId = generatePostId(post.id);
                
                return (
                  <div 
                    key={post.id || Math.random()} 
                    className="post-card"
                    onClick={() => onOpenPost(post)}
                    style={{ '--progress-width': `${progress}%` }}
                  >
                    {post.images && post.images.length > 0 ? (
                      <img 
                        src={post.images[0]} 
                        alt={post.title || 'Пост'} 
                        className="post-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="post-image" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}></div>
                    )}
                    <div className="post-content">
                      <div className="post-author">
                        {post.author?.avatar ? (
                          <img 
                            src={post.author.avatar} 
                            alt={post.author?.name || 'Автор'} 
                            className="post-avatar"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="post-avatar" style={{ 
                            background: 'rgba(59, 130, 246, 0.2)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <svg style={{ width: '20px', height: '20px', stroke: '#3b82f6' }} viewBox="0 0 24 24">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </div>
                        )}
                        <div className="post-author-info">
                          <div className="post-author-name">
                            {post.author?.name || post.user?.name || 'Аноним'}
                          </div>
                        </div>
                      </div>
                      <h3 className="post-title">{post.title || 'Без названия'}</h3>
                      <div className="post-amount">
                        <div className="post-amount-content">
                          <span className="post-amount-collected">
                            {collected.toLocaleString('ru-RU')}
                            <span className="post-amount-currency">₽</span>
                          </span>
                          <span className="post-amount-separator">/</span>
                          <span className="post-amount-target">
                            {amount.toLocaleString('ru-RU')}
                            <span className="post-amount-currency">₽</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="post-id">ID: {uniqueId}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showPaymentModal && (
        <div className="payment-modal active" onClick={(e) => {
          if (e.target.classList.contains('payment-modal')) {
            closePaymentModal();
          }
        }}>
          <div className="payment-modal-content">
            <button className="payment-modal-close" onClick={closePaymentModal}>
              <svg viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h2 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>Реквизиты для помощи</h2>
            
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Инструкция по переводу</h3>
              <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '12px' }}>Для того чтобы помочь нуждающемуся, выполните следующие шаги:</p>
                <ol style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li style={{ marginBottom: '8px' }}>Откройте приложение вашего банка или перейдите на сайт банка</li>
                  <li style={{ marginBottom: '8px' }}>Выберите операцию "Перевод" или "Платеж"</li>
                  <li style={{ marginBottom: '8px' }}>Введите лицевой счет получателя (указан ниже)</li>
                  <li style={{ marginBottom: '8px' }}>Укажите сумму перевода</li>
                  <li style={{ marginBottom: '8px' }}><strong style={{ color: '#3b82f6' }}>Обязательно укажите в комментарии к переводу ID поста</strong> (ID указан справа вверху на карточке поста)</li>
                  <li style={{ marginBottom: '8px' }}>Проверьте данные и подтвердите перевод</li>
                </ol>
                <p style={{ color: '#fbbf24', fontWeight: '600', marginTop: '16px' }}>⚠️ Важно: Без указания ID поста в комментарии мы не сможем определить, кому именно предназначена помощь!</p>
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Реквизиты получателя</h3>
              <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '12px' }}><strong style={{ color: '#f1f5f9' }}>Получатель:</strong> ООО "Max"</p>
                <p style={{ marginBottom: '12px' }}><strong style={{ color: '#f1f5f9' }}>ИНН:</strong> 7707083893</p>
                <p style={{ marginBottom: '12px' }}><strong style={{ color: '#f1f5f9' }}>КПП:</strong> 770701001</p>
                <p style={{ marginBottom: '12px' }}><strong style={{ color: '#f1f5f9' }}>Банк:</strong> ПАО "Сбербанк"</p>
                <p style={{ marginBottom: '12px' }}><strong style={{ color: '#f1f5f9' }}>БИК:</strong> 044525225</p>
                <p style={{ marginBottom: '12px' }}><strong style={{ color: '#f1f5f9' }}>Корр. счет:</strong> 30101810400000000225</p>
                <p style={{ marginBottom: '0' }}><strong style={{ color: '#3b82f6', fontSize: '16px' }}>Лицевой счет:</strong> <span id="accountNumber" style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '700', fontFamily: "'Courier New', monospace", letterSpacing: '1px' }}>40817810099910004312</span></p>
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>QR-код для быстрого перевода</h3>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Отсканируйте QR-код в приложении вашего банка для быстрого перевода</p>
              <div id="qrCodeContainer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white', padding: '20px', borderRadius: '12px', margin: '0 auto', width: 'fit-content' }}>
                <img src="http://qrcoder.ru/code/?%CF%EE%EB%F3%F7%E0%F2%E5%EB%FC%3A+%CE%CE%CE+%22%CC%E0%EA%F1%22%0D%0A%0D%0A%C8%CD%CD%3A+7707083893%0D%0A%0D%0A%CA%CF%CF%3A+770701001%0D%0A%0D%0A%C1%E0%ED%EA%3A+%CF%C0%CE+%22%D1%E1%E5%F0%E1%E0%ED%EA%22%0D%0A%0D%0A%C1%C8%CA%3A+044525225%0D%0A%0D%0A%CA%EE%F0%F0.+%F1%F7%E5%F2%3A+30101810400000000225%0D%0A%0D%0A%CB%E8%F6%E5%E2%EE%E9+%F1%F7%E5%F2%3A+40817810099910004312&4&0" width="276" height="276" border="0" alt="QR код для перевода" style={{ display: 'block' }} />
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Загрузка чека о переводе</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
                После совершения перевода, пожалуйста, загрузите чек или скриншот операции для подтверждения платежа. 
                Это поможет нам быстрее обработать ваше пожертвование и направить средства нуждающемуся.
              </p>
              <div style={{ background: 'rgba(15, 22, 41, 0.5)', border: '1px solid #334155', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}><strong style={{ color: '#f1f5f9' }}>Доступные форматы:</strong> JPG, PNG, PDF</p>
                <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '0' }}><strong style={{ color: '#f1f5f9' }}>Максимальный размер файла:</strong> 10 МБ</p>
              </div>
              <div 
                ref={receiptUploadAreaRef}
                style={{ border: '2px dashed #334155', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '16px' }} 
                id="receiptUploadArea"
                onClick={handleReceiptUploadClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  ref={receiptFileInputRef}
                  type="file" 
                  id="receiptFileInput" 
                  accept="image/jpeg,image/png,image/jpg,application/pdf" 
                  style={{ display: 'none' }}
                  onChange={handleReceiptFileChange}
                />
                <svg style={{ width: '48px', height: '48px', stroke: '#64748b', margin: '0 auto 12px' }} viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Нажмите для загрузки чека</p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>или перетащите файл сюда</p>
                {receiptFileName && (
                  <p id="receiptFileName" style={{ color: '#3b82f6', fontSize: '13px', marginTop: '8px' }}>{receiptFileName}</p>
                )}
              </div>
              {receiptFile && (
                <button 
                  id="submitReceiptBtn" 
                  className="submit-receipt-button" 
                  style={{ width: '100%', height: '48px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}
                  onClick={handleReceiptSubmit}
                >
                  Отправить чек
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showReceiptProcessing && (
        <div className="receipt-processing-modal active">
          <div className="receipt-processing-content">
            <div style={{ width: '80px', height: '80px', border: '4px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }}></div>
            <h2 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700', marginBottom: '12px', textAlign: 'center' }}>Обработка чека</h2>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', textAlign: 'center' }}>
              Мы обрабатываем ваш чек о переводе. Это может занять некоторое время. 
              Вы получите уведомление, когда обработка будет завершена.
            </p>
            <p style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '600', textAlign: 'center', marginBottom: '24px' }}>Обычно обработка занимает 2-5 минут</p>
            <button 
              onClick={() => setShowReceiptProcessing(false)}
              style={{ width: '100%', height: '48px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Charity;

