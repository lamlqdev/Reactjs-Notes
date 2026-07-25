import { useState, FormEvent } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  // Get the page user was trying to access before login
  const from = (location.state as { from?: Location })?.from?.pathname || '/dashboard'

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    // Simulate login
    setIsAuthenticated(true)
    localStorage.setItem('isAuthenticated', 'true')
    // Navigate to the page user was trying to access, or dashboard
    navigate(from, { replace: true })
  }

  if (isAuthenticated) {
    return (
      <div className="page">
        <div className="success">
          <h2>Login Successful!</h2>
          <p>Redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 1rem',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '2.5rem',
          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)'
        }}>
          🔐
        </div>
        <h2>Welcome Back</h2>
        <p style={{ color: 'var(--text-secondary)' }}>
          This page demonstrates protected routes. After logging in, you'll be
          redirected to the page you were trying to access.
        </p>
      </div>

      {from !== '/dashboard' && (
        <div style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%)',
          borderLeft: '4px solid #f59e0b',
          borderRadius: '8px',
          marginBottom: '1.5rem'
        }}>
          <p style={{ margin: 0, color: '#92400e' }}>
            <strong>⚠️ Authentication Required</strong><br />
            You need to login to access: <code style={{ background: 'rgba(0,0,0,0.1)' }}>{from}</code>
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Username</label>
          <div className="form-field-wrapper">
            <span className="field-icon">👤</span>
            <input
              type="text"
              defaultValue="admin"
              placeholder="Enter your username"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Password</label>
          <div className="form-field-wrapper">
            <span className="field-icon">🔒</span>
            <input
              type="password"
              defaultValue="password"
              placeholder="Enter your password"
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" style={{ width: '100%' }}>
            Login → 
          </button>
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
        <strong>💡 Demo Note:</strong> This is a demo. Use any credentials to login.
        The authentication state is stored in localStorage.
      </div>
    </div>
  )
}

export default Login

