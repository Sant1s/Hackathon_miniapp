import { Configuration } from './configuration.ts';

// Функция для получения токена
const getToken = () => {
  return localStorage.getItem('token');
};

// Создаем конфигурацию с вашим сервером
const apiConfig = new Configuration({
  basePath: 'http://82.202.142.141:8080/api/v1', // Базовый URL вашего API
  accessToken: getToken(), // Получаем токен из localStorage
});

// Функция для обновления токена
export const updateToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
    apiConfig.accessToken = token;
  } else {
    localStorage.removeItem('token');
    apiConfig.accessToken = undefined;
  }
};

export default apiConfig;

