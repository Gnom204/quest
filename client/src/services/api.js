export const API_URL = 'http://localhost:5000/api';
export const SERVER_URL = 'http://localhost:5000'
// Вспомогательная функция для получения заголовков с токеном
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
  };
};

// 1. Регистрация пользователя
export async function register(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Регистрация успешна:', result);
    return result;
  } catch (error) {
    console.error('Ошибка при регистрации:', error);
    throw error;
  }
}

// 2. Вход пользователя
export async function login(credentials) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    // Сохраняем токен и данные пользователя
    if (result.token) {
      localStorage.setItem('token', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }

    console.log('Вход успешен:', result);
    return result;
  } catch (error) {
    console.error('Ошибка при входе:', error);
    throw error;
  }
}

// 3. Выход пользователя
export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  console.log('Выход выполнен');
}

// 4. Получение текущего пользователя
export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// 5. Получение всех квестов
export async function getQuests() {
  try {
    const response = await fetch(`${API_URL}/quests`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const quests = await response.json();
    console.log('Все квесты:', quests);
    return quests;
  } catch (error) {
    console.error('Ошибка при получении квестов:', error);
    throw error;
  }
}

// 6. Создание квеста с файлами
export async function createQuest(questData, files) {
  try {
    const formData = new FormData();

    // Добавляем текстовые поля
    Object.keys(questData).forEach(key => {
      formData.append(key, questData[key]);
    });

    // Добавляем файлы
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append('photos', file);
      });
    }

    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};

    const response = await fetch(`${API_URL}/quests`, {
      method: 'POST',
      headers: headers,
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Квест создан:', result);
    return result;
  } catch (error) {
    console.error('Ошибка при создании квеста:', error);
    throw error;
  }
}

// 7. Получение всех пользователей (только для админов)
export async function getUsers() {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const users = await response.json();
    console.log('Все пользователи:', users);
    return users;
  } catch (error) {
    console.error('Ошибка при получении пользователей:', error);
    throw error;
  }
}

// 8. Поиск пользователей по email (только для админов)
export async function searchUsers(email) {
  try {
    const response = await fetch(`${API_URL}/users/search?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const users = await response.json();
    console.log('Результаты поиска:', users);
    return users;
  } catch (error) {
    console.error('Ошибка при поиске пользователей:', error);
    throw error;
  }
}

// 9. Удаление квеста (только для админов)
export async function deleteQuest(questId) {
  try {
    const response = await fetch(`${API_URL}/quests/${questId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('Квест удален:', result);
    return result;
  } catch (error) {
    console.error('Ошибка при удалении квеста:', error);
    throw error;
  }
}