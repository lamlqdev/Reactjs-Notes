import { useState } from 'react'
import useLocalStorage from '../hooks/useLocalStorage'

function UseLocalStorageDemo() {
  const [name, setName] = useLocalStorage<string>('user-name', '')
  const [age, setAge] = useLocalStorage<number>('user-age', 0)
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light')
  const [inputName, setInputName] = useState(name)
  const [inputAge, setInputAge] = useState(age.toString())

  const handleNameChange = (value: string) => {
    setInputName(value)
    setName(value)
  }

  const handleAgeChange = (value: string) => {
    const numValue = parseInt(value) || 0
    setInputAge(value)
    setAge(numValue)
  }

  const clearStorage = () => {
    setName('')
    setAge(0)
    setTheme('light')
    setInputName('')
    setInputAge('0')
    localStorage.removeItem('user-name')
    localStorage.removeItem('user-age')
    localStorage.removeItem('theme')
  }

  return (
    <div className="page">
      <h2>💾 useLocalStorage Hook</h2>
      <p>
        This hook synchronizes state with localStorage, automatically saving and
        loading values. Refresh the page to see the values persist!
      </p>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h3>Demo</h3>
        <form style={{ marginTop: '1.5rem' }}>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={inputName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Enter your name"
            />
            <small>Stored value: <code>{name || '(empty)'}</code></small>
          </div>

          <div className="form-group">
            <label>Age</label>
            <input
              type="number"
              value={inputAge}
              onChange={(e) => handleAgeChange(e.target.value)}
              placeholder="Enter your age"
            />
            <small>Stored value: <code>{age || 0}</code></small>
          </div>

          <div className="form-group">
            <label>Theme</label>
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value as 'light' | 'dark')}
            >
              <option value="light">☀️ Light</option>
              <option value="dark">🌙 Dark</option>
            </select>
            <small>Current theme: <code>{theme}</code></small>
          </div>

          <div className="form-actions">
            <button type="button" onClick={clearStorage}>
              🗑️ Clear All Storage
            </button>
          </div>
        </form>
      </div>

      <div className="card" style={{ marginTop: '1.5rem' }}>
        <h3>💡 Usage</h3>
        <pre>
          <code>{`const [value, setValue] = useLocalStorage('key', initialValue)

// Use like useState
setValue('new value')
setValue(prev => prev + 1)`}</code>
        </pre>
      </div>
    </div>
  )
}

export default UseLocalStorageDemo

