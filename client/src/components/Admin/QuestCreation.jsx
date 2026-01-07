import { useState } from 'react';
import { createQuest } from '../../services/api';

const QuestCreation = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    minPlayers: 1,
    maxPlayers: 4,
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name.includes('Players') ? parseInt(value) : value,
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);

    // Validate files
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB
        setError('File size must be less than 5MB');
        return false;
      }
      return true;
    });

    setSelectedFiles(validFiles);

    // Create preview URLs
    const urls = validFiles.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const removePhoto = (index) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    const newUrls = previewUrls.filter((_, i) => i !== index);

    setSelectedFiles(newFiles);
    setPreviewUrls(newUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (formData.minPlayers > formData.maxPlayers) {
      setError('Минимальное количество игроков не может быть больше максимального');
      setLoading(false);
      return;
    }

    try {
      await createQuest(formData, selectedFiles);
      setSuccess('Квест успешно создан!');
      setFormData({
        title: '',
        description: '',
        minPlayers: 1,
        maxPlayers: 4,
      });
      setSelectedFiles([]);
      setPreviewUrls([]);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quest-creation">
      <h2>Создание квеста</h2>

      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Название квеста:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Описание:</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="minPlayers">Мин. игроков:</label>
            <input
              type="number"
              id="minPlayers"
              name="minPlayers"
              value={formData.minPlayers}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="maxPlayers">Макс. игроков:</label>
            <input
              type="number"
              id="maxPlayers"
              name="maxPlayers"
              value={formData.maxPlayers}
              onChange={handleChange}
              min="1"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="photos">Фотографии:</label>
          <div className="file-input">
            <input
              type="file"
              id="photos"
              multiple
              accept="image/*"
              onChange={handleFileChange}
            />
            <small>Максимум 10 файлов, каждый до 5MB</small>
          </div>

          {previewUrls.length > 0 && (
            <div className="photos-preview">
              {previewUrls.map((url, index) => (
                <div key={index} className="photo-item">
                  <img src={url} alt={`Фото ${index + 1}`} />
                  <button type="button" onClick={() => removePhoto(index)}>Удалить</button>
                </div>
              ))}
            </div>
          )}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Создание...' : 'Создать квест'}
        </button>
      </form>
    </div>
  );
};

export default QuestCreation;