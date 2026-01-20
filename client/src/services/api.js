const isLocalhost = window.location.hostname === "localhost";
export const API_URL = isLocalhost
  ? "http://localhost:5000/api"
  : "http://109.196.102.188/api";
export const SERVER_URL = isLocalhost
  ? "http://localhost:5000"
  : "http://109.196.102.188";
// Вспомогательная функция для получения заголовков с токеном
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

// 1. Регистрация пользователя
export async function register(userData) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `HTTP error! status: ${response.status}`,
      );
    }

    // Сохраняем токен и данные пользователя
    if (result.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
    }

    console.log("Регистрация успешна:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при регистрации:", error);
    throw error;
  }
}

// 2. Вход пользователя
export async function login(credentials) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.message || `HTTP error! status: ${response.status}`,
      );
    }

    // Сохраняем токен и данные пользователя
    if (result.token) {
      localStorage.setItem("token", result.token);
      localStorage.setItem("user", JSON.stringify(result.user));
    }

    console.log("Вход успешен:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при входе:", error);
    throw error;
  }
}

// 3. Выход пользователя
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  console.log("Выход выполнен");
}

// 4. Получение текущего пользователя
export function getCurrentUser() {
  const user = localStorage.getItem("user");
  return user ? JSON.parse(user) : null;
}

// 5. Получение всех квестов
export async function getQuests() {
  try {
    const response = await fetch(`${API_URL}/quests`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const quests = await response.json();
    console.log("Все квесты:", quests);
    return quests;
  } catch (error) {
    console.error("Ошибка при получении квестов:", error);
    throw error;
  }
}

// 6. Создание квеста с файлами
export async function createQuest(questData, files) {
  try {
    const formData = new FormData();

    // Добавляем текстовые поля
    Object.keys(questData).forEach((key) => {
      formData.append(key, questData[key]);
    });

    // Добавляем файлы
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("photos", file);
      });
    }

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_URL}/quests`, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Квест создан:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при создании квеста:", error);
    throw error;
  }
}

// 7. Получение всех пользователей (только для админов)
export async function getUsers() {
  try {
    const response = await fetch(`${API_URL}/users`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const users = await response.json();
    console.log("Все пользователи:", users);
    return users;
  } catch (error) {
    console.error("Ошибка при получении пользователей:", error);
    throw error;
  }
}

// 8. Поиск пользователей по email (только для админов)
export async function searchUsers(email) {
  try {
    const response = await fetch(
      `${API_URL}/users/search?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: getAuthHeaders(),
      },
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const users = await response.json();
    console.log("Результаты поиска:", users);
    return users;
  } catch (error) {
    console.error("Ошибка при поиске пользователей:", error);
    throw error;
  }
}

// 9. Блокировка/разблокировка пользователя (только для админов)
export async function toggleBlockUser(userId) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/toggle-block`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Пользователь заблокирован/разблокирован:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при блокировке/разблокировке пользователя:", error);
    throw error;
  }
}

// 10. Изменение роли пользователя (только для админов)
export async function changeUserRole(userId, role) {
  try {
    const response = await fetch(`${API_URL}/users/${userId}/role`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Роль пользователя изменена:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при изменении роли пользователя:", error);
    throw error;
  }
}

// 10. Загрузка фотографий пользователя (только для админов)
export async function uploadUserPhotos(userId, files) {
  try {
    const formData = new FormData();

    // Добавляем файлы
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("photos", file);
      });
    }

    const token = localStorage.getItem("token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    const response = await fetch(`${API_URL}/users/${userId}/photos`, {
      method: "POST",
      headers: headers,
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Фотографии загружены:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при загрузке фотографий:", error);
    throw error;
  }
}

// 11. Получение бронирований пользователя
export async function getUserBookings() {
  try {
    const response = await fetch(`${API_URL}/bookings/my-bookings`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const bookings = await response.json();
    console.log("Бронирования пользователя:", bookings);
    return bookings;
  } catch (error) {
    console.error("Ошибка при получении бронирований:", error);
    throw error;
  }
}

// 9. Удаление квеста (только для админов)
export async function deleteQuest(questId) {
  try {
    const response = await fetch(`${API_URL}/quests/${questId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Квест удален:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при удалении квеста:", error);
    throw error;
  }
}

// 12. Создание заявки (только для операторов)
export async function createRequest(requestData) {
  try {
    const response = await fetch(`${API_URL}/requests`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(requestData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Заявка создана:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при создании заявки:", error);
    throw error;
  }
}

// 13. Получение заявок (только для quest и admin)
export async function getRequests() {
  try {
    const response = await fetch(`${API_URL}/requests`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const requests = await response.json();
    console.log("Заявки:", requests);
    return requests;
  } catch (error) {
    console.error("Ошибка при получении заявок:", error);
    throw error;
  }
}

// 14. Обновление статуса заявки (только для quest и admin)
export async function updateRequestStatus(requestId, status) {
  try {
    const response = await fetch(`${API_URL}/requests/${requestId}/status`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Статус заявки обновлен:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при обновлении статуса заявки:", error);
    throw error;
  }
}

// 17. Назначение заявки (только для операторов)
export async function assignRequest(requestId, targetUserId) {
  try {
    const response = await fetch(`${API_URL}/requests/${requestId}/assign`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetUserId }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Заявка назначена:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при назначении заявки:", error);
    throw error;
  }
}

// 18. Удаление заявки (только для админов)
export async function deleteRequest(requestId) {
  try {
    const response = await fetch(`${API_URL}/requests/${requestId}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Заявка удалена:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при удалении заявки:", error);
    throw error;
  }
}

// 15. Получение комментариев для заявки
export async function getComments(requestId) {
  try {
    const response = await fetch(`${API_URL}/comments/${requestId}`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Комментарии:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при получении комментариев:", error);
    throw error;
  }
}

// 16. Создание комментария
export async function createComment(requestId, text) {
  try {
    const response = await fetch(`${API_URL}/comments`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ requestId, text }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log("Комментарий создан:", result);
    return result;
  } catch (error) {
    console.error("Ошибка при создании комментария:", error);
    throw error;
  }
}
