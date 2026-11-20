import React from 'react';
import { Bot, Plus, Moon, Sun, Info, PanelLeft, Download } from 'lucide-react';

export default function Header({
  isDark,
  onToggleTheme,
  onNewChat,
  onToggleSidebar,
  sidebarOpen,
  onOpenAbout,
  onExportChat,
  hasMessages,
  backendStatus
}) {
  const isHealthy = backendStatus === 'healthy';

  return (
    <header className="site-header">
      <div className="header-start">
        <button
          className="ghost-btn sidebar-toggle"
          onClick={onToggleSidebar}
          title={sidebarOpen ? "Hide sidebar" : "Show sidebar"}
          aria-label="Toggle sidebar"
        >
          <PanelLeft size={18} />
        </button>

        <div className="brand" onClick={onNewChat} role="button" tabIndex={0}>
          <div className="brand-icon">
            <Bot size={18} />
          </div>
          <span className="brand-title">IntelliFAQ</span>
        </div>

        <div className="status-indicator" title={`NLP Engine: ${backendStatus}`}>
          <span className={`status-dot ${isHealthy ? 'is-live' : 'is-off'}`} />
          <span className="status-text">{isHealthy ? 'Active' : 'Offline'}</span>
        </div>
      </div>

      <div className="header-end">
        {hasMessages && onExportChat && (
          <button
            className="ghost-btn"
            onClick={onExportChat}
            title="Export conversation (.md)"
            aria-label="Export chat"
          >
            <Download size={16} />
          </button>
        )}

        <button
          className="new-chat-compact-btn"
          onClick={onNewChat}
          title="New conversation"
        >
          <Plus size={15} />
          <span>New Chat</span>
        </button>

        <button
          className="ghost-btn"
          onClick={onOpenAbout}
          title="About NLP Model"
          aria-label="About"
        >
          <Info size={16} />
        </button>

        <button
          className="ghost-btn theme-btn"
          onClick={onToggleTheme}
          title={`Switch to ${isDark ? 'Light' : 'Dark'} mode`}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>
    </header>
  );
}
