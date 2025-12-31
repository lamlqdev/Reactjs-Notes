import { useAppContext } from "../hooks/useAppContext";
import { AppActionType } from "../context/appTypes";
import { Theme, FontSize, Language } from "../context/appTypes";

export function SettingsPanel() {
  const { state, dispatch } = useAppContext();

  const handleSetTheme = (theme: Theme) => {
    dispatch({ type: AppActionType.SET_THEME, payload: theme });
  };

  const handleSetPrimaryColor = (color: string) => {
    dispatch({ type: AppActionType.SET_PRIMARY_COLOR, payload: color });
  };

  const handleSetFontSize = (fontSize: FontSize) => {
    dispatch({ type: AppActionType.SET_FONT_SIZE, payload: fontSize });
  };

  const handleSetLanguage = (language: Language) => {
    dispatch({ type: AppActionType.SET_LANGUAGE, payload: language });
  };

  const handleToggleAnimations = () => {
    dispatch({ type: AppActionType.TOGGLE_ANIMATIONS });
  };

  return (
    <div className="settings-panel">
      <h2 className="settings-title">⚙️ Settings Panel</h2>

      <section className="settings-section">
        <h3 className="settings-section-title">🎨 Theme</h3>
        <div className="settings-controls">
          <button
            className={`settings-btn ${
              state.theme === "light" ? "active" : ""
            }`}
            onClick={() => handleSetTheme("light")}
          >
            ☀️ Light
          </button>
          <button
            className={`settings-btn ${state.theme === "dark" ? "active" : ""}`}
            onClick={() => handleSetTheme("dark")}
          >
            🌙 Dark
          </button>
        </div>
        <p className="settings-current">
          Current: <strong>{state.theme}</strong>
        </p>
      </section>

      <section className="settings-section">
        <h3 className="settings-section-title">🎨 Primary Color</h3>
        <div className="settings-controls">
          <input
            className="settings-color-input"
            type="color"
            value={state.primaryColor}
            onChange={(e) => handleSetPrimaryColor(e.target.value)}
          />
        </div>
        <p className="settings-current">
          Current: <strong>{state.primaryColor}</strong>
        </p>
      </section>

      <section className="settings-section">
        <h3 className="settings-section-title">📝 Font Size</h3>
        <div className="settings-controls">
          <button
            className={`settings-btn ${
              state.fontSize === "small" ? "active" : ""
            }`}
            onClick={() => handleSetFontSize("small")}
          >
            Small
          </button>
          <button
            className={`settings-btn ${
              state.fontSize === "medium" ? "active" : ""
            }`}
            onClick={() => handleSetFontSize("medium")}
          >
            Medium
          </button>
          <button
            className={`settings-btn ${
              state.fontSize === "large" ? "active" : ""
            }`}
            onClick={() => handleSetFontSize("large")}
          >
            Large
          </button>
        </div>
        <p className="settings-current">
          Current: <strong>{state.fontSize}</strong>
        </p>
      </section>

      <section className="settings-section">
        <h3 className="settings-section-title">🌐 Language</h3>
        <div className="settings-controls">
          <button
            className={`settings-btn ${
              state.language === "en" ? "active" : ""
            }`}
            onClick={() => handleSetLanguage("en")}
          >
            🇺🇸 English
          </button>
          <button
            className={`settings-btn ${
              state.language === "vi" ? "active" : ""
            }`}
            onClick={() => handleSetLanguage("vi")}
          >
            🇻🇳 Tiếng Việt
          </button>
        </div>
        <p className="settings-current">
          Current: <strong>{state.language}</strong>
        </p>
      </section>

      <section className="settings-section">
        <h3 className="settings-section-title">✨ Animations</h3>
        <div className="settings-controls">
          <button
            className={`settings-btn ${
              state.animationsEnabled ? "active" : ""
            }`}
            onClick={handleToggleAnimations}
          >
            {state.animationsEnabled ? "✅ Enabled" : "❌ Disabled"}
          </button>
        </div>
        <p className="settings-current">
          Status:{" "}
          <strong>{state.animationsEnabled ? "Enabled" : "Disabled"}</strong>
        </p>
      </section>
    </div>
  );
}
