import React from 'react';
import { Bot, Plus, Moon, Sun, Info, Menu, Sparkles } from 'lucide-react';

export default function Header({
  isDark,
  onToggleTheme,
  onNewChat,
  onToggleSidebar,
  onOpenAbout,
  backendStatus
}) {
  const isHealthy = backendStatus === 'healthy';

  return (
    <header className="chat-header">
      <div className="header-left">
        <button
          className="icon-button mobile-only"
          onClick={onToggleSidebar}
          aria-label="Toggle sidebar"
          title="Toggle FAQ & History Sidebar"
        >
          <Menu size={20} />
        </button>

        <div className="brand-logo" onClick={onNewChat} role="button" tabIndex={0}>
          <div className="logo-icon-wrapper">
            <Bot size={22} className="logo-icon" />
            <Sparkles size={12} className="sparkle-badge" />
          </div>
          <div className="brand-text">
            <div className="brand-title-row">
              <span className="brand-name">IntelliFAQ</span>
              <span className="brand-badge">CodeAlpha Task 2</span>
            </div>
            <span className="brand-tagline">Your Intelligent FAQ Assistant</span>
          </div>
        </div>

        <div className="status-indicator-pill" title={`NLP Engine: ${backendStatus}`}>
          <span className={`status-dot ${isHealthy ? 'status-online' : 'status-warning'}`} />
          <span className="status-label">
            {isHealthy ? 'NLP Engine Active' : 'Connecting Engine...'}
          </span>
        </div>
      </div>

      <div className="header-right">
        <button
          className="action-button new-chat-btn"
          onClick={onNewChat}
          title="Start a new conversation"
        >
          <Plus size={16} />
          <span className="btn-text">New Chat</span>
        </button>

        <button
          className="icon-button"
          onClick={onOpenAbout}
          title="About IntelliFAQ & NLP Pipeline"
          aria-label="About"
        >
          <Info size={19} />
        </button>

        <button
          className="icon-button theme-toggle-btn"
          onClick={onToggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={19} /> : <Moon size={19} />}
        </button>
      </div>
    </header>
  );
}
