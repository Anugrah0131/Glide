import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Glide App Crash:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="auth-container flex-center">
          <div className="auth-card-v2 glass premium-shadow animate-fade-in" style={{ textAlign: 'center', maxWidth: '400px' }}>
            <div className="brand-logo" style={{ marginBottom: '32px' }}>!</div>
            <h2 style={{ fontSize: '24px', fontWeight: 800, color: 'white', marginBottom: '16px' }}>
              Oops! Something went wrong
            </h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: 1.6 }}>
              Glide encountered an unexpected error. Don't worry, your data is safe. Just reload to continue.
            </p>
            <button
              className="auth-btn-primary"
              style={{ width: '100%' }}
              onClick={() => window.location.reload()}
            >
              Reload Glide
            </button>
            <button 
              className="auth-btn-secondary"
              style={{ width: '100%', marginTop: '12px' }}
              onClick={() => window.location.href = '/'}
            >
              Back to Home
            </button>
          </div>
          
          <div className="auth-visual-bg">
            <div className="bg-shape shape-1" style={{ opacity: 0.1 }}></div>
            <div className="bg-shape shape-2" style={{ opacity: 0.1 }}></div>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;