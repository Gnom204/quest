import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getRequests, updateRequestStatus } from "../../services/api";

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequest();
  }, [id]);

  const fetchRequest = async () => {
    try {
      const response = await getRequests();
      const foundRequest = response.requests.find((req) => req._id === id);
      if (!foundRequest) {
        setError("Заявка не найдена");
      } else {
        setRequest(foundRequest);
      }
    } catch (err) {
      setError("Ошибка при загрузке заявки");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await updateRequestStatus(id, newStatus);
      setRequest({ ...request, status: newStatus });
    } catch (err) {
      setError("Ошибка при обновлении статуса");
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!request) return <div>Заявка не найдена</div>;

  return (
    <div className="request-detail">
      <button onClick={() => navigate(-1)} className="btn btn-secondary">
        Назад
      </button>
      <h2>Подробности заявки</h2>
      <div className="request-info">
        <p>
          <strong>Квест:</strong> {request.selectedQuest.title}
        </p>
        <p>
          <strong>Описание квеста:</strong> {request.selectedQuest.description}
        </p>
        <p>
          <strong>Станция метро:</strong> {request.metroBranch}
        </p>
        <p>
          <strong>Дата проведения:</strong>{" "}
          {new Date(request.questDate).toLocaleDateString("ru-RU")}
        </p>
        <p>
          <strong>Время проведения:</strong> {request.questTime}
        </p>
        <p>
          <strong>Оператор:</strong> {request.from.name} ({request.from.email})
        </p>
        <p>
          <strong>Статус:</strong>{" "}
          {request.status === "open" ? "Открыта" : "Закрыта"}
        </p>
        <p>
          <strong>Текст заявки:</strong>
        </p>
        <p className="request-text">{request.text}</p>
        <p>
          <strong>Дата создания:</strong>{" "}
          {new Date(request.createdAt).toLocaleString()}
        </p>
      </div>
      {user?.role === "operator" && (
        <div className="request-actions">
          {request.status === "open" && (
            <button
              onClick={() => handleStatusChange("closed")}
              className="btn btn-secondary"
            >
              Закрыть заявку
            </button>
          )}
          {request.status === "closed" && (
            <button
              onClick={() => handleStatusChange("open")}
              className="btn btn-primary"
            >
              Открыть заявку
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default RequestDetail;
