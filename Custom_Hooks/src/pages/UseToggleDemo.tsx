import useToggle from '../hooks/useToggle'

function UseToggleDemo() {
  const [isOn, toggle, setIsOn] = useToggle(false)
  const [isVisible, toggleVisible] = useToggle(true)
  const [isDarkMode, toggleDarkMode] = useToggle(false)

  return (
    <div className="page">
      <h2>🔄 useToggle Hook</h2>
      <p>
        A convenient hook for toggling boolean values. Perfect for modals,
        dropdowns, switches, and any on/off state.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        <div className="card">
          <h3>Basic Toggle</h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '1rem'
          }}>
            <div style={{
              width: '60px',
              height: '30px',
              background: isOn ? 'var(--success-color)' : 'var(--bg-tertiary)',
              borderRadius: '15px',
              position: 'relative',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onClick={toggle}>
              <div style={{
                width: '26px',
                height: '26px',
                background: 'white',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                left: isOn ? '32px' : '2px',
                transition: 'all 0.3s ease',
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }} />
            </div>
            <span>
              {isOn ? '✅ ON' : '❌ OFF'}
            </span>
          </div>
          <button onClick={toggle} style={{ marginTop: '1rem', width: '100%' }}>
            Toggle
          </button>
        </div>

        <div className="card">
          <h3>Visibility Toggle</h3>
          {isVisible && (
            <div style={{
              padding: '1rem',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '8px',
              marginTop: '1rem',
              textAlign: 'center'
            }}>
              👋 Hello! I'm visible!
            </div>
          )}
          <button onClick={toggleVisible} style={{ marginTop: '1rem', width: '100%' }}>
            {isVisible ? 'Hide' : 'Show'} Content
          </button>
        </div>

        <div className="card">
          <h3>Dark Mode Toggle</h3>
          <div style={{
            padding: '1rem',
            background: isDarkMode ? '#1f2937' : '#f9fafb',
            color: isDarkMode ? 'white' : 'black',
            borderRadius: '8px',
            marginTop: '1rem',
            textAlign: 'center',
            transition: 'all 0.3s ease'
          }}>
            {isDarkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
          </div>
          <button onClick={toggleDarkMode} style={{ marginTop: '1rem', width: '100%' }}>
            Toggle Theme
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>💡 Usage</h3>
        <pre>
          <code>{`const [isOn, toggle, setIsOn] = useToggle(false)

// Toggle the value
toggle()

// Set specific value
setIsOn(true)`}</code>
        </pre>
      </div>
    </div>
  )
}

export default UseToggleDemo

