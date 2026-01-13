import { useState, useEffect } from 'react';
import { getRequests, updateRequestStatus } from '../../services/api';

const RequestManagement = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getRequests();
      setRequests(response.requests);
    } catch (err) {
      setError('Ошибка при загрузке заявок');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await updateRequestStatus(requestId, newStatus);
      // Update local state
      setRequests(requests.map(req =>
        req._id === requestId ? { ...req, status: newStatus } : req
      ));
    } catch (err) {
      setError('Ошибка при обновлении статуса');
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="request-management">
      <h2>Управление заявками</h2>
      {requests.length === 0 ? (
        <p>Нет заявок</p>
      ) : (
        <div className="requests-list">
          {requests.map((request) => (
            <div key={request._id} className="request-card">
              <div className="request-header">
                <h3>Заявка от {request.from.name} ({request.from.email})</h3>
                <span className={`status status-${request.status}`}>
                  {request.status === 'open' ? 'Открыта' : 'Закрыта'}
                </span>
              </div>
              <div className="request-details">
                <p><strong>Квест:</strong> {request.selectedQuest.title}</p>
                <p><strong>Дата:</strong> {new Date(request.date).toLocaleDateString()}</p>
                <p><strong>Текст:</strong></p>
                <p className="request-text">{request.text}</p>
                <p><strong>Создано:</strong> {new Date(request.createdAt).toLocaleString()}</p>
              </div>
              <div className="request-actions">
                {request.status === 'open' && (
                  <button
                    onClick={() => handleStatusChange(request._id, 'closed')}
                    className="btn btn-secondary"
                  >
                    Закрыть заявку
                  </button>
                )}
                {request.status === 'closed' && (
                  <button
                    onClick={() => handleStatusChange(request._id, 'open')}
                    className="btn btn-primary"
                  >
                    Открыть заявку
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestManagement;