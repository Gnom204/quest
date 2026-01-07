import { useState, useEffect, useCallback } from 'react';
import { getUsers, searchUsers, toggleBlockUser, uploadUserPhotos } from '../../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [searchEmail, setSearchEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

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

  const openModal = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedUser(null);
    setModalOpen(false);
  };

  const handleToggleBlock = async () => {
    if (!selectedUser) return;

    try {
      await toggleBlockUser(selectedUser._id);
      // Update the user in the list
      setUsers(users.map(user =>
        user._id === selectedUser._id
          ? { ...user, isBlocked: !user.isBlocked }
          : user
      ));
      setSelectedUser({ ...selectedUser, isBlocked: !selectedUser.isBlocked });
    } catch (error) {
      setError('Failed to toggle user block status');
    }
  };

  const handlePhotoUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0 || !selectedUser) return;

    setUploading(true);
    try {
      await uploadUserPhotos(selectedUser._id, files);
      // Refresh users list to get updated photos
      await fetchUsers();
      setError('');
    } catch (error) {
      setError('Failed to upload photos');
    } finally {
      setUploading(false);
    }
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
              <tr key={user._id} onClick={() => openModal(user)} style={{ cursor: 'pointer' }}>
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

      {modalOpen && selectedUser && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Управление пользователем: {selectedUser.name}</h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="user-info">
                <p><strong>Email:</strong> {selectedUser.email}</p>
                <p><strong>Роль:</strong> {getRoleLabel(selectedUser.role)}</p>
                <p><strong>Заблокирован:</strong> {selectedUser.isBlocked ? 'Да' : 'Нет'}</p>
                <p><strong>Дата регистрации:</strong> {new Date(selectedUser.createdAt).toLocaleDateString('ru-RU')}</p>
              </div>

              <div className="modal-actions">
                <button
                  className={`btn ${selectedUser.isBlocked ? 'btn-secondary' : 'btn-danger'}`}
                  onClick={handleToggleBlock}
                >
                  {selectedUser.isBlocked ? 'Разблокировать' : 'Заблокировать'}
                </button>

                <div className="photo-upload">
                  <label htmlFor="photo-upload" className="btn btn-primary">
                    {uploading ? 'Загрузка...' : 'Прислать фотографии'}
                  </label>
                  <input
                    type="file"
                    id="photo-upload"
                    multiple
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    style={{ display: 'none' }}
                    disabled={uploading}
                  />
                </div>
              </div>

              {selectedUser.photos && selectedUser.photos.length > 0 && (
                <div className="user-photos">
                  <h4>Фотографии пользователя:</h4>
                  <div className="photos-grid">
                    {selectedUser.photos.map((photo, index) => (
                      <img key={index} src={photo} alt={`Фото ${index + 1}`} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
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