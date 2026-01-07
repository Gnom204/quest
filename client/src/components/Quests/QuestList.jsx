import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getQuests, SERVER_URL } from '../../services/api';

const QuestList = () => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      const response = await getQuests();
      setQuests(response.quests);
    } catch (error) {
      setError('Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка квестов...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="quest-list">
      <h1>Доступные квесты</h1>
      <div className="quests-grid">
        {quests.map((quest) => (
          <div key={quest._id} className="quest-card">
            <div className="quest-image-container">
              {quest.photos && quest.photos.length > 0 && (
                <img
                  src={SERVER_URL + quest.photos[0]}
                  alt={quest.title}
                  className="quest-image"
                />
              )}
              <div className="image-overlay"></div>
              <div className="quest-info-overlay">
                <h3>{quest.title}</h3>
                <span className="player-count">
                  {quest.minPlayers}-{quest.maxPlayers} игроков
                </span>
              </div>
              <div className="quest-description-overlay">
                <p>{quest.description}</p>
              </div>
            </div>
            <div className="quest-card-footer">
              <Link to={`/quests/${quest._id}`} className="btn btn-primary">
                Подробнее
              </Link>
            </div>
          </div>
        ))}
      </div>
      {quests.length === 0 && (
        <p className="no-quests">Квесты пока не добавлены.</p>
      )}
    </div>
  );
};

export default QuestList;