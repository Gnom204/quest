import { useState, useEffect } from 'react';
import { getQuests, deleteQuest } from '../../services/api';

const QuestManagement = () => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchQuests();
  }, []);

  const fetchQuests = async () => {
    try {
      const response = await getQuests();
      setQuests(response.quests);
      setError('');
    } catch (error) {
      setError('Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuest = async (questId, questTitle) => {
    if (!window.confirm(`Вы уверены, что хотите удалить квест "${questTitle}"?`)) {
      return;
    }

    setDeletingId(questId);
    try {
      await deleteQuest(questId);
      setQuests(quests.filter(quest => quest._id !== questId));
      setError('');
    } catch (error) {
      setError('Failed to delete quest');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <div className="loading">Загрузка квестов...</div>;
  }

  return (
    <div className="quest-management">
      <h2>Управление квестами</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="quests-table">
        <table>
          <thead>
            <tr>
              <th>Название</th>
              <th>Описание</th>
              <th>Игроки</th>
              <th>Фото</th>
              <th>Статус</th>
              <th>Действия</th>
            </tr>
          </thead>
          <tbody>
            {quests.map((quest) => (
              <tr key={quest._id}>
                <td>{quest.title}</td>
                <td>{quest.description.length > 50 ? `${quest.description.substring(0, 50)}...` : quest.description}</td>
                <td>{quest.minPlayers}-{quest.maxPlayers}</td>
                <td>{quest.photos ? quest.photos.length : 0}</td>
                <td>{quest.isActive ? 'Активен' : 'Неактивен'}</td>
                <td>
                  <button
                    onClick={() => handleDeleteQuest(quest._id, quest.title)}
                    disabled={deletingId === quest._id}
                    className="btn btn-danger btn-small"
                  >
                    {deletingId === quest._id ? 'Удаление...' : 'Удалить'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {quests.length === 0 && (
        <p className="no-quests">Квесты не найдены.</p>
      )}
    </div>
  );
};

export default QuestManagement;