import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  getRequests,
  updateRequestStatus,
  SERVER_URL,
} from "../../services/api";

const RequestManagement = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await getRequests();
      setRequests(response.requests);
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
          req._id === requestId ? { ...req, status: newStatus } : req
        )
      );
    } catch (err) {
      setError("Ошибка при обновлении статуса");
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
            <div
              key={request._id}
              className="request-card"
              style={{
                backgroundImage:
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
                  <h3>{request.selectedQuest.title}</h3>
                  <span className={`status status-${request.status}`}>
                    {request.status === "open" ? "Открыта" : "Закрыта"}
                  </span>
                </div>
                <div className="request-details">
                  <p>
                    <strong>Станция метро:</strong> {request.metroBranch}
                  </p>
                  <p>
                    <strong>Оператор:</strong> {request.from.name} (
                    {request.from.email})
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
                  {user?.role === "operator" && (
                    <>
                      {request.status === "open" && (
                        <button
                          onClick={() =>
                            handleStatusChange(request._id, "closed")
                          }
                          className="btn btn-secondary"
                        >
                          Закрыть заявку
                        </button>
                      )}
                      {request.status === "closed" && (
                        <button
                          onClick={() =>
                            handleStatusChange(request._id, "open")
                          }
                          className="btn btn-primary"
                        >
                          Открыть заявку
                        </button>
                      )}
                    </>
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
