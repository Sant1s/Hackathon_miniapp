import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, refreshApiClient } from '../api/client';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [helperName, setHelperName] = useState('');
  const [userPost, setUserPost] = useState(null);
  const [verificationData, setVerificationData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Загрузка постов
  const loadPosts = async () => {
    try {
      setLoading(true);
      const response = await apiClient.postsGet();
      if (response.data && response.data.data) {
        setPosts(response.data.data);
      } else if (response.data) {
        // Если данные в другом формате
        setPosts(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Ошибка загрузки постов:', err);
      const errorMessage = err.response 
        ? `Ошибка ${err.response.status}: ${err.response.statusText || err.message}`
        : err.message || 'Не удалось загрузить посты. Проверьте подключение к серверу.';
      setError(errorMessage);
      // Не устанавливаем ошибку как критическую, просто логируем
    } finally {
      setLoading(false);
    }
  };

  // Загрузка профиля пользователя
  const loadProfile = async () => {
    try {
      const response = await apiClient.usersMeGet();
      setUserProfile(response.data);
      if (response.data && response.data.name) {
        setHelperName(response.data.name);
      }
    } catch (err) {
      console.error('Ошибка загрузки профиля:', err);
      // Профиль может требовать авторизации - это нормально
      if (err.response && err.response.status === 401) {
        console.log('Требуется авторизация для просмотра профиля');
      }
    }
  };

  // Загрузка чатов
  const loadChats = async () => {
    try {
      const response = await apiClient.chatsGet();
      if (response.data && response.data.data) {
        setChats(response.data.data);
      } else if (response.data) {
        setChats(Array.isArray(response.data) ? response.data : []);
      }
    } catch (err) {
      console.error('Ошибка загрузки чатов:', err);
      // Чаты могут требовать авторизации - это нормально
      if (err.response && err.response.status === 401) {
        console.log('Требуется авторизация для просмотра чатов');
      }
    }
  };

  // Загрузка данных при монтировании
  useEffect(() => {
    // Обновляем клиент с токеном из localStorage
    refreshApiClient();
    
    loadPosts();
    // Загружаем профиль и чаты только если есть токен
    if (localStorage.getItem('token')) {
      loadProfile();
      loadChats();
    }
  }, []);

  const value = {
    posts,
    setPosts,
    helperName,
    setHelperName,
    userPost,
    setUserPost,
    verificationData,
    setVerificationData,
    userProfile,
    setUserProfile,
    chats,
    setChats,
    loading,
    error,
    loadPosts,
    loadProfile,
    loadChats,
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

