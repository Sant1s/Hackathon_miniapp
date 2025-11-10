import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const PostDetail = ({ post, isOpen, onClose }) => {
    const [donationAmount, setDonationAmount] = useState(0);
    const [showReceiptUpload, setShowReceiptUpload] = useState(false);
    const [receiptPreview, setReceiptPreview] = useState(null);
    const { donations, addDonation, updateDonation, addChat, chats } = useApp();
    
    useEffect(() => {
        if (post) {
            setDonationAmount(0);
            setShowReceiptUpload(false);
            setReceiptPreview(null);
        }
    }, [post]);
    
    if (!isOpen || !post) return null;
    
    const confirmedDonation = donations.find(
        d => d.postId === post.id && d.confirmed
    );
    
    const handleDonate = () => {
        if (donationAmount > 0) {
            const donation = {
                postId: post.id,
                amount: parseInt(donationAmount),
                date: new Date().toISOString(),
                confirmed: false,
                receipt: null
            };
            addDonation(donation);
            setShowReceiptUpload(true);
            alert(`Спасибо! Теперь загрузите чек о переводе ${donationAmount.toLocaleString('ru-RU')} ₽`);
        }
    };
    
    const handleReceiptUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setReceiptPreview(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleSubmitReceipt = () => {
        if (receiptPreview) {
            const lastDonation = donations.find(d => d.postId === post.id && !d.confirmed);
            if (lastDonation) {
                setTimeout(() => {
                    updateDonation(post.id, { confirmed: true, receipt: receiptPreview });
                    alert('Чек подтвержден! Теперь вы можете общаться с получателем в чате.');
                    setShowReceiptUpload(false);
                    
                    const existingChat = chats.find(c => c.postId === post.id);
                    if (!existingChat) {
                        addChat({ postId: post.id, recipientName: post.authorName, recipientAvatar: post.avatar });
                    }
                }, 2000);
                alert('Чек отправлен на проверку. Ожидайте подтверждения...');
            }
        }
    };
    
    const handleOpenChat = () => {
        onClose();
    };
    
    return (
        <div 
            className="post-detail active" 
            onClick={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div className="post-detail-content">
                <button className="close-btn" onClick={onClose}>×</button>
                
                <div className="post-detail-header">
                    <img src={post.image} alt={post.title} className="detail-image" />
                </div>
                
                <div className="post-detail-body">
                    <div className="detail-author">
                        <img 
                            src={post.avatar} 
                            alt={post.authorName}
                            className="detail-author-avatar"
                        />
                        <div className="detail-author-name">{post.authorName}</div>
                    </div>
                    
                    <h2 className="detail-title">{post.title}</h2>
                    <p className="detail-description">{post.description}</p>
                    
                    <div className="detail-info">
                        <p>Сумма: <span className="detail-amount">
                            {post.amount.toLocaleString('ru-RU')} ₽
                        </span></p>
                        <p>Получатель: {post.recipient}</p>
                        <p>Банк: {post.bank}</p>
                        <p>Телефон: {post.phone}</p>
                    </div>
                    
                    {!confirmedDonation && !showReceiptUpload && (
                        <div className="donation-section">
                            <input
                                type="range"
                                min="0"
                                max={post.amount}
                                value={donationAmount}
                                onChange={(e) => setDonationAmount(e.target.value)}
                                className="detail-donation-slider"
                            />
                            <p className="detail-donation-value">
                                Ваше пожертвование: {donationAmount.toLocaleString('ru-RU')} ₽
                            </p>
                            <button 
                                className="donate-button"
                                onClick={handleDonate}
                                disabled={donationAmount === 0}
                            >
                                Пожертвовать
                            </button>
                        </div>
                    )}
                    
                    {showReceiptUpload && (
                        <div className="receipt-upload active">
                            <p>Загрузите чек о переводе</p>
                            <input 
                                type="file" 
                                accept="image/*,.pdf" 
                                onChange={handleReceiptUpload}
                            />
                            {receiptPreview && (
                                <div>
                                    <img src={receiptPreview} alt="Receipt" style={{maxWidth: '100%', marginTop: '12px'}} />
                                    <button onClick={handleSubmitReceipt}>Отправить чек</button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {confirmedDonation && (
                        <button 
                            className="open-chat-button active"
                            onClick={handleOpenChat}
                        >
                            Открыть чат
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PostDetail;

