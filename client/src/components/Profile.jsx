import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getUserBookings, SERVER_URL } from '../services/api';

const Profile = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allQuestPhotos, setAllQuestPhotos] = useState([]);

  useEffect(() => {
    fetchUserBookings();
  }, []);

  const fetchUserBookings = async () => {
    try {
      const response = await getUserBookings();
      setBookings(response.bookings);

      // Collect all photos from completed bookings
      const allPhotos = [];
      response.bookings.forEach(booking => {
        if (booking.photos && booking.photos.length > 0) {
          allPhotos.push(...booking.photos);
        }
      });
      setAllQuestPhotos(allPhotos);
    } catch (error) {
      setError('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const statuses = {
      pending: 'Ожидает подтверждения',
      confirmed: 'Подтверждено',
      completed: 'Завершено',
      cancelled: 'Отменено'
    };
    return statuses[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ff9800',
      confirmed: '#2196f3',
      completed: '#4caf50',
      cancelled: '#f44336'
    };
    return colors[status] || '#666';
  };

  if (loading) {
    return <div className="loading">Загрузка профиля...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="profile">
      <h1>Мой профиль</h1>

      <div className="profile-info">
        <div className="user-details">
          <h2>Информация о пользователе</h2>
          <div className="user-info-grid">
            <div className="info-item">
              <strong>Имя:</strong> {user?.name}
            </div>
            <div className="info-item">
              <strong>Email:</strong> {user?.email}
            </div>
            <div className="info-item">
              <strong>Роль:</strong> {
                user?.role === 'client' ? 'Клиент' :
                user?.role === 'operator' ? 'Оператор' :
                user?.role === 'quest' ? 'Квест' :
                user?.role === 'admin' ? 'Администратор' : user?.role
              }
            </div>
            <div className="info-item">
              <strong>Бонусы:</strong> {user?.bonuses || 0}
            </div>
            <div className="info-item">
              <strong>Дата регистрации:</strong> {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('ru-RU') : 'Неизвестно'}
            </div>
          </div>
        </div>

        {user?.photos && user.photos.length > 0 && (
          <div className="user-photos">
            <h3>Мои фотографии</h3>
            <div className="photos-grid">
              {user.photos.map((photo, index) => (
                <img key={index} src={photo} alt={`Фото ${index + 1}`} />
              ))}
            </div>
          </div>
        )}

        {allQuestPhotos.length > 0 && (
          <div className="quest-photos">
            <h3>Фотографии с квестов</h3>
            <div className="photos-grid">
              {allQuestPhotos.map((photo, index) => (
                <img key={index} src={SERVER_URL + photo} alt={`Фото с квеста ${index + 1}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="user-bookings">
        <h2>Мои квесты</h2>
        {bookings.length === 0 ? (
          <p className="no-bookings">Вы еще не участвовали в квестах.</p>
        ) : (
          <div className="bookings-list">
            {bookings.map((booking) => (
              <div key={booking._id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.quest.title}</h3>
                  <span
                    className="status-badge"
                    style={{ backgroundColor: getStatusColor(booking.status) }}
                  >
                    {getStatusLabel(booking.status)}
                  </span>
                </div>

                <div className="booking-body">
                  <p className="booking-description">
                    {booking.quest.description.substring(0, 150)}...
                  </p>

                  {booking.quest.photos && booking.quest.photos.length > 0 && (
                    <img
                      src={SERVER_URL + booking.quest.photos[0]}
                      alt={booking.quest.title}
                      className="booking-image"
                    />
                  )}

                  <div className="booking-details">
                    <div className="detail-item">
                      <strong>Дата:</strong> {new Date(booking.date).toLocaleDateString('ru-RU')}
                    </div>
                    <div className="detail-item">
                      <strong>Время:</strong> {booking.time}
                    </div>
                    <div className="detail-item">
                      <strong>Игроки:</strong> {booking.quest.minPlayers}-{booking.quest.maxPlayers}
                    </div>
                    {booking.quest.metroBranch && (
                      <div className="detail-item">
                        <strong>Метро:</strong> {booking.quest.metroBranch}
                      </div>
                    )}
                    <div className="detail-item">
                      <strong>Оператор:</strong> {booking.operator.name}
                    </div>
                  </div>

                  {booking.photos && booking.photos.length > 0 && (
                    <div className="booking-photos">
                      <h4>Фотографии с квеста:</h4>
                      <div className="photos-grid">
                        {booking.photos.map((photo, index) => (
                          <img key={index} src={SERVER_URL + photo} alt={`Фото с квеста ${index + 1}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;