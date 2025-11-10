import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { formatPhone } from '../utils/helpers';

const Profile = () => {
    const { userProfile, updateUserProfile } = useApp();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        password: '',
        photo: null
    });
    
    useEffect(() => {
        if (userProfile) {
            setFormData({
                firstName: userProfile.firstName || '',
                lastName: userProfile.lastName || '',
                phone: userProfile.phone || '',
                password: userProfile.password || '',
                photo: userProfile.photo || null
            });
        }
    }, [userProfile]);
    
    const handlePhotoChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const newPhoto = event.target.result;
                setFormData(prev => ({ ...prev, photo: newPhoto }));
                updateUserProfile({ ...formData, photo: newPhoto });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handlePhoneChange = (e) => {
        const formatted = formatPhone(e.target.value);
        setFormData(prev => ({ ...prev, phone: formatted }));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        updateUserProfile(formData);
        alert('Профиль сохранен!');
    };
    
    return (
        <div className="content-section active" id="profile">
            <div className="header">
                <div className="icon-wrapper">
                    <svg className="user-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                            {formData.photo ? (
                                <img src={formData.photo} alt="Preview" />
                            ) : (
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                    <circle cx="12" cy="7" r="4"></circle>
                                </svg>
                            )}
                        </div>
                        <label htmlFor="photoInput" className="upload-button">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                            style={{ display: 'none' }}
                        />
                    </div>
                    <p className="photo-hint">Нажмите, чтобы загрузить фото</p>
                </div>
                
                <div className="form-group">
                    <label htmlFor="firstName">Имя *</label>
                    <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <input 
                            type="text" 
                            id="firstName" 
                            placeholder="Введите ваше имя"
                            value={formData.firstName}
                            onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                            required
                        />
                    </div>
                </div>
                
                <div className="form-group">
                    <label htmlFor="lastName">Фамилия</label>
                    <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                            <circle cx="12" cy="7" r="4"></circle>
                        </svg>
                        <input 
                            type="text" 
                            id="lastName" 
                            placeholder="Введите вашу фамилию"
                            value={formData.lastName}
                            onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                        />
                    </div>
                </div>
                
                <div className="form-group">
                    <label htmlFor="phone">Номер телефона *</label>
                    <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                        </svg>
                        <input 
                            type="tel" 
                            id="phone" 
                            placeholder="+7 (___) ___-__-__"
                            value={formData.phone}
                            onChange={handlePhoneChange}
                            required
                        />
                    </div>
                </div>
                
                <div className="form-group">
                    <label htmlFor="password">Пароль *</label>
                    <div className="input-wrapper">
                        <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                        </svg>
                        <input 
                            type="password" 
                            id="password" 
                            placeholder="Введите пароль"
                            value={formData.password}
                            onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                            required
                        />
                    </div>
                </div>
                
                <button type="submit" className="submit-button">Сохранить</button>
            </form>
        </div>
    );
};

export default Profile;


