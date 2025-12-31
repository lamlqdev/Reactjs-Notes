import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

function Contact() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setSubmitted(true)
    setTimeout(() => {
      navigate('/')
    }, 2000)
  }

  if (submitted) {
    return (
      <div className="page">
        <div className="success">
          <h2>Thank you for your message!</h2>
          <p>We'll get back to you soon. Redirecting to home...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page">
      <h2>📧 Contact Us</h2>
      <p>This page demonstrates form submission with navigation.</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <div className="form-field-wrapper">
            <span className="field-icon">👤</span>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Enter your name"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email</label>
          <div className="form-field-wrapper">
            <span className="field-icon">✉️</span>
            <input
              type="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              placeholder="your.email@example.com"
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Message</label>
          <div className="form-field-wrapper">
            <span className="field-icon" style={{ top: '1.25rem' }}>💬</span>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              placeholder="Tell us what's on your mind..."
              required
            />
          </div>
        </div>

        <div className="form-actions">
          <button type="submit">Send Message ✈️</button>
        </div>
      </form>
    </div>
  )
}

export default Contact

