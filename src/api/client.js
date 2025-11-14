import { DefaultApi } from './api.ts';
import apiConfig, { updateToken } from './config.js';

// Создаем экземпляр API клиента с настроенной конфигурацией
let apiClient = new DefaultApi(apiConfig);

// Функция для пересоздания клиента с обновленным токеном
export const refreshApiClient = () => {
  // Обновляем токен в конфигурации
  apiConfig.accessToken = localStorage.getItem('token');
  // Пересоздаем клиент
  apiClient = new DefaultApi(apiConfig);
  return apiClient;
};

// Экспортируем клиент, конфигурацию и функцию обновления
export { apiClient, apiConfig, updateToken };

