
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Simple Error Boundary Fallback
const ErrorFallback = () => (
  <div style={{
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#050505',
    color: 'white',
    fontFamily: 'sans-serif'
  }}>
    <h1 style={{ color: '#ef4444' }}>Application Error</h1>
    <p>The application encountered a critical runtime error.</p>
    <button
      onClick={() => window.location.reload()}
      style={{
        marginTop: '1rem',
        padding: '0.5rem 1rem',
        background: '#8B4513',
        border: 'none',
        color: 'white',
        borderRadius: '4px',
        cursor: 'pointer'
      }}
    >
      Reload Application
    </button>
  </div>
);

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error("Critical: Could not find root element '#root'");
} else {
  try {
    const root = ReactDOM.createRoot(rootElement);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log("App mounted successfully.");
  } catch (err) {
    console.error("Mount error:", err);
    const root = ReactDOM.createRoot(rootElement);
    root.render(<ErrorFallback />);
  }
}