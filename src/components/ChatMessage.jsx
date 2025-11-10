import React from 'react';
import { formatMessageTime } from '../utils/helpers';

const ChatMessage = ({ message, onEdit }) => {
    return (
        <div className={`chat-message ${message.isOwn ? 'own' : ''}`}>
            <img 
                src={message.avatar} 
                alt="" 
                className="message-avatar" 
            />
            <div className="message-content">
                {message.text && (
                    <div className="message-text">{message.text}</div>
                )}
                {message.attachment && (
                    <img 
                        src={message.attachment} 
                        alt="Attachment" 
                        className="message-attachment" 
                    />
                )}
                <div className="message-time">
                    {formatMessageTime(message.timestamp)}
                    {message.edited && <span className="edited-badge">изменено</span>}
                </div>
                {message.isOwn && (
                    <div className="message-actions">
                        <button 
                            className="message-edit-btn"
                            onClick={() => onEdit(message)}
                        >
                            Редактировать
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatMessage;


