import React, { useState, useRef, useEffect } from 'react';
import { ArrowUp, X } from 'lucide-react';

export default function ChatInput({ onSendMessage, disabled, placeholder }) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
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
    <div className="input-zone">
      <form className="input-card" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Ask any tech or development question (e.g. 'What is React?', 'FastAPI vs Flask')..."}
          disabled={disabled}
          rows={1}
          className="input-textarea"
          aria-label="Ask a question"
        />

        <div className="input-btn-group">
          {text.trim().length > 0 && (
            <button
              type="button"
              className="clear-btn"
              onClick={handleClear}
              title="Clear"
              aria-label="Clear text"
            >
              <X size={14} />
            </button>
          )}

          <button
            type="submit"
            className="submit-send-btn"
            disabled={!text.trim() || disabled}
            title="Send (Enter)"
            aria-label="Send"
          >
            <ArrowUp size={16} />
          </button>
        </div>
      </form>

      <div className="input-subtext">
        <span>Press Enter to send • Shift + Enter for newline</span>
      </div>
    </div>
  );
}
