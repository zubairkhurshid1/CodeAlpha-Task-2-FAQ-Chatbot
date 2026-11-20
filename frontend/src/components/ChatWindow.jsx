import React, { useEffect, useRef, useState } from 'react';
import ChatMessage from './ChatMessage';
import Suggestions from './Suggestions';
import { Bot, Sparkles, ArrowDown, AlertCircle, RefreshCw } from 'lucide-react';

export default function ChatWindow({
  messages,
  loading,
  error,
  onRetry,
  suggestions,
  onSelectQuestion,
  onRefreshSuggestions,
  suggestionsLoading
}) {
  const scrollRef = useRef(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  // Auto-scroll on new message or loading change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages, loading]);

  // Track scroll position to show/hide "scroll to bottom" button
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    const isUp = scrollHeight - scrollTop - clientHeight > 160;
    setShowScrollBottom(isUp);
  };

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

  const isEmpty = !messages || messages.length === 0;

  return (
    <div className="chat-window-container" ref={scrollRef} onScroll={handleScroll}>
      {isEmpty ? (
        <div className="welcome-screen">
          <div className="welcome-hero-card">
            <div className="hero-icon-bubble">
              <Bot size={36} className="hero-bot-icon" />
              <Sparkles size={18} className="hero-sparkle" />
            </div>
            <h1 className="welcome-title">Welcome to IntelliFAQ</h1>
            <p className="welcome-subtitle">
              Your Intelligent Technology & Software Development FAQ Assistant
            </p>
            <p className="welcome-description">
              Ask questions in natural language. IntelliFAQ uses a local <strong>Natural Language Processing (NLP)</strong> pipeline including text preprocessing, <strong>TF-IDF Vectorization</strong>, and <strong>Cosine Similarity</strong>to match your question against an indexed tech knowledge base with zero external paid APIs.
            </p>
          </div>

          <div className="welcome-suggestions-wrapper">
            <Suggestions
              suggestions={suggestions}
              onSelectQuestion={onSelectQuestion}
              onRefresh={onRefreshSuggestions}
              loading={suggestionsLoading}
            />
          </div>
        </div>
      ) : (
        <div className="messages-stream">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg}
              onSelectQuestion={onSelectQuestion}
            />
          ))}

          {/* Typing indicator when model is analyzing */}
          {loading && (
            <div className="message-item is-bot typing-item">
              <div className="message-avatar">
                <Bot size={16} />
              </div>
              <div className="message-body">
                <div className="message-header-line">
                  <span className="author-name">IntelliFAQ</span>
                  <span className="timestamp">Analyzing query...</span>
                </div>
                <div className="bubble bot-bubble typing-bubble">
                  <div className="typing-dots">
                    <span className="dot dot-1" />
                    <span className="dot dot-2" />
                    <span className="dot dot-3" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="chat-error-banner">
              <AlertCircle size={18} className="error-icon" />
              <div className="error-text-content">
                <strong>Connection Error:</strong> {error}
              </div>
              {onRetry && (
                <button className="error-retry-btn" onClick={onRetry}>
                  <RefreshCw size={13} />
                  <span>Retry</span>
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Floating Scroll to Bottom Button */}
      {showScrollBottom && (
        <button
          className="scroll-bottom-btn"
          onClick={scrollToBottom}
          title="Scroll to bottom"
          aria-label="Scroll to latest messages"
        >
          <ArrowDown size={16} />
        </button>
      )}
    </div>
  );
}
