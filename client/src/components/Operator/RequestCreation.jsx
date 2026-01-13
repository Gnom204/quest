import { useState, useEffect } from "react";
import { getQuests, createRequest } from "../../services/api";

const RequestCreation = () => {
  const [quests, setQuests] = useState([]);
  const [selectedQuest, setSelectedQuest] = useState("");
  const [text, setText] = useState("");
  const [questDate, setQuestDate] = useState("");
  const [questTime, setQuestTime] = useState("");
  const [metroBranch, setMetroBranch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchQuests = async () => {
      try {
        const response = await getQuests();
        setQuests(response.quests);
      } catch (err) {
        setError("Ошибка при загрузке квестов");
      }
    };
    fetchQuests();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !selectedQuest ||
      !text.trim() ||
      !questDate ||
      !questTime ||
      !metroBranch.trim()
    ) {
      setError("Пожалуйста, заполните все поля");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      await createRequest({
        selectedQuest,
        text,
        questDate,
        questTime,
        metroBranch,
      });
      setSuccess("Заявка успешно создана");
      setSelectedQuest("");
      setText("");
      setQuestDate("");
      setQuestTime("");
      setMetroBranch("");
    } catch (err) {
      setError("Ошибка при создании заявки");
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
          <label htmlFor="questDate">Дата проведения квеста:</label>
          <input
            type="date"
            id="questDate"
            value={questDate}
            onChange={(e) => setQuestDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="questTime">Время проведения квеста:</label>
          <input
            type="time"
            id="questTime"
            value={questTime}
            onChange={(e) => setQuestTime(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="metroBranch">Станция метро:</label>
          <input
            type="text"
            id="metroBranch"
            value={metroBranch}
            onChange={(e) => setMetroBranch(e.target.value)}
            placeholder="Введите станцию метро"
            required
          />
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
          {loading ? "Создание..." : "Создать заявку"}
        </button>
      </form>
    </div>
  );
};

export default RequestCreation;
