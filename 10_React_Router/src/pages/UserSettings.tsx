import { useParams } from 'react-router-dom'
import { useState, FormEvent } from 'react'

function UserSettings() {
  const { userId } = useParams<{ userId: string }>()
  const [settings, setSettings] = useState({
    notifications: true,
    theme: 'light',
    language: 'en',
  })

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    alert('Settings saved!')
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <span style={{ fontSize: '1.5rem' }}>⚙️</span>
        <h3 style={{ margin: 0 }}>User Settings</h3>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
        User ID: <code>{userId}</code>
      </p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="checkbox-group">
            <input
              type="checkbox"
              id="notifications"
              checked={settings.notifications}
              onChange={(e) =>
                setSettings({ ...settings, notifications: e.target.checked })
              }
            />
            <label htmlFor="notifications">
              <span className="label-icon">🔔</span>
              Enable notifications
            </label>
          </div>
        </div>

        <div className="form-group">
          <label>Theme</label>
          <div className="form-field-wrapper">
            <span className="field-icon">🎨</span>
            <select
              value={settings.theme}
              onChange={(e) =>
                setSettings({ ...settings, theme: e.target.value })
              }
            >
              <option value="light">☀️ Light</option>
              <option value="dark">🌙 Dark</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Language</label>
          <div className="form-field-wrapper">
            <span className="field-icon">🌐</span>
            <select
              value={settings.language}
              onChange={(e) =>
                setSettings({ ...settings, language: e.target.value })
              }
            >
              <option value="en">🇺🇸 English</option>
              <option value="es">🇪🇸 Spanish</option>
              <option value="fr">🇫🇷 French</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit">💾 Save Settings</button>
        </div>
      </form>
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: 'var(--bg-secondary)',
        borderRadius: '8px',
        fontSize: '0.875rem',
        color: 'var(--text-secondary)'
      }}>
        <strong>📝 Note:</strong> This is another nested route component. Both
        Posts and Settings are nested under UserProfile.
      </div>
    </div>
  )
}

export default UserSettings

