import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navigation from './components/Navigation';
import PostsList from './components/PostsList';
import PostDetail from './components/PostDetail';
import ChatList from './components/ChatList';
import Profile from './components/Profile';
import './App.css';

const AppContent = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [selectedPost, setSelectedPost] = useState(null);
    const { posts, helperName, userPost, verificationData } = useApp();
    
    const handleOpenPost = (post) => {
        setSelectedPost(post);
    };
    
    const handleClosePost = () => {
        setSelectedPost(null);
    };
    
    const renderContent = () => {
        switch (activeTab) {
            case 'profile':
                return <Profile />;
            case 'charity':
                return <PostsList posts={posts} onOpenPost={handleOpenPost} />;
            case 'chats':
                return <ChatList />;
            case 'rating':
                return <div className="content-section active"><h2>Рейтинг</h2><p>Функционал рейтинга будет добавлен</p></div>;
            case 'info':
                return <div className="content-section active"><h2>Поддержка</h2><p>Функционал поддержки будет добавлен</p></div>;
            case 'rules':
                return <div className="content-section active"><h2>Правила</h2><p>Правила платформы будут добавлены</p></div>;
            default:
                return <Profile />;
        }
    };
    
    return (
        <div className="app">
            <div className="container">
                <div className="sidebar">
                    <div className="sidebar-header">
                        <h2 className="sidebar-title">Помощь</h2>
                    </div>
                    <div className="sidebar-nav">
                        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
                    </div>
                </div>
                
                <div className="card">
                    {renderContent()}
                </div>
            </div>
            
            {selectedPost && (
                <PostDetail
                    post={selectedPost}
                    isOpen={!!selectedPost}
                    onClose={handleClosePost}
                />
            )}
        </div>
    );
};

const App = () => {
    return (
        <AppProvider>
            <AppContent />
        </AppProvider>
    );
};

export default App;


