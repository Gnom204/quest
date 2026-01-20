import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  getRequests,
  updateRequestStatus,
  deleteRequest,
  SERVER_URL,
} from "../../services/api";
import deleteIcon from "../../assets/delete_16025538.png";

const RequestManagement = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuestFilter, setSelectedQuestFilter] = useState("");
  const [selectedMetroFilter, setSelectedMetroFilter] = useState("");
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [uniqueQuests, setUniqueQuests] = useState([]);
  const [uniqueMetros, setUniqueMetros] = useState([]);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    let filtered = requests;
    if (selectedQuestFilter) {
      filtered = filtered.filter(
        (r) => r.selectedQuest.title === selectedQuestFilter,
      );
    }
    if (selectedMetroFilter) {
      filtered = filtered.filter((r) => r.metroBranch === selectedMetroFilter);
    }
    setFilteredRequests(filtered);
  }, [requests, selectedQuestFilter, selectedMetroFilter]);

  const fetchRequests = async () => {
    try {
      const response = await getRequests();
      setRequests(response.requests);
      const quests = [
        ...new Set(
          response.requests
            .filter((r) => r.selectedQuest)
            .map((r) => r.selectedQuest.title),
        ),
      ];
      setUniqueQuests(quests);
      const metros = [...new Set(response.requests.map((r) => r.metroBranch))];
      setUniqueMetros(metros);
      setFilteredRequests(response.requests);
    } catch (err) {
      setError("Ошибка при загрузке заявок");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (requestId, newStatus) => {
    try {
      await updateRequestStatus(requestId, newStatus);
      // Update local state
      setRequests(
        requests.map((req) =>
          req._id === requestId ? { ...req, status: newStatus } : req,
        ),
      );
    } catch (err) {
      setError("Ошибка при обновлении статуса");
    }
  };

  const handleDeleteRequest = async (requestId) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту заявку?")) return;
    try {
      await deleteRequest(requestId);
      // Update local state
      setRequests(requests.filter((req) => req._id !== requestId));
    } catch (err) {
      setError("Ошибка при удалении заявки");
    }
  };

  if (loading) return <div>Загрузка...</div>;
  if (error) return <div className="error-message">{error}</div>;

  return (
    <div className="request-management">
      <h2>Управление заявками</h2>
      <div className="filters">
        <select
          value={selectedQuestFilter}
          onChange={(e) => setSelectedQuestFilter(e.target.value)}
        >
          <option value="">Все квесты</option>
          {uniqueQuests.map((quest) => (
            <option key={quest} value={quest}>
              {quest}
            </option>
          ))}
        </select>
        <select
          value={selectedMetroFilter}
          onChange={(e) => setSelectedMetroFilter(e.target.value)}
        >
          <option value="">Все станции</option>
          {uniqueMetros.map((metro) => (
            <option key={metro} value={metro}>
              {metro}
            </option>
          ))}
        </select>
      </div>
      {filteredRequests.length === 0 ? (
        <p>Нет заявок</p>
      ) : (
        <div className="requests-list">
          {filteredRequests.map((request) => (
            <div
              key={request._id}
              className="request-card"
              style={{
                backgroundImage:
                  request.selectedQuest &&
                  request.selectedQuest.photos &&
                  request.selectedQuest.photos.length > 0
                    ? `url(${request.selectedQuest.photos[0]})`
                    : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="request-overlay">
                <div className="request-header">
                  <h3>
                    {request.selectedQuest
                      ? request.selectedQuest.title
                      : "Квест удален"}
                  </h3>
                  <span className={`status status-${request.status}`}>
                    {request.status === "open" ? "Открыта" : "Закрыта"}
                  </span>
                </div>
                <div className="request-details">
                  <p>
                    <strong>Станция метро:</strong> {request.metroBranch}
                  </p>
                  <p>
                    <strong>Оператор:</strong>{" "}
                    {request.from ? request.from.name : "Неизвестно"} (
                    {request.from ? request.from.email : "Неизвестно"})
                  </p>
                  <p>
                    {new Date(request.questDate).toLocaleDateString("ru-RU")} в{" "}
                    {request.questTime}
                  </p>
                  <p>
                    <strong>Комментарий:</strong>{" "}
                    {request.text.substring(0, 20)}
                    {request.text.length > 20 ? "..." : ""}
                  </p>
                </div>
                <div className="request-actions">
                  <Link
                    to={`/requests/${request._id}`}
                    className="btn btn-primary"
                  >
                    Подробнее
                  </Link>
                  {user?.role === "admin" && (
                    <button
                      onClick={() => handleDeleteRequest(request._id)}
                      className="btn btn-danger"
                    >
                      <img
                        src={deleteIcon}
                        alt="Удалить"
                        style={{
                          filter: "brightness(0) invert(1)",
                          width: "20px",
                          height: "20px",
                        }}
                      />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RequestManagement;
