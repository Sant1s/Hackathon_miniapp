import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { charityPosts } from '../data/charityPosts';
import ChatMessages from './ChatMessages';

const ChatList = () => {
    const { chats, messages, posts } = useApp();
    const [selectedChat, setSelectedChat] = useState(null);
    
    const getChatPost = (postId) => {
        return posts.find(p => p.id === postId) || charityPosts.find(p => p.id === postId);
    };
    
    const getUnreadCount = (postId) => {
        const chatKey = `chat_${postId}`;
        const chatMessages = messages[chatKey] || [];
        return chatMessages.filter(m => !m.isOwn && !m.read).length;
    };
    
    const getLastMessage = (postId) => {
        const chatKey = `chat_${postId}`;
        const chatMessages = messages[chatKey] || [];
        if (chatMessages.length === 0) return 'Начните диалог';
        const lastMsg = chatMessages[chatMessages.length - 1];
        if (lastMsg.text) {
            return lastMsg.text.length > 50 ? lastMsg.text.substring(0, 50) + '...' : lastMsg.text;
        } else if (lastMsg.attachment) {
            return 'Изображение';
        }
        return 'Начните диалог';
    };
    
    if (selectedChat) {
        const post = getChatPost(selectedChat);
        return (
            <ChatMessages 
                post={post} 
                onBack={() => setSelectedChat(null)} 
            />
        );
    }
    
    if (chats.length === 0) {
        return (
            <div className="empty-chats" id="emptyChats">
                <p className="empty-description" id="chatsDescription">
                    Здесь будут чаты, когда вам пожертвуют
                </p>
            </div>
        );
    }
    
    return (
        <div className="chats-list" id="chatsList">
            {chats.map(chat => {
                const post = getChatPost(chat.postId);
                if (!post) return null;
                const unreadCount = getUnreadCount(chat.postId);
                
                return (
                    <div 
                        key={chat.postId}
                        className="chat-item"
                        onClick={() => setSelectedChat(chat.postId)}
                    >
                        <img src={post.avatar} alt="" className="chat-item-avatar" />
                        <div className="chat-item-info">
                            <div className="chat-item-name">{post.authorName}</div>
                            <div className="chat-item-last-message">{getLastMessage(chat.postId)}</div>
                        </div>
                        {unreadCount > 0 && <span className="chat-item-notification"></span>}
                    </div>
                );
            })}
        </div>
    );
};

export default ChatList;

