import useMediaQuery from '../hooks/useMediaQuery'

function UseMediaQueryDemo() {
  const isMobile = useMediaQuery('(max-width: 640px)')
  const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1023px)')
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')
  const isHover = useMediaQuery('(hover: hover)')

  return (
    <div className="page">
      <h2>📱 useMediaQuery Hook</h2>
      <p>
        React to media query changes. This hook returns a boolean indicating
        whether the media query matches. Resize your browser or change system
        preferences to see updates.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem'
      }}>
        <div className="card">
          <h3>Device Size</h3>
          <div style={{ marginTop: '1rem' }}>
            <div style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              background: isMobile ? 'var(--success-color)' : 'var(--bg-secondary)',
              color: isMobile ? 'white' : 'var(--text-primary)',
              borderRadius: '8px',
              fontWeight: isMobile ? 600 : 400
            }}>
              📱 Mobile (max-width: 640px): {isMobile ? '✅ Yes' : '❌ No'}
            </div>
            <div style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              background: isTablet ? 'var(--success-color)' : 'var(--bg-secondary)',
              color: isTablet ? 'white' : 'var(--text-primary)',
              borderRadius: '8px',
              fontWeight: isTablet ? 600 : 400
            }}>
              📱 Tablet (641px - 1023px): {isTablet ? '✅ Yes' : '❌ No'}
            </div>
            <div style={{
              padding: '0.75rem',
              background: isDesktop ? 'var(--success-color)' : 'var(--bg-secondary)',
              color: isDesktop ? 'white' : 'var(--text-primary)',
              borderRadius: '8px',
              fontWeight: isDesktop ? 600 : 400
            }}>
              💻 Desktop (min-width: 1024px): {isDesktop ? '✅ Yes' : '❌ No'}
            </div>
          </div>
        </div>

        <div className="card">
          <h3>System Preferences</h3>
          <div style={{ marginTop: '1rem' }}>
            <div style={{
              padding: '0.75rem',
              marginBottom: '0.5rem',
              background: isDarkMode ? '#1f2937' : '#f9fafb',
              color: isDarkMode ? 'white' : 'black',
              borderRadius: '8px',
              fontWeight: 600
            }}>
              {isDarkMode ? '🌙' : '☀️'} Dark Mode Preference: {isDarkMode ? 'Yes' : 'No'}
            </div>
            <div style={{
              padding: '0.75rem',
              background: isHover ? 'var(--success-color)' : 'var(--bg-secondary)',
              color: isHover ? 'white' : 'var(--text-primary)',
              borderRadius: '8px',
              fontWeight: isHover ? 600 : 400
            }}>
              🖱️ Hover Support: {isHover ? '✅ Yes' : '❌ No'}
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>💡 Usage</h3>
        <pre>
          <code>{`const isMobile = useMediaQuery('(max-width: 640px)')
const isDarkMode = useMediaQuery('(prefers-color-scheme: dark)')

// Conditional rendering
{isMobile ? <MobileView /> : <DesktopView />}`}</code>
        </pre>
      </div>
    </div>
  )
}

export default UseMediaQueryDemo

