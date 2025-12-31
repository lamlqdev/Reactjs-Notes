import { Link, useNavigate } from 'react-router-dom'

function NotFound() {
  const navigate = useNavigate()

  return (
    <div className="page">
      <div className="error">
        <h2>404 - Page Not Found</h2>
        <p>The page you're looking for doesn't exist.</p>
      </div>
      <div style={{ marginTop: '2rem' }}>
        <button onClick={() => navigate(-1)} style={{ marginRight: '1rem' }}>
          Go Back
        </button>
        <Link to="/">
          <button>Go to Home</button>
        </Link>
      </div>
      <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
        <strong>Note:</strong> This is the catch-all route (<code>path="*"</code>
        ) that matches any route not defined above.
      </p>
    </div>
  )
}

export default NotFound

