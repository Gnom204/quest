import { useState, useEffect } from 'react';
import { getQuests, createRequest } from '../../services/api';

const RequestCreation = () => {
  const [quests, setQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState('');
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const response = await getQuests();
        setQuests(response.quests);
      } catch (err) {
        setError('Ошибка при загрузке квестов');
      }
    };
    fetchQuests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedQuest || !text.trim()) {
      setError('Пожалуйста, выберите квест и введите текст заявки');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await createRequest({ selectedQuest, text });
      setSuccess('Заявка успешно создана');
      setSelectedQuest('');
      setText('');
    } catch (err) {
      setError('Ошибка при создании заявки');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="request-creation">
      <h2>Создание заявки на квест</h2>
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit} className="request-form">
        <div className="form-group">
          <label htmlFor="quest">Выберите квест:</label>
          <select
            id="quest"
            value={selectedQuest}
            onChange={(e) => setSelectedQuest(e.target.value)}
            required
          >
            <option value="">-- Выберите квест --</option>
            {quests.map((quest) => (
              <option key={quest._id} value={quest._id}>
                {quest.title}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="text">Текст заявки:</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Введите текст вашей заявки..."
            rows="5"
            required
          />
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary">
          {loading ? 'Создание...' : 'Создать заявку'}
        </button>
      </form>
    </div>
  );
};

export default RequestCreation;