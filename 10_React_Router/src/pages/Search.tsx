import { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'

const searchResults = [
  { id: 1, title: 'React Router Guide', category: 'Documentation' },
  { id: 2, title: 'TypeScript Tutorial', category: 'Tutorial' },
  { id: 3, title: 'React Hooks Explained', category: 'Article' },
  { id: 4, title: 'Router Best Practices', category: 'Documentation' },
]

function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const query = searchParams.get('q') || ''
  const category = searchParams.get('category') || 'all'

  const [searchTerm, setSearchTerm] = useState(query)

  useEffect(() => {
    setSearchTerm(query)
  }, [query])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearchParams({ q: searchTerm, category })
  }

  const handleCategoryChange = (newCategory: string) => {
    setSearchParams({ q: query, category: newCategory })
  }

  const filteredResults = searchResults.filter((result) => {
    const matchesQuery = result.title
      .toLowerCase()
      .includes(query.toLowerCase())
    const matchesCategory = category === 'all' || result.category === category
    return matchesQuery && matchesCategory
  })

  return (
    <div className="page">
      <h2>Search Page</h2>
      <p>
        This page demonstrates query parameters using{' '}
        <code>useSearchParams</code> hook.
      </p>
      <form onSubmit={handleSearch} className="search-form">
        <div className="search-input-wrapper">
          <span className="field-icon">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for articles, tutorials, documentation..."
          />
        </div>
        <div className="form-group" style={{ minWidth: '200px', margin: 0 }}>
          <label>
            <span className="label-icon">📂</span>
            Category
          </label>
          <select
            value={category}
            onChange={(e) => handleCategoryChange(e.target.value)}
          >
            <option value="all">📚 All Categories</option>
            <option value="Documentation">📖 Documentation</option>
            <option value="Tutorial">🎓 Tutorial</option>
            <option value="Article">📝 Article</option>
          </select>
        </div>
        <button type="submit" style={{ minWidth: '120px' }}>Search 🔍</button>
      </form>
      <div style={{ marginTop: '2.5rem' }}>
        <h3>📋 Search Results</h3>
        {query ? (
          filteredResults.length > 0 ? (
            <div style={{
              display: 'grid',
              gap: '1rem',
              marginTop: '1.5rem'
            }}>
              {filteredResults.map((result) => (
                <div
                  key={result.id}
                  className="card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '1.25rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(4px)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)'
                  }}
                >
                  <div style={{
                    fontSize: '1.5rem',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    borderRadius: '8px',
                    color: 'white'
                  }}>
                    {result.category === 'Documentation' ? '📖' :
                     result.category === 'Tutorial' ? '🎓' : '📝'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                      {result.title}
                    </strong>
                    <div style={{
                      marginTop: '0.25rem',
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)'
                    }}>
                      {result.category}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔍</div>
              <p style={{ fontSize: '1.125rem' }}>No results found.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                Try different keywords or categories.
              </p>
            </div>
          )
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '3rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔎</div>
            <p style={{ fontSize: '1.125rem' }}>Enter a search term to see results.</p>
          </div>
        )}
      </div>
      <div style={{ marginTop: '2rem', fontSize: '0.9rem', color: '#7f8c8d' }}>
        <p>
          <strong>Current URL:</strong> <code>{window.location.href}</code>
        </p>
        <p>
          <strong>Query params:</strong> q={query || '(empty)'}, category=
          {category}
        </p>
      </div>
    </div>
  )
}

export default Search

