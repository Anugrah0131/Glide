import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Register = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/video");
    }
  }, [user, navigate]);

  useEffect(() => {
    document.title = "Join Glide | Video Chat with Strangers";
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute("content", "Create an account on Glide and start high-quality video chats instantly.");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await register(username, email, password);
      if (data.success) {
        navigate("/video");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (err) {
      setError(err.normalizedMessage || "Failed to register. Please try again.");
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
            <h2>Create Account</h2>
            <p>Join thousands of users worldwide.</p>
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
              <label>Username</label>
              <div className="input-wrapper">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  placeholder="CoolUser123"
                />
              </div>
            </div>

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
                  minLength={6}
                  placeholder="••••••••"
                />
              </div>
              <span className="input-hint">Min. 6 characters</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="auth-btn-primary"
            >
              {loading ? <span className="loader-dots"><span></span><span></span><span></span></span> : "Create Account"}
            </button>
          </form>

          <div className="auth-footer-v2">
            <p>Already have an account? <Link to="/login">Sign In</Link></p>
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

export default Register;
