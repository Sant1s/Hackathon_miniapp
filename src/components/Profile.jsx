import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import Login from './Login';

const Profile = ({ isLightTheme, onThemeToggle }) => {
  const { userProfile, loading, loadProfile } = useApp();
  const [showLogin, setShowLogin] = useState(!localStorage.getItem('token'));
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    password: '',
    photo: null
  });
  const [photoPreview, setPhotoPreview] = useState(null);

  // Загрузка сохраненного профиля
  useEffect(() => {
    const savedProfile = JSON.parse(localStorage.getItem('userProfile') || 'null');
    if (savedProfile) {
      if (savedProfile.photo) {
        setPhotoPreview(savedProfile.photo);
      }
      setFormData({
        firstName: savedProfile.firstName || '',
        lastName: savedProfile.lastName || '',
        phone: savedProfile.phone || '',
        password: savedProfile.password || '',
        photo: savedProfile.photo || null
      });
    }
    
    if (userProfile) {
      setFormData(prev => ({
        ...prev,
        firstName: userProfile.name?.split(' ')[0] || prev.firstName,
        lastName: userProfile.name?.split(' ').slice(1).join(' ') || prev.lastName,
        phone: userProfile.phone || prev.phone
      }));
    }
  }, [userProfile]);

  const handleLoginSuccess = (user) => {
    setShowLogin(false);
    loadProfile();
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const photoData = event.target.result;
        setPhotoPreview(photoData);
        const updatedFormData = { ...formData, photo: photoData };
        setFormData(updatedFormData);
        localStorage.setItem('userProfile', JSON.stringify(updatedFormData));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePhoneInput = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 0) {
      if (value[0] !== '7') {
        value = '7' + value;
      }
      let formatted = '+7';
      if (value.length > 1) {
        formatted += ' (' + value.substring(1, 4);
      }
      if (value.length >= 5) {
        formatted += ') ' + value.substring(4, 7);
      }
      if (value.length >= 8) {
        formatted += '-' + value.substring(7, 9);
      }
      if (value.length >= 10) {
        formatted += '-' + value.substring(9, 11);
      }
      setFormData(prev => ({ ...prev, phone: formatted }));
    } else {
      setFormData(prev => ({ ...prev, phone: '' }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const profileData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      password: formData.password,
      photo: photoPreview || null
    };

    localStorage.setItem('userProfile', JSON.stringify(profileData));
    alert('Профиль сохранен!');
  };

  if (showLogin) {
    return (
      <div className="content-section active">
        <Login onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="content-section active" id="profile">
      <div className="header">
        <div className="icon-wrapper">
          <svg className="user-icon" viewBox="0 0 24 24">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </div>
        <h1>Профиль</h1>
        <p className="subtitle">Заполните информацию о себе</p>
      </div>

      <form id="profileForm" onSubmit={handleSubmit}>
        <div className="photo-section">
          <div className="photo-wrapper">
            <div className="photo-preview" id="photoPreview">
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" />
              ) : (
                <svg viewBox="0 0 24 24">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              )}
            </div>
            <label htmlFor="photoInput" className="upload-button">
              <svg viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </label>
            <input 
              type="file" 
              id="photoInput" 
              accept="image/*"
              onChange={handlePhotoChange}
            />
          </div>
          <p className="photo-hint">Нажмите, чтобы загрузить фото</p>
        </div>

        <div className="form-group">
          <label htmlFor="firstName">Имя</label>
          <div className="input-wrapper">
            <svg className="input-icon" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input 
              type="text" 
              id="firstName" 
              name="firstName"
              placeholder="Введите ваше имя"
              value={formData.firstName}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="lastName">Фамилия</label>
          <div className="input-wrapper">
            <svg className="input-icon" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <input 
              type="text" 
              id="lastName" 
              name="lastName"
              placeholder="Введите вашу фамилию"
              value={formData.lastName}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="phone">Номер телефона</label>
          <div className="input-wrapper">
            <svg className="input-icon" viewBox="0 0 24 24">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <input 
              type="tel" 
              id="phone" 
              name="phone"
              placeholder="+7 (___) ___-__-__"
              value={formData.phone}
              onChange={handlePhoneInput}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="password">Пароль</label>
          <div className="input-wrapper">
            <svg className="input-icon" viewBox="0 0 24 24">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
            </svg>
            <input 
              type="password" 
              id="password" 
              name="password"
              placeholder="Введите пароль"
              value={formData.password}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <button type="submit" className="submit-button">Сохранить</button>
      </form>

      <div className="footer">
        <p className="footer-text">
          Нажимая "Сохранить", вы соглашаетесь с условиями использования
        </p>
      </div>
    </div>
  );
};

export default Profile;
