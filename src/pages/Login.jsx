import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, guestLogin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/video");
    }
  }, [user, navigate]);

  useEffect(() => {
    document.title = "Login | Glide Video Chat";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Sign in to Glide to connect with people around the world.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await login(email, password);
      if (data.success) {
        navigate("/video");
      } else {
        setError(data.message || "Invalid credentials");
      }
    } catch (err) {
      setError(err.normalizedMessage || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    if (loading) return;
    setLoading(true);
    setError("");
    try {
      await guestLogin();
      navigate("/video");
    } catch (err) {
      setError(err.normalizedMessage || "Failed to start guest session.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-content">
        <div className="auth-brand">
          <div className="brand-logo">G</div>
          <h1>GLIDE</h1>
        </div>

        <div className="auth-card-v2 glass premium-shadow">
          <div className="auth-card-header">
            <h2>Welcome Back</h2>
            <p>Connect with the world in one click.</p>
          </div>

          {error && (
            <div className="auth-error-v2 animate-shake">
              <span className="error-icon">⚠️</span>
              <span className="error-text">{error}</span>
              <button className="error-close" onClick={() => setError("")}>×</button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form-v2">
            <div className="input-group-v2">
              <label>Email Address</label>
              <div className="input-wrapper">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                />
              </div>
            </div>
            
            <div className="input-group-v2">
              <label>Password</label>
              <div className="input-wrapper">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading ? <span className="loader-dots"><span></span><span></span><span></span></span> : "Sign In"}
            </button>
          </form>

          <div className="auth-divider">
            <span>or continue with</span>
          </div>

          <button
            onClick={handleGuestLogin}
            disabled={loading}
            className="auth-btn-secondary"
          >
            {loading ? "Initializing..." : "Explore as Guest"}
          </button>

          <div className="auth-footer-v2">
            <p>New to Glide? <Link to="/register">Create an account</Link></p>
          </div>
        </div>
      </div>
      
      <div className="auth-visual-bg">
        <div className="bg-shape shape-1"></div>
        <div className="bg-shape shape-2"></div>
        <div className="bg-shape shape-3"></div>
      </div>
    </div>
  );
};

export default Login;