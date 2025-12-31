import { Link } from 'react-router-dom'

interface User {
  id: number
  name: string
  email: string
}

const users: User[] = [
  { id: 1, name: 'John Doe', email: 'john@example.com' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com' },
]

function Users() {
  return (
    <div className="page">
      <h2>Users Page</h2>
      <p>
        This page demonstrates nested routes. Click on a user to see their
        profile with nested routes for posts and settings.
      </p>
      <div style={{ 
        marginTop: '2rem',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1.5rem'
      }}>
        {users.map((user, index) => (
          <div key={user.id} className="card" style={{ 
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '2rem'
          }}>
            <div style={{ 
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: `linear-gradient(135deg, ${
                index === 0 ? '#667eea, #764ba2' :
                index === 1 ? '#f093fb, #f5576c' :
                '#4facfe, #00f2fe'
              })`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              marginBottom: '1rem',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
            }}>
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h3 style={{ marginBottom: '0.5rem' }}>
              <Link 
                to={`/users/${user.id}`}
                style={{ 
                  color: 'inherit',
                  textDecoration: 'none',
                  transition: 'color 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--primary-color)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'inherit'}
              >
                {user.name}
              </Link>
            </h3>
            <p style={{ 
              color: 'var(--text-secondary)',
              marginBottom: '1.5rem',
              fontSize: '0.9375rem'
            }}>
              {user.email}
            </p>
            <Link to={`/users/${user.id}`} style={{ width: '100%' }}>
              <button style={{ width: '100%' }}>View Profile →</button>
            </Link>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Users

