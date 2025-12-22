import { useAppContext } from "../hooks/useAppContext";

export function Preview() {
  const { state } = useAppContext();

  return (
    <div className="preview-panel">
      <h2 className="preview-title">👁️ Preview</h2>
      <h3 className="preview-subtitle">Current Preferences:</h3>
      <ul className="preview-list">
        <li className="preview-item">
          <div className="preview-label">Theme</div>
          <div className="preview-value">{state.theme}</div>
        </li>
        <li className="preview-item">
          <div className="preview-label">Primary Color</div>
          <div className="preview-value" style={{ color: state.primaryColor }}>
            {state.primaryColor}
          </div>
        </li>
        <li className="preview-item">
          <div className="preview-label">Font Size</div>
          <div className="preview-value">{state.fontSize}</div>
        </li>
        <li className="preview-item">
          <div className="preview-label">Sidebar</div>
          <div className="preview-value">
            {state.sidebarCollapsed ? "Collapsed" : "Expanded"}
          </div>
        </li>
        <li className="preview-item">
          <div className="preview-label">Header</div>
          <div className="preview-value">
            {state.headerVisible ? "Visible" : "Hidden"}
          </div>
        </li>
        <li className="preview-item">
          <div className="preview-label">Language</div>
          <div className="preview-value">{state.language}</div>
        </li>
        <li className="preview-item">
          <div className="preview-label">Animations</div>
          <div className="preview-value">
            {state.animationsEnabled ? "Enabled" : "Disabled"}
          </div>
        </li>
      </ul>
    </div>
  );
}
