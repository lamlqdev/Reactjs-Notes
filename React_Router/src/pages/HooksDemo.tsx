import { useNavigate, useParams, useLocation, useSearchParams } from 'react-router-dom'

function HooksDemo() {
  const navigate = useNavigate()
  const params = useParams()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  return (
    <div className="page">
      <h2>React Router Hooks Demo</h2>
      <p>
        This page demonstrates all the navigation hooks provided by React
        Router.
      </p>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>useNavigate Hook</h3>
        <p>
          <code>useNavigate</code> returns a function that lets you navigate
          programmatically.
        </p>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/')}>Navigate to Home</button>
          <button onClick={() => navigate('/products')}>
            Navigate to Products
          </button>
          <button onClick={() => navigate(-1)}>Go Back</button>
          <button onClick={() => navigate(1)}>Go Forward</button>
          <button onClick={() => navigate('/products/1', { replace: true })}>
            Navigate with Replace
          </button>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>useParams Hook</h3>
        <p>
          <code>useParams</code> returns an object of key/value pairs of URL
          parameters.
        </p>
        <p>
          <strong>Current params:</strong>
        </p>
        <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px' }}>
          {JSON.stringify(params, null, 2)}
        </pre>
        <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
          Try navigating to <code>/products/1</code> or <code>/users/2</code>{' '}
          to see params change.
        </p>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>useLocation Hook</h3>
        <p>
          <code>useLocation</code> returns the current location object, which
          represents where the app is now.
        </p>
        <p>
          <strong>Location object:</strong>
        </p>
        <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px' }}>
          {JSON.stringify(
            {
              pathname: location.pathname,
              search: location.search,
              hash: location.hash,
              state: location.state,
            },
            null,
            2
          )}
        </pre>
      </div>

      <div className="card" style={{ marginTop: '1rem' }}>
        <h3>useSearchParams Hook</h3>
        <p>
          <code>useSearchParams</code> is used to read and modify the query
          string in the URL.
        </p>
        <p>
          <strong>Current search params:</strong>
        </p>
        <pre style={{ background: '#f4f4f4', padding: '1rem', borderRadius: '4px' }}>
          {JSON.stringify(
            Object.fromEntries(searchParams.entries()),
            null,
            2
          )}
        </pre>
        <p style={{ fontSize: '0.9rem', color: '#7f8c8d', marginTop: '0.5rem' }}>
          Try navigating to <code>/search?q=react&category=tutorial</code> to
          see search params.
        </p>
      </div>
    </div>
  )
}

export default HooksDemo

