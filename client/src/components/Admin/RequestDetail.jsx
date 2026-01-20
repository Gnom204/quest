import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import {
  getRequests,
  updateRequestStatus,
  getComments,
  createComment,
  assignRequest,
} from "../../services/api";

const RequestDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [request, setRequest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [newCommentText, setNewCommentText] = useState("");
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    fetchRequest();
  }, [id]);

  useEffect(() => {
    if (request) {
      fetchComments();
    }
  }, [request]);

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

  const fetchComments = async () => {
    try {
      setLoadingComments(true);
      const response = await getComments(id);
      setComments(response.comments);
    } catch (err) {
      console.error("Ошибка при загрузке комментариев:", err);
    } finally {
      setLoadingComments(false);
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

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    try {
      await createComment(id, newCommentText.trim());
      setNewCommentText("");
      fetchComments(); // Перезагрузить комментарии
    } catch (err) {
      setError("Ошибка при отправке комментария");
    }
  };

  const handleAssignToComment = async (targetUserId) => {
    setAssigning(true);
    try {
      await assignRequest(id, targetUserId);
      setRequest({ ...request, status: "closed" });
    } catch (err) {
      setError("Ошибка при назначении заявки");
    } finally {
      setAssigning(false);
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
      {user?.role === "operator" && user?.id === request.from._id && (
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

      {/* Комментарии */}
      <div className="comments-section">
        <h3>Комментарии</h3>
        {loadingComments ? (
          <div>Загрузка комментариев...</div>
        ) : (
          <div className="comments-list">
            {comments.length === 0 ? (
              <p>Комментариев пока нет.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="comment">
                  <div className="comment-header">
                    <strong>{comment.author.name}</strong> (
                    {comment.author.email})
                    <span className="comment-date">
                      {new Date(comment.createdAt).toLocaleString("ru-RU")}
                    </span>
                  </div>
                  <p className="comment-text">{comment.text}</p>
                  {user?.role === "operator" &&
                    user?.id === request.from._id &&
                    request.status === "open" &&
                    comment.author.role === "quest" && (
                      <button
                        onClick={() =>
                          handleAssignToComment(comment.author._id)
                        }
                        disabled={assigning}
                        className="btn btn-primary btn-small"
                      >
                        {assigning ? "назначается..." : "Назначить"}
                      </button>
                    )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Форма для нового комментария */}
        {user?.role === "quest" && (
          <form onSubmit={handleSubmitComment} className="comment-form">
            <textarea
              value={newCommentText}
              onChange={(e) => setNewCommentText(e.target.value)}
              placeholder="Введите ваш комментарий..."
              rows="3"
              required
            />
            <button type="submit" className="btn btn-primary">
              Отправить
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default RequestDetail;
