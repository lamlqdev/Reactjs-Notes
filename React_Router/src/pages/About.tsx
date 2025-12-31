function About() {
  return (
    <div className="page">
      <h2>About Page</h2>
      <p>
        This is a comprehensive demo of React Router v6 features with
        TypeScript.
      </p>
      <p>
        React Router is a powerful routing library for React applications that
        enables client-side routing, allowing you to create single-page
        applications (SPAs) with multiple views.
      </p>
      <div style={{ marginTop: '2rem' }}>
        <h3>Features Demonstrated:</h3>
        <ul>
          <li>Basic routing with Routes and Route</li>
          <li>Navigation with Link and NavLink</li>
          <li>Dynamic routes with URL parameters</li>
          <li>Nested routes</li>
          <li>Protected routes</li>
          <li>Navigation hooks (useNavigate, useParams, useLocation, etc.)</li>
          <li>Query parameters</li>
          <li>Programmatic navigation</li>
        </ul>
      </div>
    </div>
  )
}

export default About

