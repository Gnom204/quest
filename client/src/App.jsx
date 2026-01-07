import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import QuestList from './components/Quests/QuestList';
import QuestDetail from './components/Quests/QuestDetail';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import AdminPanel from './components/Admin/AdminPanel';
import './App.css';

function App() {
  const { user, logout, isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <div className="loading">Загрузка...</div>;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <Link to="/" className="logo">
            Quest Boom
          </Link>

          <nav className="nav">
            {isAuthenticated ? (
              <>
                <span>Привет, {user?.name}!</span>
                {isAdmin && (
                  <Link to="/admin" className="nav-link">
                    Панель администратора
                  </Link>
                )}
                <button onClick={logout} className="btn btn-secondary">
                  Выйти
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Войти</Link>
                <Link to="/register" className="nav-link">Регистрация</Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<QuestList />} />
          <Route path="/quests/:id" element={<QuestDetail />} />
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" /> : <Login />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" /> : <Register />}
          />
          <Route
            path="/admin"
            element={isAdmin ? <AdminPanel /> : <Navigate to="/" />}
          />
        </Routes>
      </main>
    </div>
  );
}

export default App;
