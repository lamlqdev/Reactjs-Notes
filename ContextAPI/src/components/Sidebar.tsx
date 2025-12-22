import { useAppContext } from '../hooks/useAppContext';
import { AppActionType } from '../context/appTypes';

export function Sidebar() {
  const { state, dispatch } = useAppContext();

  const handleToggleSidebar = () => {
    dispatch({ type: AppActionType.TOGGLE_SIDEBAR });
  };

  return (
    <aside className={`sidebar-container ${state.sidebarCollapsed ? 'collapsed' : ''}`}>
      {!state.sidebarCollapsed && (
        <div className="sidebar-content">
          <h2 className="sidebar-title">📋 Navigation</h2>
          <nav>
            <ul className="sidebar-nav">
              <li>🏠 Dashboard</li>
              <li>⚙️ Settings</li>
              <li>👤 Profile</li>
              <li>📊 Analytics</li>
            </ul>
          </nav>
        </div>
      )}
      <button className="sidebar-toggle-btn" onClick={handleToggleSidebar}>
        {state.sidebarCollapsed ? '▶ Expand' : '◀ Collapse'}
      </button>
    </aside>
  );
}

