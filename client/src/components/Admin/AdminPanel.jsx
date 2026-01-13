import { useState } from 'react';
import UserManagement from './UserManagement';
import QuestCreation from './QuestCreation';
import QuestManagement from './QuestManagement';
import RequestManagement from './RequestManagement';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('users');

  const tabs = [
    { id: 'users', label: 'Управление пользователями', component: UserManagement },
    { id: 'create-quest', label: 'Создание квестов', component: QuestCreation },
    { id: 'manage-quests', label: 'Управление квестами', component: QuestManagement },
    { id: 'requests', label: 'Управление заявками', component: RequestManagement },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component;

  return (
    <div className="admin-panel">
      <h1>Панель администратора</h1>

      <div className="admin-tabs">
        {tabs.map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {ActiveComponent && <ActiveComponent />}
      </div>
    </div>
  );
};

export default AdminPanel;