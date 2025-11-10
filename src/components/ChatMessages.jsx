import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { formatChatDate, formatMessageTime } from '../utils/helpers';
import ChatMessage from './ChatMessage';

const ChatMessages = ({ post, onBack }) => {
    const { messages, addMessage, updateMessages, userProfile } = useApp();
    const [inputText, setInputText] = useState('');
    const [pendingAttachment, setPendingAttachment] = useState(null);
    const messagesEndRef = useRef(null);
    
    const chatKey = `chat_${post.id}`;
    const chatMessages = messages[chatKey] || [];
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);
    
    useEffect(() => {
        const updatedMessages = chatMessages.map(m => {
            if (!m.isOwn) return { ...m, read: true };
            return m;
        });
        if (updatedMessages.length > 0 && updatedMessages.some(m => !m.isOwn && !m.read)) {
            updateMessages(post.id, updatedMessages);
        }
    }, [post.id, chatMessages, updateMessages]);
    
    const handleSend = () => {
        if (inputText.trim() || pendingAttachment) {
            const newMessage = {
                text: inputText.trim(),
                attachment: pendingAttachment,
                isOwn: true,
                timestamp: new Date().toISOString(),
                read: true,
                edited: false,
                avatar: userProfile?.photo || '/placeholder.svg'
            };
            addMessage(post.id, newMessage);
            setInputText('');
            setPendingAttachment(null);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };
    
    const handleAttachment = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setPendingAttachment(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleEdit = (message) => {
        const newText = prompt('Редактировать сообщение:', message.text);
        if (newText !== null && newText.trim() !== '') {
            const updatedMessages = chatMessages.map(m => 
                m === message ? { ...m, text: newText.trim(), edited: true } : m
            );
            updateMessages(post.id, updatedMessages);
        }
    };
    
    let lastDate = null;
    
    return (
        <div className="chat-view active">
            <div className="chat-header">
                <button className="chat-back-btn" onClick={onBack}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                    </svg>
                </button>
                <img src={post.avatar} alt={post.authorName} className="chat-recipient-avatar" />
                <div className="chat-recipient-name">{post.authorName}</div>
            </div>
            
            <div className="chat-messages" id="chatMessages">
                {chatMessages.map((msg, index) => {
                    const messageDate = formatChatDate(msg.timestamp);
                    const showDateSeparator = messageDate !== lastDate;
                    if (showDateSeparator) lastDate = messageDate;
                    
                    const messageWithAvatar = {
                        ...msg,
                        avatar: msg.isOwn 
                            ? (userProfile?.photo || '/placeholder.svg')
                            : post.avatar
                    };
                    
                    return (
                        <React.Fragment key={index}>
                            {showDateSeparator && (
                                <div className="chat-date-separator">
                                    <span className="chat-date-text">{messageDate}</span>
                                </div>
                            )}
                            <ChatMessage 
                                message={messageWithAvatar} 
                                onEdit={handleEdit}
                            />
                        </React.Fragment>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>
            
            <div className="chat-input-container">
                <input
                    type="file"
                    id="chatAttachment"
                    accept="image/*,video/*"
                    style={{ display: 'none' }}
                    onChange={handleAttachment}
                />
                <button 
                    onClick={() => document.getElementById('chatAttachment').click()}
                    className="emoji-btn"
                >
                    📎
                </button>
                <input
                    type="text"
                    className="chat-input"
                    placeholder="Введите сообщение..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={handleKeyPress}
                />
                <button className="chat-send-button" onClick={handleSend}>
                    Отправить
                </button>
            </div>
        </div>
    );
};

export default ChatMessages;

