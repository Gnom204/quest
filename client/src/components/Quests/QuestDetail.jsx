import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getQuests } from '../../services/api';
import { SERVER_URL } from '../../services/api';

const QuestDetail = () => {
  const { id } = useParams();
  const [quest, setQuest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuest();
  }, [id]);

  const fetchQuest = async () => {
    try {
      const response = await getQuests();
      const foundQuest = response.quests.find(q => q._id === id);
      if (foundQuest) {
        setQuest(foundQuest);
      } else {
        setError('Квест не найден');
      }
    } catch (error) {
      setError('Failed to load quest');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка квеста...</div>;
  }

  if (error || !quest) {
    return <div className="error-message">{error || 'Квест не найден'}</div>;
  }

  return (
    <div className="quest-detail">
      <div className="quest-header">
        <h1>{quest.title}</h1>
        <div className="quest-meta">
          <span className="player-count">
            {quest.minPlayers}-{quest.maxPlayers} игроков
          </span>
          <span className="owner">
            Создано: {quest.owner.name} ({quest.owner.email})
          </span>
        </div>
      </div>

      <div className="quest-content">
        <div className="quest-description">
          <h2>Описание</h2>
          <p>{quest.description}</p>
        </div>

        {quest.photos && quest.photos.length > 0 && (
          <div className="quest-photos">
            <h2>Фотографии</h2>
            <div className="photos-grid">
              {quest.photos.map((photo, index) => (
                <img
                  key={index}
                  src={SERVER_URL+photo}
                  alt={`${quest.title} ${index + 1}`}
                  className="quest-photo"
                />
              ))}
            </div>
          </div>
        )}

        <div className="quest-info">
          <p><strong>Статус:</strong> {quest.isActive ? 'Активен' : 'Неактивен'}</p>
          <p><strong>Создан:</strong> {new Date(quest.createdAt).toLocaleDateString('ru-RU')}</p>
        </div>
      </div>
    </div>
  );
};

export default QuestDetail;