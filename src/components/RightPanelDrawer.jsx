import React, { useEffect } from "react";

export default function RightPanelDrawer({ 
  isOpen, 
  onClose, 
  title, 
  children,
  width = "400px" 
}) {
  
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleEsc);
    }
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  return (
    <div className={`drawer-container ${isOpen ? "open" : ""}`} style={{ "--drawer-width": width }}>
      <div className="drawer-overlay" onClick={onClose} style={{ backdropFilter: 'blur(4px)' }} />
      
      <div className="drawer-content glass-premium premium-shadow" style={{ 
        borderLeft: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(13, 17, 23, 0.6)'
      }}>
        <div className="drawer-header" style={{ 
          padding: '24px 32px', 
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 800, letterSpacing: '-0.5px' }}>{title}</h3>
          <button className="drawer-close-btn flex-center" onClick={onClose} title="Close Panel" style={{ 
            width: '32px', 
            height: '32px', 
            borderRadius: '10px', 
            background: 'rgba(255,255,255,0.05)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            transition: 'var(--transition)'
          }}>
            ✕
          </button>
        </div>
        
        <div className="drawer-body" style={{ height: 'calc(100% - 80px)', overflow: 'hidden' }}>
          {children}
        </div>
      </div>
    </div>
  );
}

