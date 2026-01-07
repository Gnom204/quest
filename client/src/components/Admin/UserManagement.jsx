import { useState, useEffect, useCallback } from 'react';
import { getUsers, searchUsers } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (email) => {
      if (!email.trim()) {
        await fetchUsers();
        return;
      }

      setSearching(true);
      try {
        const response = await searchUsers(email);
        setUsers(response.users);
        setError('');
      } catch (error) {
        setError('Search failed');
        setUsers([]);
      } finally {
        setSearching(false);
      }
    }, 300),
    []
  );

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    debouncedSearch(searchEmail);
  }, [searchEmail, debouncedSearch]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await getUsers();
      setUsers(response.users);
      setError('');
    } catch (error) {
      setError('Failed to load users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = (e) => {
    setSearchEmail(e.target.value);
  };

  const clearSearch = () => {
    setSearchEmail('');
  };

  const getRoleLabel = (role) => {
    const roles = {
      client: 'Клиент',
      operator: 'Оператор',
      quest: 'Квест',
      admin: 'Администратор'
    };
    return roles[role] || role;
  };

  if (loading && !searching) {
    return <div className="loading">Загрузка пользователей...</div>;
  }

  return (
    <div className="user-management">
      <h2>Управление пользователями</h2>

      <div className="search-form">
        <div className="form-group">
          <label htmlFor="searchEmail">Поиск по email:</label>
          <div className="search-input-container">
            <input
              type="email"
              id="searchEmail"
              value={searchEmail}
              onChange={handleEmailChange}
              placeholder="Введите email для поиска..."
              className="search-input"
            />
            {searchEmail && (
              <button
                type="button"
                onClick={clearSearch}
                className="clear-button"
                title="Очистить поиск"
              >
                ✕
              </button>
            )}
            {searching && <div className="search-spinner">⟳</div>}
          </div>
          <small className="search-hint">
            Поиск происходит автоматически при вводе
          </small>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="users-table">
        <table>
          <thead>
            <tr>
              <th>Имя</th>
              <th>Email</th>
              <th>Роль</th>
              <th>Заблокирован</th>
              <th>Дата регистрации</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.name}</td>
                <td>{user.email}</td>
                <td>{getRoleLabel(user.role)}</td>
                <td>{user.isBlocked ? 'Да' : 'Нет'}</td>
                <td>{new Date(user.createdAt).toLocaleDateString('ru-RU')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && !loading && (
        <p className="no-users">
          {searchEmail ? 'Пользователи не найдены' : 'Пользователи не найдены.'}
        </p>
      )}
    </div>
  );
};

// Debounce utility function
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

export default UserManagement;