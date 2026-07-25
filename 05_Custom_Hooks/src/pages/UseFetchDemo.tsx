import { useState } from 'react'
import useFetch from '../hooks/useFetch'

interface User {
  id: number
  name: string
  email: string
  phone: string
}

function UseFetchDemo() {
  const [userId, setUserId] = useState(1)
  const { data, loading, error, refetch } = useFetch<User>(
    `https://jsonplaceholder.typicode.com/users/${userId}`,
    { skip: false }
  )

  return (
    <div className="page">
      <h2>🌐 useFetch Hook</h2>
      <p>
        Fetch data from APIs with built-in loading and error states. This hook
        handles the common pattern of fetching data, managing loading states,
        and handling errors.
      </p>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>User Data Fetching</h3>
        <div style={{ marginTop: '1.5rem' }}>
          <label>User ID (1-10):</label>
          <input
            type="number"
            min="1"
            max="10"
            value={userId}
            onChange={(e) => setUserId(parseInt(e.target.value) || 1)}
            style={{ marginTop: '0.5rem', marginBottom: '1rem' }}
          />
          <button onClick={refetch} style={{ marginLeft: '0.5rem' }}>
            🔄 Refetch
          </button>
        </div>

        {loading && (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>⏳</div>
            Loading...
          </div>
        )}

        {error && (
          <div className="error" style={{ marginTop: '1rem' }}>
            <strong>Error:</strong> {error.message}
          </div>
        )}

        {data && !loading && (
          <div style={{
            marginTop: '1rem',
            padding: '1.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: '8px'
          }}>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>Name:</strong> {data.name}
            </div>
            <div style={{ marginBottom: '0.75rem' }}>
              <strong>Email:</strong> {data.email}
            </div>
            <div>
              <strong>Phone:</strong> {data.phone}
            </div>
          </div>
        )}
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>💡 Usage</h3>
        <pre>
          <code>{`const { data, loading, error, refetch } = useFetch<User>(
  'https://api.example.com/users/1'
)

if (loading) return <Spinner />
if (error) return <Error message={error.message} />
return <div>{data.name}</div>`}</code>
        </pre>
      </div>
    </div>
  )
}

export default UseFetchDemo

