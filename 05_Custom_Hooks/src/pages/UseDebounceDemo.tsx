import { useState } from 'react'
import useDebounce from '../hooks/useDebounce'

function UseDebounceDemo() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearchTerm = useDebounce(searchTerm, 500)

  return (
    <div className="page">
      <h2>⏱️ useDebounce Hook</h2>
      <p>
        This hook delays updating a value until after a specified delay. Useful
        for search inputs, API calls, and reducing unnecessary re-renders.
      </p>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Search Demo</h3>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Type in the search box. Notice how the debounced value updates 500ms
          after you stop typing.
        </p>

        <div className="form-group">
          <label>Search Input</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Type to search..."
          />
        </div>

        <div style={{
          marginTop: '1.5rem',
          padding: '1rem',
          background: 'var(--bg-secondary)',
          borderRadius: '8px'
        }}>
          <div style={{ marginBottom: '0.5rem' }}>
            <strong>Current value:</strong>{' '}
            <code style={{ color: 'var(--primary-color)' }}>
              {searchTerm || '(empty)'}
            </code>
          </div>
          <div>
            <strong>Debounced value (500ms):</strong>{' '}
            <code style={{ color: 'var(--success-color)' }}>
              {debouncedSearchTerm || '(empty)'}
            </code>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>💡 Usage</h3>
        <pre>
          <code>{`const [searchTerm, setSearchTerm] = useState('')
const debouncedSearchTerm = useDebounce(searchTerm, 500)

// debouncedSearchTerm updates 500ms after searchTerm stops changing`}</code>
        </pre>
      </div>
    </div>
  )
}

export default UseDebounceDemo

