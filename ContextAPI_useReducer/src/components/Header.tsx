import { useAppContext } from "../hooks/useAppContext";
import { AppActionType } from "../context/appTypes";

export function Header() {
  const { state, dispatch } = useAppContext();

  const handleToggleHeader = () => {
    dispatch({ type: AppActionType.TOGGLE_HEADER });
  };

  return (
    <div>
      {state.headerVisible && (
        <header className="header-container">
          <div className="header-content">
            <h1 className="header-title">Dashboard Preferences Manager</h1>
            <div className="header-info">
              <span className="header-badge">
                <span>🎨</span>
                <span>Theme: {state.theme}</span>
              </span>
              <span className="header-badge">
                <span>🌐</span>
                <span>Language: {state.language}</span>
              </span>
              <button
                className="header-toggle-btn"
                onClick={handleToggleHeader}
              >
                Hide Header
              </button>
            </div>
          </div>
        </header>
      )}
      {!state.headerVisible && (
        <div style={{ padding: "1rem" }}>
          <button className="header-toggle-btn" onClick={handleToggleHeader}>
            Show Header
          </button>
        </div>
      )}
    </div>
  );
}
