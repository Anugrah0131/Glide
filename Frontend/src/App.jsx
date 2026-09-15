import React from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";

import Navbar from "./components/layout/Navbar";
import VideoChat from "./pages/VideoChat";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProtectedRoute from "./components/common/ProtectedRoute";
import ErrorBoundary from "./components/common/ErrorBoundary";
import { useAuth } from "./hooks/useAuth";

import "./App.css";

function App() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const isVideoChat = location.pathname === "/video" || location.pathname === "/";

  if (loading) {
    return (
      <div className="app-loader-container flex-center">
        <div className="premium-loader-v2">
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
          <div className="loader-ring"></div>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="app-bg" style={{ height: '100%' }}>
        {!isVideoChat && <Navbar />}

        <main className={isVideoChat ? "immersive-container" : "main-container"}>
          <Routes>
            <Route 
              path="/" 
              element={user ? <Navigate to="/video" /> : <Navigate to="/login" />} 
            />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <Messages />
                </ProtectedRoute>
              }
            />
            
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            <Route
              path="/video"
              element={
                <ProtectedRoute>
                  <VideoChat />
                </ProtectedRoute>
              }
            />
            
            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;