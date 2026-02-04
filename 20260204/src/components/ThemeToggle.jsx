import React, { useState, useEffect } from 'react'

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light')

  useEffect(() => {
    // Sync body data attribute so CSS can handle background & color
    document.body.dataset.theme = theme
  }, [theme])

  const toggle = () => setTheme((t) => (t === 'light' ? 'dark' : 'light'))

  // Styles moved to CSS classes: .theme-card, .theme-toggle-btn, .child-card
  // This keeps styling consistent and enables smooth theme transitions via CSS.

  return (
    <div className={`theme-card ${theme}`}>
      <header className="theme-header">
        <h1 className="title">Theme Toggle App</h1>
        <div>
          <button
            onClick={toggle}
            aria-pressed={theme === 'dark'}
            aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            title={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
            className={`theme-toggle-btn ${theme}`}>
            {theme === 'light' ? (
              // Moon icon (indicates switch to dark)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" fill="currentColor" />
              </svg>
            ) : (
              // Sun icon (indicates switch to light)
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="12" cy="12" r="3" fill="currentColor" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>
      </header>

      <section style={{ marginTop: '1rem' }}>
        <p>
          Current theme: <strong>{theme}</strong>
        </p>

        {/* Conditional rendering based on theme */}
        {theme === 'dark' ? (
          <div style={{ marginTop: 8 }}>
            <p>Dark mode is active — reduced glare and a sleek look 🌙</p>
          </div>
        ) : (
          <div style={{ marginTop: 8 }}>
            <p>Light mode is active — bright and clear ☀️</p>
          </div>
        )}

        <hr style={{ margin: '1.25rem 0' }} />
      </section>
    </div>
  )
}
