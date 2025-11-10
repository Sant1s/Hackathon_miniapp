import React from 'react';
import { useApp } from '../context/AppContext';

const Navigation = ({ activeTab, onTabChange }) => {
    const { helperName, userPost, verificationData } = useApp();
    
    const isHelper = !!helperName;
    const isNeedy = !!(userPost && verificationData && verificationData.status === 'approved');
    
    const tabs = [
        { id: 'profile', label: 'Профиль', icon: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2', hidden: false },
        { id: 'charity', label: 'Благотворительность', icon: 'M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z', hidden: false },
        { id: 'chats', label: 'Чаты', icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', hidden: !isHelper && !isNeedy },
        { id: 'rating', label: 'Рейтинг', icon: 'M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2', hidden: !isHelper },
        { id: 'info', label: 'Поддержка', icon: 'M12 22h6a2 2 0 0 0 2-2V7l-5-5H6a2 2 0 0 0-2 2v10', hidden: false },
        { id: 'rules', label: 'Правила', icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H9', hidden: false }
    ];
    
    return (
        <nav className="navigation">
            {tabs.map(tab => {
                if (tab.hidden) return null;
                return (
                    <div
                        key={tab.id}
                        className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                    >
                        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d={tab.icon}></path>
                        </svg>
                        <span>{tab.label}</span>
                    </div>
                );
            })}
        </nav>
    );
};

export default Navigation;


