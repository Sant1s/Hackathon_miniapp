import { createContext, useContext, useState, useEffect } from 'react';
import { charityPosts } from '../data/charityPosts';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const [posts] = useState(charityPosts);
    const [chats, setChats] = useState([]);
    const [messages, setMessages] = useState({});
    const [userProfile, setUserProfile] = useState(null);
    const [donations, setDonations] = useState([]);
    const [currentPost, setCurrentPost] = useState(null);
    const [helperName, setHelperName] = useState(null);
    const [verificationData, setVerificationData] = useState(null);
    const [userPost, setUserPost] = useState(null);
    
    useEffect(() => {
        const savedChats = JSON.parse(localStorage.getItem('activeChats') || '[]');
        const savedProfile = JSON.parse(localStorage.getItem('userProfile') || 'null');
        const savedDonations = JSON.parse(localStorage.getItem('donations') || '[]');
        const savedHelperName = localStorage.getItem('helperName');
        const savedVerification = JSON.parse(localStorage.getItem('verificationData') || 'null');
        const savedUserPost = JSON.parse(localStorage.getItem('userPost') || 'null');
        
        if (savedChats.length > 0) setChats(savedChats);
        if (savedProfile) setUserProfile(savedProfile);
        if (savedDonations.length > 0) setDonations(savedDonations);
        if (savedHelperName) setHelperName(savedHelperName);
        if (savedVerification) setVerificationData(savedVerification);
        if (savedUserPost) setUserPost(savedUserPost);
        
        const savedMessages = {};
        savedChats.forEach(chat => {
            const chatKey = `chat_${chat.postId}`;
            const chatMessages = JSON.parse(localStorage.getItem(chatKey) || '[]');
            if (chatMessages.length > 0) {
                savedMessages[chatKey] = chatMessages;
            }
        });
        if (Object.keys(savedMessages).length > 0) {
            setMessages(savedMessages);
        }
    }, []);
    
    const addChat = (chat) => {
        const newChats = [...chats, chat];
        setChats(newChats);
        localStorage.setItem('activeChats', JSON.stringify(newChats));
    };
    
    const addMessage = (postId, message) => {
        const chatKey = `chat_${postId}`;
        const currentMessages = messages[chatKey] || [];
        const newMessages = [...currentMessages, message];
        
        setMessages(prev => ({
            ...prev,
            [chatKey]: newMessages
        }));
        
        localStorage.setItem(chatKey, JSON.stringify(newMessages));
    };
    
    const updateMessages = (postId, updatedMessages) => {
        const chatKey = `chat_${postId}`;
        setMessages(prev => ({
            ...prev,
            [chatKey]: updatedMessages
        }));
        localStorage.setItem(chatKey, JSON.stringify(updatedMessages));
    };
    
    const addDonation = (donation) => {
        const newDonations = [...donations, donation];
        setDonations(newDonations);
        localStorage.setItem('donations', JSON.stringify(newDonations));
    };
    
    const updateDonation = (postId, updates) => {
        const newDonations = donations.map(d => 
            d.postId === postId && !d.confirmed ? { ...d, ...updates } : d
        );
        setDonations(newDonations);
        localStorage.setItem('donations', JSON.stringify(newDonations));
    };
    
    const updateUserProfile = (profile) => {
        setUserProfile(profile);
        localStorage.setItem('userProfile', JSON.stringify(profile));
    };
    
    const updateHelperName = (name) => {
        setHelperName(name);
        localStorage.setItem('helperName', name);
    };
    
    const updateVerificationData = (data) => {
        setVerificationData(data);
        localStorage.setItem('verificationData', JSON.stringify(data));
    };
    
    const updateUserPost = (post) => {
        setUserPost(post);
        localStorage.setItem('userPost', JSON.stringify(post));
    };
    
    return (
        <AppContext.Provider value={{
            posts,
            chats,
            messages,
            userProfile,
            donations,
            currentPost,
            helperName,
            verificationData,
            userPost,
            setCurrentPost,
            addChat,
            addMessage,
            updateMessages,
            addDonation,
            updateDonation,
            updateUserProfile,
            updateHelperName,
            updateVerificationData,
            updateUserPost
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within AppProvider');
    }
    return context;
};


