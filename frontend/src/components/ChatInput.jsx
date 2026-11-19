import React, { useState, useRef, useEffect } from 'react';
import { Send, CornerDownLeft, Sparkles, X } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled, placeholder }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
    }
  }, [text]);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || disabled) return;

    onSendMessage(trimmed);
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = () => {
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.focus();
    }
  };

  return (
    <div className="chat-input-wrapper">
      <form className="chat-input-container" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ask any tech or development question (e.g. 'What is React?', 'FastAPI vs Flask', 'Explain Docker')..."}
          disabled={disabled}
          rows={1}
          className="chat-textarea"
          aria-label="Ask a question"
        />

        <div className="input-actions-row">
          {text.trim().length > 0 && (
            <button
              type="button"
              className="clear-input-btn"
              onClick={handleClear}
              title="Clear input"
              aria-label="Clear text"
            >
              <X size={14} />
            </button>
          )}

          <button
            type="submit"
            className="send-button"
            disabled={!text.trim() || disabled}
            title="Send question (Enter)"
            aria-label="Send question"
          >
            <Send size={16} />
          </button>
        </div>
      </form>

      <div className="input-footer-hint">
        <span>Press <kbd>Enter ↵</kbd> to send, <kbd>Shift + Enter</kbd> for newline</span>
        <span className="dot-divider">•</span>
        <span>Local TF-IDF Vectorization & Cosine Similarity</span>
      </div>
    </div>
  );
}
