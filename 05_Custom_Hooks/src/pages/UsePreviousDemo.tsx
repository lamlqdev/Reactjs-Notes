import { useState } from 'react'
import usePrevious from '../hooks/usePrevious'

function UsePreviousDemo() {
  const [count, setCount] = useState(0)
  const [name, setName] = useState('')
  const previousCount = usePrevious(count)
  const previousName = usePrevious(name)

  return (
    <div className="page">
      <h2>⏮️ usePrevious Hook</h2>
      <p>
        Track the previous value of a state or prop. Useful for comparing
        current and previous values, detecting changes, and implementing undo
        functionality.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        <div className="card">
          <h3>Counter Example</h3>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            marginTop: '1rem'
          }}>
            <div style={{
              fontSize: '3rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              marginBottom: '1rem'
            }}>
              {count}
            </div>
            <div style={{
              fontSize: '1.5rem',
              color: 'var(--text-secondary)',
              marginBottom: '1rem'
            }}>
              Previous: {previousCount ?? 'N/A'}
            </div>
            <div style={{
              padding: '0.5rem',
              background: 'var(--bg-secondary)',
              borderRadius: '8px',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              Change: {previousCount !== undefined ? count - previousCount : 0}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setCount((c) => c - 1)} style={{ flex: 1 }}>
              -1
            </button>
            <button onClick={() => setCount(0)} style={{ flex: 1 }}>
              Reset
            </button>
            <button onClick={() => setCount((c) => c + 1)} style={{ flex: 1 }}>
              +1
            </button>
          </div>
        </div>

        <div className="card">
          <h3>Input Example</h3>
          <div className="form-group" style={{ marginTop: '1rem' }}>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
            />
          </div>
          <div style={{
            marginTop: '1rem',
            padding: '1rem',
            background: 'var(--bg-secondary)',
            borderRadius: '8px'
          }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Current:</strong>{' '}
              <code>{name || '(empty)'}</code>
            </div>
            <div>
              <strong>Previous:</strong>{' '}
              <code>{previousName ?? 'N/A'}</code>
            </div>
            {previousName !== undefined && previousName !== name && (
              <div style={{
                marginTop: '0.5rem',
                padding: '0.5rem',
                background: 'var(--success-color)',
                color: 'white',
                borderRadius: '4px',
                fontSize: '0.875rem'
              }}>
                ✨ Value changed!
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>💡 Usage</h3>
        <pre>
          <code>{`const [count, setCount] = useState(0)
const previousCount = usePrevious(count)

// Compare current and previous
if (previousCount !== undefined && count > previousCount) {
  console.log('Count increased!')
}`}</code>
        </pre>
      </div>
    </div>
  )
}

export default UsePreviousDemo

