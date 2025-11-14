import React, { useState, useEffect } from 'react';

const PostDetail = ({ post, isOpen, onClose }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    if (isOpen) {
      setCurrentImageIndex(0);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen || !post) return null;

  const images = post.images && post.images.length > 0 ? post.images : [post.image || '/placeholder.svg'];
  const totalImages = images.length;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex === 0 ? totalImages - 1 : prevIndex - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prevIndex) => (prevIndex === totalImages - 1 ? 0 : prevIndex + 1));
  };

  const progress = post.amount > 0 ? ((post.collected || 0) / post.amount * 100) : 0;
  const uniqueId = String(post.id).padStart(6, '0');

  return (
    <div
      className={`post-detail ${isOpen ? 'active' : ''}`}
      onClick={onClose}
    >
      <div
        className="post-detail-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="close-button" onClick={onClose}>
          <svg viewBox="0 0 24 24">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        <div className="detail-post-id">ID: {uniqueId}</div>

        <div className="post-detail-header">
          <img src={images[currentImageIndex]} alt={post.title} className="post-detail-image" />
          {totalImages > 1 && (
            <>
              <button className="detail-arrow detail-arrow-prev" onClick={handlePrevImage}>
                <svg viewBox="0 0 24 24">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
              </button>
              <button className="detail-arrow detail-arrow-next" onClick={handleNextImage}>
                <svg viewBox="0 0 24 24">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
              <div className="detail-image-counter">
                {currentImageIndex + 1} / {totalImages}
              </div>
            </>
          )}
        </div>

        <div className="post-detail-body">
          <div className="detail-author">
            <img src={post.avatar || '/placeholder-avatar.svg'} alt={post.authorName || 'Автор'} className="detail-avatar" />
            <div className="detail-author-info">
              <h3>{post.authorName || 'Неизвестный автор'}</h3>
              <p>Нуждается в помощи</p>
            </div>
          </div>

          <h2 className="post-detail-title">{post.title || 'Без названия'}</h2>
          <p className="post-detail-description">{post.description || 'Описание отсутствует.'}</p>

          <div className="post-detail-info">
            <div className="info-row">
              <span className="info-label">Собрано:</span>
              <span className="info-value">{(post.collected || 0).toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="info-row">
              <span className="info-label">Цель:</span>
              <span className="info-value">{post.amount.toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="info-row">
              <span className="info-label">Осталось:</span>
              <span className="info-value">{(post.amount - (post.collected || 0)).toLocaleString('ru-RU')} ₽</span>
            </div>
            <div className="info-row">
              <span className="info-label">Прогресс:</span>
              <div className="amount-display" style={{ '--progress-width': `${progress}%` }}>
                <div className="amount-display-content">
                  <span className="amount-display-collected">{(post.collected || 0).toLocaleString('ru-RU')}</span>
                  <span className="amount-display-separator">/</span>
                  <span className="amount-display-target">{post.amount.toLocaleString('ru-RU')}</span>
                  <span className="amount-display-currency">₽</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;

