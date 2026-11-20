import React, { useState } from 'react';
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, Sparkles, ArrowRight, Target, Info } from 'lucide-react';

export default function ChatMessage({ message, onSelectQuestion }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [showScoreInfo, setShowScoreInfo] = useState(false);

  const isUser = message.sender === 'user';
  const isBot = message.sender === 'bot';

  const handleCopy = () => {
    if (message.text) {
      navigator.clipboard.writeText(message.text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFeedback = (type) => {
    setFeedback((prev) => (prev === type ? null : type));
  };

  const score = message.similarityScore !== undefined ? message.similarityScore : 0;
  const scorePercent = (score * 100).toFixed(0);

  return (
    <div className={`message-item ${isUser ? 'is-user' : 'is-bot'}`}>
      <div className="message-avatar">
        {isUser ? <User size={16} /> : <Bot size={16} />}
      </div>

      <div className="message-body">
        {/* Top meta row */}
        <div className="message-header-line">
          <span className="author-name">{isUser ? 'You' : 'IntelliFAQ'}</span>
          <span className="timestamp">{message.timestamp || 'Just now'}</span>

          {isBot && score > 0 && (
            <div 
              className="match-badge" 
              onClick={() => setShowScoreInfo(!showScoreInfo)}
              title="Click to toggle matching details"
            >
              <Target size={12} className="badge-icon" />
              <span>{scorePercent}% match</span>
            </div>
          )}
        </div>

        {/* Message bubble */}
        <div className={`bubble ${isUser ? 'user-bubble' : 'bot-bubble'} ${message.isError ? 'is-error' : ''}`}>
          <div className="text-content">
            {message.text.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Clean minimal match info (toggleable or subtle) */}
          {isBot && score > 0 && showScoreInfo && (
            <div className="clean-match-drawer">
              <div className="drawer-item">
                <span className="drawer-label">Matched FAQ:</span>
                <span className="drawer-val">"{message.matchedQuestion}"</span>
              </div>
              <div className="drawer-item">
                <span className="drawer-label">Score:</span>
                <span className="drawer-val">{score.toFixed(4)} ({message.confidenceLabel})</span>
              </div>
              <div className="drawer-note">
                <Info size={11} />
                <span>Textual similarity via TF-IDF & Cosine Similarity.</span>
              </div>
            </div>
          )}

          {/* Clean related question chips */}
          {isBot && message.relatedQuestions && message.relatedQuestions.length > 0 && (
            <div className="clean-related-section">
              <div className="related-lead">
                <Sparkles size={12} />
                <span>Related topics</span>
              </div>
              <div className="related-pills">
                {message.relatedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    className="related-pill"
                    onClick={() => onSelectQuestion(q)}
                    title={`Ask: "${q}"`}
                  >
                    <span>{q}</span>
                    <ArrowRight size={11} className="pill-arrow" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clean action buttons below bot message */}
        {isBot && !message.isError && (
          <div className="bot-actions-row">
            <button
              className={`action-btn ${copied ? 'active' : ''}`}
              onClick={handleCopy}
              title="Copy answer"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              className={`action-btn ${feedback === 'helpful' ? 'active' : ''}`}
              onClick={() => handleFeedback('helpful')}
              title="Helpful"
            >
              <ThumbsUp size={13} />
            </button>

            <button
              className={`action-btn ${feedback === 'unhelpful' ? 'active' : ''}`}
              onClick={() => handleFeedback('unhelpful')}
              title="Not helpful"
            >
              <ThumbsDown size={13} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
