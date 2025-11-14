import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { apiClient } from '../api/client';

const Charity = ({ onOpenPost }) => {
  const { posts, loading, loadPosts } = useApp();
  const [mode, setMode] = useState('initial'); // 'initial', 'passport', 'verifying', 'createPost', 'processing', 'viewPost', 'posts', 'userPost', 'needHelp'
  const [createdPost, setCreatedPost] = useState(null); // Данные созданного поста
  const [helperName, setHelperName] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptProcessing, setShowReceiptProcessing] = useState(false);
  const [receiptFile, setReceiptFile] = useState(null);
  const [receiptFileName, setReceiptFileName] = useState('');
  const receiptFileInputRef = useRef(null);
  const receiptUploadAreaRef = useRef(null);
  const postsToShow = posts && posts.length > 0 ? posts : [];
  
  // Данные для формы паспорта
  const [passportData, setPassportData] = useState({
    firstName: '',
    lastName: '',
    middleName: '',
    passportSeries: '',
    passportNumber: '',
    docType: 'inn', // 'inn' или 'snils'
    inn: '',
    snils: '',
    passportScans: []
  });
  const [passportScansPreview, setPassportScansPreview] = useState([]);
  const [passportLoading, setPassportLoading] = useState(false);
  const [passportError, setPassportError] = useState(null);
  
  // Данные для формы создания поста (для "Я хочу помочь")
  const [helperPostData, setHelperPostData] = useState({
    avatar: null,
    firstName: '',
    lastName: '',
    title: '',
    description: '',
    amount: '',
    media: []
  });
  const [helperPostMediaPreview, setHelperPostMediaPreview] = useState([]);
  const [helperPostAvatarPreview, setHelperPostAvatarPreview] = useState(null);
  const [helperPostLoading, setHelperPostLoading] = useState(false);
  const [helperPostError, setHelperPostError] = useState(null);
  
  // Данные для формы создания поста
  const [postFormData, setPostFormData] = useState({
    title: '',
    description: '',
    amount: '',
    recipient: '',
    bank: '',
    phone: '',
    media: null
  });
  const [postMediaPreview, setPostMediaPreview] = useState([]);
  const [postLoading, setPostLoading] = useState(false);
  const [postError, setPostError] = useState(null);

  useEffect(() => {
    // Принудительно устанавливаем mode в 'initial' при монтировании компонента
    // чтобы кнопки всегда показывались при открытии вкладки
    setMode('initial');
    // Очищаем поле ввода имени, чтобы оно было пустым
    setHelperName('');
    // Вкладка Рейтинг будет показываться только после того, как пользователь введет имя и нажмет "Продолжить"
  }, []);

  const handleWantToHelp = () => {
    setMode('intro');
  };

  const handleNeedHelp = async () => {
    // Удаляем helperName, чтобы скрыть вкладку Рейтинг для тех, кому нужна помощь
    localStorage.removeItem('helperName');
    window.dispatchEvent(new Event('storage'));
    
    // Проверяем, есть ли сохраненные данные паспорта
    const savedPassportData = localStorage.getItem('passportData');
    if (savedPassportData) {
      try {
        const parsed = JSON.parse(savedPassportData);
        setPassportData(parsed);
        // Восстанавливаем превью сканов
        const savedScans = localStorage.getItem('passportScansPreview');
        if (savedScans) {
          setPassportScansPreview(JSON.parse(savedScans));
        }
        // Если верификация уже пройдена, переходим к созданию поста или просмотру
        const verificationStatus = localStorage.getItem('verificationStatus');
        if (verificationStatus === 'approved') {
          // Проверяем, есть ли созданный пост
          const savedCreatedPost = localStorage.getItem('createdPostData');
          if (savedCreatedPost) {
            try {
              const parsedPost = JSON.parse(savedCreatedPost);
              setCreatedPost(parsedPost);
              setHelperPostData({
                avatar: parsedPost.avatar,
                firstName: parsedPost.firstName,
                lastName: parsedPost.lastName,
                title: parsedPost.title,
                description: parsedPost.description,
                amount: parsedPost.amount,
                media: parsedPost.media || []
              });
              setMode('viewPost');
              // Восстанавливаем превью
              const savedMedia = localStorage.getItem('helperPostMediaPreview');
              if (savedMedia) {
                setHelperPostMediaPreview(JSON.parse(savedMedia));
              }
              const savedAvatar = localStorage.getItem('helperPostAvatarPreview');
              if (savedAvatar) {
                setHelperPostAvatarPreview(savedAvatar);
              }
            } catch (e) {
              console.error('Ошибка загрузки созданного поста:', e);
              setMode('createPost');
            }
          } else {
            setMode('createPost');
            // Восстанавливаем данные поста если есть
            const savedPostData = localStorage.getItem('helperPostData');
            if (savedPostData) {
              const parsedPost = JSON.parse(savedPostData);
              setHelperPostData(parsedPost);
              const savedMedia = localStorage.getItem('helperPostMediaPreview');
              if (savedMedia) {
                setHelperPostMediaPreview(JSON.parse(savedMedia));
              }
              const savedAvatar = localStorage.getItem('helperPostAvatarPreview');
              if (savedAvatar) {
                setHelperPostAvatarPreview(savedAvatar);
              }
            }
          }
        } else {
          setMode('passport');
        }
      } catch (e) {
        console.error('Ошибка загрузки данных паспорта:', e);
        setMode('passport');
      }
    } else {
      setMode('passport');
    }
  };

  // Обработчики для формы паспорта
  const handlePassportInputChange = (e) => {
    const { name, value } = e.target;
    setPassportData(prev => {
      const updated = { ...prev, [name]: value };
      // Сохраняем в localStorage
      localStorage.setItem('passportData', JSON.stringify(updated));
      return updated;
    });
  };

  const handlePassportScansChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + passportScansPreview.length > 10) {
      alert('Можно загрузить максимум 10 файлов');
      return;
    }
    
    const newFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10 МБ
      if (file.size > maxSize) {
        alert(`Файл ${file.name} превышает 10 МБ`);
        return false;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert(`Файл ${file.name} имеет неподдерживаемый формат`);
        return false;
      }
      return true;
    });

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPassportScansPreview(prev => [...prev, ...newPreviews]);
    setPassportData(prev => ({
      ...prev,
      passportScans: [...prev.passportScans, ...newFiles]
    }));
    
    // Сохраняем превью в localStorage
    localStorage.setItem('passportScansPreview', JSON.stringify([...passportScansPreview, ...newPreviews]));
  };

  const removePassportScan = (index) => {
    const newPreviews = passportScansPreview.filter((_, i) => i !== index);
    const newFiles = passportData.passportScans.filter((_, i) => i !== index);
    setPassportScansPreview(newPreviews);
    setPassportData(prev => ({ ...prev, passportScans: newFiles }));
    localStorage.setItem('passportScansPreview', JSON.stringify(newPreviews));
  };

  const handlePassportSubmit = async (e) => {
    e.preventDefault();
    setPassportLoading(true);
    setPassportError(null);

    try {
      // Валидация
      if (!passportData.firstName || !passportData.lastName) {
        throw new Error('Имя и фамилия обязательны для заполнения');
      }
      if (!passportData.passportSeries || !passportData.passportNumber) {
        throw new Error('Серия и номер паспорта обязательны');
      }
      if (passportData.docType === 'inn' && !passportData.inn) {
        throw new Error('ИНН обязателен для заполнения');
      }
      if (passportData.docType === 'snils' && !passportData.snils) {
        throw new Error('СНИЛС обязателен для заполнения');
      }
      if (passportData.passportScans.length < 2) {
        throw new Error('Необходимо загрузить минимум 2 скана паспорта');
      }

      // Здесь будет вызов API для верификации
      // Пока что просто переходим к модальному окну проверки
      setMode('verifying');
      
      // Имитируем проверку (в реальности здесь будет вызов API)
      setTimeout(() => {
        localStorage.setItem('verificationStatus', 'approved');
        setMode('createPost');
      }, 3000); // 3 секунды для демонстрации
      
    } catch (err) {
      setPassportError(err.message || 'Ошибка при отправке данных');
    } finally {
      setPassportLoading(false);
    }
  };

  const handleHelperFormSubmit = (e) => {
    e.preventDefault();
    if (helperName.trim()) {
      localStorage.setItem('helperName', helperName);
      setMode('posts');
      // Триггерим событие для обновления вкладки Рейтинг
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handlePaymentDetails = () => {
    setShowPaymentModal(true);
  };

  const closePaymentModal = () => {
    setShowPaymentModal(false);
  };

  const handleReceiptFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024; // 10 МБ
      if (file.size > maxSize) {
        alert('Размер файла превышает 10 МБ. Пожалуйста, выберите файл меньшего размера.');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Неподдерживаемый формат файла. Пожалуйста, выберите JPG, PNG или PDF.');
        return;
      }
      setReceiptFile(file);
      setReceiptFileName(`Выбран файл: ${file.name}`);
    }
  };

  const handleReceiptUploadClick = () => {
    receiptFileInputRef.current?.click();
  };

  const handleReceiptSubmit = () => {
    if (!receiptFile) {
      alert('Пожалуйста, выберите файл чека');
      return;
    }
    setShowPaymentModal(false);
    setShowReceiptProcessing(true);
    // Здесь будет логика отправки чека на сервер
    setTimeout(() => {
      setShowReceiptProcessing(false);
      setReceiptFile(null);
      setReceiptFileName('');
      alert('Чек успешно отправлен!');
    }, 3000);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (receiptUploadAreaRef.current) {
      receiptUploadAreaRef.current.style.borderColor = '#3b82f6';
      receiptUploadAreaRef.current.style.background = 'rgba(59, 130, 246, 0.1)';
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    if (receiptUploadAreaRef.current) {
      receiptUploadAreaRef.current.style.borderColor = '#334155';
      receiptUploadAreaRef.current.style.background = 'transparent';
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (receiptUploadAreaRef.current) {
      receiptUploadAreaRef.current.style.borderColor = '#334155';
      receiptUploadAreaRef.current.style.background = 'transparent';
    }
    const file = e.dataTransfer.files[0];
    if (file) {
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('Размер файла превышает 10 МБ. Пожалуйста, выберите файл меньшего размера.');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Неподдерживаемый формат файла. Пожалуйста, выберите JPG, PNG или PDF.');
        return;
      }
      setReceiptFile(file);
      setReceiptFileName(`Выбран файл: ${file.name}`);
    }
  };

  const generatePostId = (id) => {
    if (!id) return 'N/A';
    const str = String(id);
    return str.padStart(6, '0');
  };

  // Обработчики для формы создания поста (для "Я хочу помочь")
  const handleHelperPostInputChange = (e) => {
    const { name, value } = e.target;
    setHelperPostData(prev => ({ ...prev, [name]: value }));
    // Сохраняем в localStorage
    const updated = { ...helperPostData, [name]: value };
    localStorage.setItem('helperPostData', JSON.stringify(updated));
  };

  const handleHelperPostAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5 МБ
      if (file.size > maxSize) {
        alert('Размер файла превышает 5 МБ');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
      if (!allowedTypes.includes(file.type)) {
        alert('Неподдерживаемый формат файла. Используйте JPG или PNG');
        return;
      }
      const preview = URL.createObjectURL(file);
      setHelperPostAvatarPreview(preview);
      setHelperPostData(prev => ({ ...prev, avatar: file }));
      localStorage.setItem('helperPostAvatarPreview', preview);
    }
  };

  const handleHelperPostMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + helperPostMediaPreview.length > 3) {
      alert('Можно загрузить максимум 3 файла');
      return;
    }
    
    const newFiles = files.filter(file => {
      const maxSize = 10 * 1024 * 1024; // 10 МБ
      if (file.size > maxSize) {
        alert(`Файл ${file.name} превышает 10 МБ`);
        return false;
      }
      return true;
    });

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setHelperPostMediaPreview(prev => [...prev, ...newPreviews]);
    setHelperPostData(prev => ({
      ...prev,
      media: [...prev.media, ...newFiles]
    }));
    localStorage.setItem('helperPostMediaPreview', JSON.stringify([...helperPostMediaPreview, ...newPreviews]));
  };

  const removeHelperPostMedia = (index) => {
    const newPreviews = helperPostMediaPreview.filter((_, i) => i !== index);
    const newFiles = helperPostData.media.filter((_, i) => i !== index);
    setHelperPostMediaPreview(newPreviews);
    setHelperPostData(prev => ({ ...prev, media: newFiles }));
    localStorage.setItem('helperPostMediaPreview', JSON.stringify(newPreviews));
  };

  const handleHelperPostSubmit = async (e) => {
    e.preventDefault();
    setHelperPostLoading(true);
    setHelperPostError(null);

    try {
      // Валидация
      if (!helperPostData.firstName || !helperPostData.lastName) {
        throw new Error('Имя и фамилия обязательны');
      }
      if (!helperPostData.title) {
        throw new Error('Название обязательно');
      }
      if (!helperPostData.description) {
        throw new Error('Описание обязательно');
      }
      if (helperPostData.description.length > 10000) {
        throw new Error('Описание не должно превышать 10000 символов');
      }
      if (!helperPostData.amount || parseFloat(helperPostData.amount) <= 0) {
        throw new Error('Сумма сбора обязательна и должна быть больше 0');
      }

      // Показываем модальное окно обработки
      setMode('processing');
      
      // Имитируем создание поста (в реальности здесь будет вызов API)
      setTimeout(() => {
        // Сохраняем данные поста
        const postData = {
          id: Date.now(), // Временный ID, в реальности будет от API
          ...helperPostData,
          createdAt: new Date().toISOString(),
          status: 'active'
        };
        setCreatedPost(postData);
        localStorage.setItem('helperPostCreated', 'true');
        localStorage.setItem('createdPostData', JSON.stringify(postData));
        setMode('viewPost');
      }, 2000); // 2 секунды для демонстрации
      
    } catch (err) {
      setHelperPostError(err.message || 'Ошибка при создании поста');
    } finally {
      setHelperPostLoading(false);
    }
  };

  const handlePostInputChange = (e) => {
    const { name, value } = e.target;
    setPostFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePostMediaChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 10) {
      alert('Можно загрузить максимум 10 файлов');
      return;
    }
    
    const previews = files.map(file => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`Файл ${file.name} превышает 10 МБ`);
        return null;
      }
      return URL.createObjectURL(file);
    }).filter(Boolean);
    
    setPostMediaPreview(previews);
    setPostFormData(prev => ({ ...prev, media: files[0] })); // Пока берем первый файл, можно расширить
  };

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setPostLoading(true);
    setPostError(null);

    try {
      const response = await apiClient.postsPost(
        postFormData.title,
        postFormData.description,
        parseFloat(postFormData.amount),
        postFormData.recipient,
        postFormData.bank,
        postFormData.phone,
        postFormData.media
      );

      if (response.data) {
        alert('Пост успешно создан!');
        // Убеждаемся, что helperName удален (для тех, кому нужна помощь)
        localStorage.removeItem('helperName');
        window.dispatchEvent(new Event('storage'));
        
        // Сбрасываем форму и возвращаемся к списку постов
        setPostFormData({
          title: '',
          description: '',
          amount: '',
          recipient: '',
          bank: '',
          phone: '',
          media: null
        });
        setPostMediaPreview([]);
        setMode('posts');
        // Обновляем список постов
        await loadPosts(true);
      }
    } catch (err) {
      console.error('Ошибка создания поста:', err);
      setPostError(
        err.response?.data?.error?.message || 
        err.message || 
        'Ошибка создания поста. Проверьте введенные данные.'
      );
    } finally {
      setPostLoading(false);
    }
  };

  return (
    <div className="content-section active" id="charity">
      <div className="header">
        <div className="header-content">
          <div className="icon-wrapper">
            <svg className="user-icon" viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
          <div>
            <h1>Благотворительность</h1>
            <p className="subtitle">Помогите тем, кто нуждается в поддержке</p>
          </div>
        </div>
      </div>

      {mode === 'initial' && (
        <div id="charityInitial">
          <div className="charity-buttons">
            <button className="charity-button" onClick={handleWantToHelp}>
              <svg viewBox="0 0 24 24">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
              </svg>
              Я хочу помочь
            </button>
            <button className="charity-button" onClick={handleNeedHelp}>
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              Мне нужна помощь
            </button>
          </div>
        </div>
      )}

      {/* Форма ввода имени для "Я хочу помочь" */}
      {mode === 'intro' && (
        <div id="introForm">
          <div className="intro-form">
            <h2>Представьтесь, пожалуйста</h2>
            <p>Чтобы продолжить, пожалуйста, представьтесь</p>
            <form id="helperForm" onSubmit={handleHelperFormSubmit}>
              <div className="form-group">
                <label htmlFor="helperName">Ваше имя</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input 
                    type="text" 
                    id="helperName" 
                    placeholder="Введите ваше имя" 
                    required
                    value={helperName}
                    onChange={(e) => setHelperName(e.target.value)}
                  />
                </div>
              </div>
              <button type="submit" className="submit-button">Продолжить</button>
            </form>
          </div>
        </div>
      )}

      {/* Форма паспортных данных (для "Мне нужна помощь") */}
      {mode === 'passport' && (
        <div id="passportForm">
          <div className="intro-form">
            <h2>Верификация личности</h2>
            <p>Для создания поста необходимо пройти верификацию. Заполните данные паспорта</p>
            <form onSubmit={handlePassportSubmit}>
              <div className="form-group">
                <label htmlFor="firstName">Имя *</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    placeholder="Введите имя"
                    value={passportData.firstName}
                    onChange={handlePassportInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Фамилия *</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    placeholder="Введите фамилию"
                    value={passportData.lastName}
                    onChange={handlePassportInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="middleName">Отчество</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    id="middleName"
                    name="middleName"
                    placeholder="Введите отчество (необязательно)"
                    value={passportData.middleName}
                    onChange={handlePassportInputChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="passportSeries">Серия паспорта *</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <input
                    type="text"
                    id="passportSeries"
                    name="passportSeries"
                    placeholder="0000"
                    value={passportData.passportSeries}
                    onChange={handlePassportInputChange}
                    required
                    maxLength="4"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="passportNumber">Номер паспорта *</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <input
                    type="text"
                    id="passportNumber"
                    name="passportNumber"
                    placeholder="000000"
                    value={passportData.passportNumber}
                    onChange={handlePassportInputChange}
                    required
                    maxLength="6"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Тип документа *</label>
                <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="docType"
                      value="inn"
                      checked={passportData.docType === 'inn'}
                      onChange={handlePassportInputChange}
                    />
                    <span>ИНН</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="docType"
                      value="snils"
                      checked={passportData.docType === 'snils'}
                      onChange={handlePassportInputChange}
                    />
                    <span>СНИЛС</span>
                  </label>
                </div>
              </div>

              {passportData.docType === 'inn' && (
                <div className="form-group">
                  <label htmlFor="inn">ИНН *</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    </svg>
                    <input
                      type="text"
                      id="inn"
                      name="inn"
                      placeholder="Введите ИНН"
                      value={passportData.inn}
                      onChange={handlePassportInputChange}
                      required
                    />
                  </div>
                </div>
              )}

              {passportData.docType === 'snils' && (
                <div className="form-group">
                  <label htmlFor="snils">СНИЛС *</label>
                  <div className="input-wrapper">
                    <svg className="input-icon" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    </svg>
                    <input
                      type="text"
                      id="snils"
                      name="snils"
                      placeholder="Введите СНИЛС"
                      value={passportData.snils}
                      onChange={handlePassportInputChange}
                      required
                    />
                  </div>
                </div>
              )}

              <div className="form-group">
                <label htmlFor="passportScans">Сканы паспорта * (минимум 2)</label>
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="file"
                    id="passportScans"
                    multiple
                    accept="image/jpeg,image/png,image/jpg,application/pdf"
                    onChange={handlePassportScansChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('passportScans').click()}
                    style={{
                      padding: '12px 24px',
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px dashed #3b82f6',
                      borderRadius: '12px',
                      color: '#3b82f6',
                      cursor: 'pointer',
                      width: '100%',
                      fontSize: '14px'
                    }}
                  >
                    + Загрузить сканы
                  </button>
                  {passportScansPreview.length > 0 && (
                    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '12px' }}>
                      {passportScansPreview.map((preview, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                          <img
                            src={preview}
                            alt={`Скан ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '100px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #334155'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removePassportScan(index)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(239, 68, 68, 0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {passportError && (
                <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>
                  {passportError}
                </div>
              )}

              <button type="submit" className="submit-button" disabled={passportLoading}>
                {passportLoading ? 'Отправка...' : 'Отправить на проверку'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно проверки верификации (для "Мне нужна помощь") */}
      {mode === 'verifying' && (
        <div className="verification-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '24px',
            padding: '48px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              border: '4px solid #3b82f6',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <h2 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Проверяем данные</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Это займет 2-5 минут. Пожалуйста, подождите...
            </p>
            <button
              onClick={() => {
                localStorage.setItem('verificationStatus', 'approved');
                setMode('createPost');
              }}
              className="submit-button"
              style={{ marginTop: '24px' }}
            >
              ОК
            </button>
          </div>
        </div>
      )}

      {/* Форма создания поста (для "Мне нужна помощь") */}
      {mode === 'createPost' && (
        <div id="createPostForm">
          <div className="intro-form">
            <h2>Создать пост</h2>
            <p>Заполните информацию о вашем посте</p>
            <form onSubmit={handleHelperPostSubmit}>
              {/* Аватар */}
              <div className="form-group">
                <label>Аватар</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '8px' }}>
                  {helperPostAvatarPreview ? (
                    <img
                      src={helperPostAvatarPreview}
                      alt="Аватар"
                      style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid #334155'
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '2px dashed #334155',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg viewBox="0 0 24 24" style={{ width: '32px', height: '32px', stroke: '#64748b' }}>
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                  )}
                  <div>
                    <input
                      type="file"
                      id="helperPostAvatar"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleHelperPostAvatarChange}
                      style={{ display: 'none' }}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('helperPostAvatar').click()}
                      style={{
                        padding: '8px 16px',
                        background: 'rgba(59, 130, 246, 0.1)',
                        border: '1px solid #3b82f6',
                        borderRadius: '8px',
                        color: '#3b82f6',
                        cursor: 'pointer',
                        fontSize: '14px'
                      }}
                    >
                      {helperPostAvatarPreview ? 'Изменить' : 'Загрузить'}
                    </button>
                  </div>
                </div>
              </div>

              {/* Имя и фамилия */}
              <div className="form-group">
                <label htmlFor="helperPostFirstName">Имя *</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    id="helperPostFirstName"
                    name="firstName"
                    placeholder="Введите имя"
                    value={helperPostData.firstName}
                    onChange={handleHelperPostInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="helperPostLastName">Фамилия *</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  <input
                    type="text"
                    id="helperPostLastName"
                    name="lastName"
                    placeholder="Введите фамилию"
                    value={helperPostData.lastName}
                    onChange={handleHelperPostInputChange}
                    required
                  />
                </div>
              </div>

              {/* Название */}
              <div className="form-group">
                <label htmlFor="helperPostTitle">Название *</label>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <input
                    type="text"
                    id="helperPostTitle"
                    name="title"
                    placeholder="Введите название поста"
                    value={helperPostData.title}
                    onChange={handleHelperPostInputChange}
                    required
                  />
                </div>
              </div>

              {/* Описание */}
              <div className="form-group">
                <label htmlFor="helperPostDescription">Описание * (до 10000 символов)</label>
                <div className="input-wrapper">
                  <textarea
                    id="helperPostDescription"
                    name="description"
                    placeholder="Опишите ваш пост"
                    value={helperPostData.description}
                    onChange={handleHelperPostInputChange}
                    required
                    maxLength={10000}
                    rows="8"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'rgba(30, 41, 59, 0.5)',
                      border: '1px solid #334155',
                      borderRadius: '12px',
                      color: '#f1f5f9',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical'
                    }}
                  />
                  <div style={{ textAlign: 'right', marginTop: '4px', fontSize: '12px', color: '#64748b' }}>
                    {helperPostData.description.length} / 10000
                  </div>
                </div>
              </div>

              {/* Вложения (до 3) */}
              <div className="form-group">
                <label htmlFor="helperPostMedia">Вложения (до 3 файлов)</label>
                <div style={{ marginTop: '8px' }}>
                  <input
                    type="file"
                    id="helperPostMedia"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleHelperPostMediaChange}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('helperPostMedia').click()}
                    disabled={helperPostMediaPreview.length >= 3}
                    style={{
                      padding: '12px 24px',
                      background: helperPostMediaPreview.length >= 3 ? 'rgba(30, 41, 59, 0.5)' : 'rgba(59, 130, 246, 0.1)',
                      border: `1px dashed ${helperPostMediaPreview.length >= 3 ? '#334155' : '#3b82f6'}`,
                      borderRadius: '12px',
                      color: helperPostMediaPreview.length >= 3 ? '#64748b' : '#3b82f6',
                      cursor: helperPostMediaPreview.length >= 3 ? 'not-allowed' : 'pointer',
                      width: '100%',
                      fontSize: '14px'
                    }}
                  >
                    + Загрузить вложения ({helperPostMediaPreview.length}/3)
                  </button>
                  {helperPostMediaPreview.length > 0 && (
                    <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '12px' }}>
                      {helperPostMediaPreview.map((preview, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                          <img
                            src={preview}
                            alt={`Вложение ${index + 1}`}
                            style={{
                              width: '100%',
                              height: '150px',
                              objectFit: 'cover',
                              borderRadius: '8px',
                              border: '1px solid #334155'
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeHelperPostMedia(index)}
                            style={{
                              position: 'absolute',
                              top: '4px',
                              right: '4px',
                              background: 'rgba(239, 68, 68, 0.9)',
                              border: 'none',
                              borderRadius: '50%',
                              width: '24px',
                              height: '24px',
                              color: 'white',
                              cursor: 'pointer',
                              fontSize: '14px'
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Сумма сбора */}
              <div className="form-group">
                <label htmlFor="helperPostAmount">Сумма сбора (₽) *</label>
                <div style={{ marginBottom: '8px', fontSize: '12px', color: '#f59e0b' }}>
                  ⚠️ Внимание: сумму сбора нельзя будет изменить после создания поста
                </div>
                <div className="input-wrapper">
                  <svg className="input-icon" viewBox="0 0 24 24">
                    <line x1="12" y1="1" x2="12" y2="23"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                  <input
                    type="number"
                    id="helperPostAmount"
                    name="amount"
                    placeholder="Введите сумму сбора"
                    value={helperPostData.amount}
                    onChange={handleHelperPostInputChange}
                    required
                    min="1"
                    disabled={createdPost !== null} // Блокируем изменение если пост уже создан
                    style={{
                      opacity: createdPost !== null ? 0.6 : 1,
                      cursor: createdPost !== null ? 'not-allowed' : 'text'
                    }}
                  />
                </div>
                {createdPost !== null && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: '#f59e0b' }}>
                    Сумма сбора не может быть изменена
                  </div>
                )}
              </div>

              {helperPostError && (
                <div style={{ color: '#ef4444', marginBottom: '16px', fontSize: '14px' }}>
                  {helperPostError}
                </div>
              )}

              <button type="submit" className="submit-button" disabled={helperPostLoading}>
                {helperPostLoading ? 'Создание...' : 'Создать пост'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Модальное окно обработки поста (для "Мне нужна помощь") */}
      {mode === 'processing' && (
        <div className="processing-modal" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: '24px',
            padding: '48px',
            maxWidth: '500px',
            width: '90%',
            textAlign: 'center'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto 24px',
              border: '4px solid #3b82f6',
              borderTopColor: 'transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <h2 style={{ marginBottom: '16px', color: 'var(--text-primary)' }}>Обрабатывается</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
              Ваш пост обрабатывается...
            </p>
            <button
              onClick={() => {
                const postData = {
                  id: Date.now(),
                  ...helperPostData,
                  createdAt: new Date().toISOString(),
                  status: 'active'
                };
                setCreatedPost(postData);
                localStorage.setItem('helperPostCreated', 'true');
                localStorage.setItem('createdPostData', JSON.stringify(postData));
                setMode('viewPost');
              }}
              className="submit-button"
              style={{ marginTop: '24px' }}
            >
              ОК
            </button>
          </div>
        </div>
      )}

      {/* Просмотр и редактирование созданного поста (для "Мне нужна помощь") */}
      {mode === 'viewPost' && createdPost && (
        <div id="viewPost">
          <div className="intro-form">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2>Ваш пост</h2>
              <button
                onClick={() => {
                  // Переключаемся в режим редактирования
                  setMode('createPost');
                }}
                style={{
                  padding: '8px 16px',
                  background: 'rgba(59, 130, 246, 0.1)',
                  border: '1px solid #3b82f6',
                  borderRadius: '8px',
                  color: '#3b82f6',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Редактировать
              </button>
            </div>
            
            <div style={{ marginBottom: '24px' }}>
              {helperPostAvatarPreview && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                  <img
                    src={helperPostAvatarPreview}
                    alt="Аватар"
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid #334155'
                    }}
                  />
                  <div>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>
                      {createdPost.firstName} {createdPost.lastName}
                    </h3>
                  </div>
                </div>
              )}
              
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ marginBottom: '8px', color: 'var(--text-primary)' }}>{createdPost.title}</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {createdPost.description}
                </p>
              </div>
              
              {helperPostMediaPreview.length > 0 && (
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', 
                  gap: '12px',
                  marginBottom: '16px'
                }}>
                  {helperPostMediaPreview.map((preview, index) => (
                    <img
                      key={index}
                      src={preview}
                      alt={`Вложение ${index + 1}`}
                      style={{
                        width: '100%',
                        height: '200px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: '1px solid #334155'
                      }}
                    />
                  ))}
                </div>
              )}
              
              <div style={{
                padding: '16px',
                background: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '12px',
                border: '1px solid #3b82f6'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Сумма сбора</div>
                  <div style={{ fontSize: '24px', fontWeight: '600', color: '#3b82f6' }}>
                    ₽ {parseFloat(createdPost.amount).toLocaleString('ru-RU')}
                  </div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                    ⚠️ Сумма не может быть изменена
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}


      {mode === 'posts' && (
        <div id="postsList">
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '32px' }}>
            <button id="paymentDetailsBtn" className="payment-details-button" onClick={handlePaymentDetails}>
              <svg viewBox="0 0 24 24" style={{ width: '24px', height: '24px', stroke: 'currentColor', strokeWidth: '2', fill: 'none' }}>
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect>
                <line x1="1" y1="10" x2="23" y2="10"></line>
              </svg>
              Реквизиты для помощи
            </button>
          </div>
          
          {loading && postsToShow.length === 0 ? (
            <div className="empty-content">
              <p>Загрузка постов...</p>
            </div>
          ) : postsToShow.length === 0 ? (
            <div className="empty-content">
              <svg className="empty-icon" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h3 className="empty-title">Пока нет доступных постов</h3>
              <p className="empty-description">Посты появятся здесь после загрузки с сервера</p>
            </div>
          ) : (
            <div className="posts-grid">
              {postsToShow.map((post) => {
                const collected = post.collected || 0;
                const amount = post.amount || 0;
                const progress = amount > 0 ? (collected / amount * 100) : 0;
                const uniqueId = generatePostId(post.id);
                
                return (
                  <div 
                    key={post.id || Math.random()} 
                    className="post-card"
                    onClick={() => onOpenPost(post)}
                    style={{ '--progress-width': `${progress}%` }}
                  >
                    {post.images && post.images.length > 0 ? (
                      <img 
                        src={post.images[0]} 
                        alt={post.title || 'Пост'} 
                        className="post-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="post-image" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}></div>
                    )}
                    <div className="post-content">
                      <div className="post-author">
                        {post.author?.avatar ? (
                          <img 
                            src={post.author.avatar} 
                            alt={post.author?.name || 'Автор'} 
                            className="post-avatar"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="post-avatar" style={{ 
                            background: 'rgba(59, 130, 246, 0.2)', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center' 
                          }}>
                            <svg style={{ width: '20px', height: '20px', stroke: '#3b82f6' }} viewBox="0 0 24 24">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                              <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                          </div>
                        )}
                        <div className="post-author-info">
                          <div className="post-author-name">
                            {post.author?.name || post.user?.name || 'Аноним'}
                          </div>
                        </div>
                      </div>
                      <h3 className="post-title">{post.title || 'Без названия'}</h3>
                      <div className="post-amount">
                        <div className="post-amount-content">
                          <span className="post-amount-currency">₽</span>
                          <span className="post-amount-target">
                            {amount.toLocaleString('ru-RU')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="post-id">ID: {uniqueId}</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showPaymentModal && (
        <div className="payment-modal active" onClick={(e) => {
          if (e.target.classList.contains('payment-modal')) {
            closePaymentModal();
          }
        }}>
          <div className="payment-modal-content">
            <button className="payment-modal-close" onClick={closePaymentModal}>
              <svg viewBox="0 0 24 24">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <h2 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700', marginBottom: '24px', textAlign: 'center' }}>Реквизиты для помощи</h2>
            
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Инструкция по переводу</h3>
              <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '12px' }}>Для того чтобы помочь нуждающемуся, выполните следующие шаги:</p>
                <ol style={{ marginLeft: '20px', marginBottom: '12px' }}>
                  <li style={{ marginBottom: '8px' }}>Откройте приложение вашего банка или перейдите на сайт банка</li>
                  <li style={{ marginBottom: '8px' }}>Выберите операцию "Перевод" или "Платеж"</li>
                  <li style={{ marginBottom: '8px' }}>Введите лицевой счет получателя (указан ниже)</li>
                  <li style={{ marginBottom: '8px' }}>Укажите сумму перевода</li>
                  <li style={{ marginBottom: '8px' }}><strong style={{ color: '#3b82f6' }}>Обязательно укажите в комментарии к переводу ID поста</strong> (ID указан справа вверху на карточке поста)</li>
                  <li style={{ marginBottom: '8px' }}>Проверьте данные и подтвердите перевод</li>
                </ol>
                <p style={{ color: '#fbbf24', fontWeight: '600', marginTop: '16px' }}>⚠️ Важно: Без указания ID поста в комментарии мы не сможем определить, кому именно предназначена помощь!</p>
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '20px', marginBottom: '24px' }}>
              <h3 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Реквизиты получателя</h3>
              <div style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.8' }}>
                <p style={{ marginBottom: '12px' }}><strong style={{ color: '#f1f5f9' }}>Получатель:</strong> ООО "Max"</p>
                <p style={{ marginBottom: '12px' }}><strong style={{ color: '#f1f5f9' }}>ИНН:</strong> 7707083893</p>
                <p style={{ marginBottom: '12px' }}><strong style={{ color: '#f1f5f9' }}>КПП:</strong> 770701001</p>
                <p style={{ marginBottom: '12px' }}><strong style={{ color: '#f1f5f9' }}>Банк:</strong> ПАО "Сбербанк"</p>
                <p style={{ marginBottom: '12px' }}><strong style={{ color: '#f1f5f9' }}>БИК:</strong> 044525225</p>
                <p style={{ marginBottom: '12px' }}><strong style={{ color: '#f1f5f9' }}>Корр. счет:</strong> 30101810400000000225</p>
                <p style={{ marginBottom: '0' }}><strong style={{ color: '#3b82f6', fontSize: '16px' }}>Лицевой счет:</strong> <span id="accountNumber" style={{ color: '#3b82f6', fontSize: '18px', fontWeight: '700', fontFamily: "'Courier New', monospace", letterSpacing: '1px' }}>40817810099910004312</span></p>
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '20px', textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>QR-код для быстрого перевода</h3>
              <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>Отсканируйте QR-код в приложении вашего банка для быстрого перевода</p>
              <div id="qrCodeContainer" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'white', padding: '20px', borderRadius: '12px', margin: '0 auto', width: 'fit-content' }}>
                <img src="http://qrcoder.ru/code/?%CF%EE%EB%F3%F7%E0%F2%E5%EB%FC%3A+%CE%CE%CE+%22%CC%E0%EA%F1%22%0D%0A%0D%0A%C8%CD%CD%3A+7707083893%0D%0A%0D%0A%CA%CF%CF%3A+770701001%0D%0A%0D%0A%C1%E0%ED%EA%3A+%CF%C0%CE+%22%D1%E1%E5%F0%E1%E0%ED%EA%22%0D%0A%0D%0A%C1%C8%CA%3A+044525225%0D%0A%0D%0A%CA%EE%F0%F0.+%F1%F7%E5%F2%3A+30101810400000000225%0D%0A%0D%0A%CB%E8%F6%E5%E2%EE%E9+%F1%F7%E5%F2%3A+40817810099910004312&4&0" width="276" height="276" border="0" alt="QR код для перевода" style={{ display: 'block' }} />
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid #334155', borderRadius: '12px', padding: '20px' }}>
              <h3 style={{ color: '#f1f5f9', fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>Загрузка чека о переводе</h3>
              <p style={{ color: '#94a3b8', fontSize: '14px', lineHeight: '1.6', marginBottom: '16px' }}>
                После совершения перевода, пожалуйста, загрузите чек или скриншот операции для подтверждения платежа. 
                Это поможет нам быстрее обработать ваше пожертвование и направить средства нуждающемуся.
              </p>
              <div style={{ background: 'rgba(15, 22, 41, 0.5)', border: '1px solid #334155', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
                <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '8px' }}><strong style={{ color: '#f1f5f9' }}>Доступные форматы:</strong> JPG, PNG, PDF</p>
                <p style={{ color: '#64748b', fontSize: '12px', marginBottom: '0' }}><strong style={{ color: '#f1f5f9' }}>Максимальный размер файла:</strong> 10 МБ</p>
              </div>
              <div 
                ref={receiptUploadAreaRef}
                style={{ border: '2px dashed #334155', borderRadius: '12px', padding: '24px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '16px' }} 
                id="receiptUploadArea"
                onClick={handleReceiptUploadClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <input 
                  ref={receiptFileInputRef}
                  type="file" 
                  id="receiptFileInput" 
                  accept="image/jpeg,image/png,image/jpg,application/pdf" 
                  style={{ display: 'none' }}
                  onChange={handleReceiptFileChange}
                />
                <svg style={{ width: '48px', height: '48px', stroke: '#64748b', margin: '0 auto 12px' }} viewBox="0 0 24 24" fill="none" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                <p style={{ color: '#f1f5f9', fontSize: '14px', fontWeight: '600', marginBottom: '4px' }}>Нажмите для загрузки чека</p>
                <p style={{ color: '#64748b', fontSize: '12px' }}>или перетащите файл сюда</p>
                {receiptFileName && (
                  <p id="receiptFileName" style={{ color: '#3b82f6', fontSize: '13px', marginTop: '8px' }}>{receiptFileName}</p>
                )}
              </div>
              {receiptFile && (
                <button 
                  id="submitReceiptBtn" 
                  className="submit-receipt-button" 
                  style={{ width: '100%', height: '48px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}
                  onClick={handleReceiptSubmit}
                >
                  Отправить чек
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {showReceiptProcessing && (
        <div className="receipt-processing-modal active">
          <div className="receipt-processing-content">
            <div style={{ width: '80px', height: '80px', border: '4px solid #334155', borderTopColor: '#3b82f6', borderRadius: '50%', margin: '0 auto 24px', animation: 'spin 1s linear infinite' }}></div>
            <h2 style={{ color: '#f1f5f9', fontSize: '24px', fontWeight: '700', marginBottom: '12px', textAlign: 'center' }}>Обработка чека</h2>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: '1.6', marginBottom: '24px', textAlign: 'center' }}>
              Мы обрабатываем ваш чек о переводе. Это может занять некоторое время. 
              Вы получите уведомление, когда обработка будет завершена.
            </p>
            <p style={{ color: '#3b82f6', fontSize: '13px', fontWeight: '600', textAlign: 'center', marginBottom: '24px' }}>Обычно обработка занимает 2-5 минут</p>
            <button 
              onClick={() => setShowReceiptProcessing(false)}
              style={{ width: '100%', height: '48px', background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', border: 'none', borderRadius: '12px', color: 'white', fontSize: '16px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.3s' }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Charity;

