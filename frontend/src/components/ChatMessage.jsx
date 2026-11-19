import React, { useState } from 'react';
import { Bot, User, Copy, Check, ThumbsUp, ThumbsDown, Sparkles, HelpCircle, ArrowRight } from 'lucide-react';

export default function ChatMessage({ message, onSelectQuestion }) {
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null); // 'helpful' | 'unhelpful' | null

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

  // Score styling logic
  const getScoreBadgeClass = (score) => {
    if (score >= 0.8) return 'score-high';
    if (score >= 0.55) return 'score-medium';
    if (score >= 0.32) return 'score-fair';
    return 'score-low';
  };

  return (
    <div className={`chat-message-row ${isUser ? 'user-row' : 'bot-row'}`}>
      <div className="message-avatar-wrapper">
        {isUser ? (
          <div className="avatar user-avatar" title="You">
            <User size={18} />
          </div>
        ) : (
          <div className="avatar bot-avatar" title="IntelliFAQ Bot">
            <Bot size={18} />
          </div>
        )}
      </div>

      <div className="message-content-container">
        <div className="message-meta-header">
          <span className="sender-name">{isUser ? 'You' : 'IntelliFAQ Assistant'}</span>
          <span className="message-time">{message.timestamp || 'Just now'}</span>
        </div>

        <div className={`message-bubble ${isUser ? 'user-bubble' : 'bot-bubble'} ${message.isError ? 'error-bubble' : ''}`}>
          <div className="message-text">
            {message.text.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          {/* Bot Metadata Card: Matched Question & NLP Similarity Score */}
          {isBot && message.similarityScore !== undefined && message.similarityScore > 0 && (
            <div className="nlp-metrics-card">
              <div className="metrics-row">
                {message.matchedQuestion && (
                  <div className="metric-item matched-faq">
                    <span className="metric-label">Matched FAQ:</span>
                    <span className="metric-value">"{message.matchedQuestion}"</span>
                  </div>
                )}

                <div className="metric-item confidence-item">
                  <span className="metric-label">Similarity Match:</span>
                  <span className={`score-badge ${getScoreBadgeClass(message.similarityScore)}`}>
                    {(message.similarityScore * 100).toFixed(1)}%
                  </span>
                  {message.confidenceLabel && (
                    <span className="confidence-label">({message.confidenceLabel})</span>
                  )}
                </div>
              </div>

              <div className="metric-disclaimer" title="Similarity explanation">
                <HelpCircle size={12} className="info-icon" />
                <span>Textual similarity via TF-IDF & Cosine Similarity. Represents phrasing alignment, not factual certainty.</span>
              </div>
            </div>
          )}

          {/* Related Questions Pills */}
          {isBot && message.relatedQuestions && message.relatedQuestions.length > 0 && (
            <div className="related-questions-wrapper">
              <div className="related-title">
                <Sparkles size={13} />
                <span>Related questions you might find helpful:</span>
              </div>
              <div className="related-chips">
                {message.relatedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    className="related-chip"
                    onClick={() => onSelectQuestion(q)}
                    title={`Ask: "${q}"`}
                  >
                    <span>{q}</span>
                    <ArrowRight size={12} className="chip-arrow" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Toolbar for Bot Responses */}
        {isBot && !message.isError && (
          <div className="message-actions-toolbar">
            <button
              className={`action-pill ${copied ? 'action-active' : ''}`}
              onClick={handleCopy}
              title="Copy response to clipboard"
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <div className="feedback-group">
              <button
                className={`action-pill ${feedback === 'helpful' ? 'action-active helpful' : ''}`}
                onClick={() => handleFeedback('helpful')}
                title="Mark as helpful"
              >
                <ThumbsUp size={13} />
                <span>Helpful</span>
              </button>
              <button
                className={`action-pill ${feedback === 'unhelpful' ? 'action-active unhelpful' : ''}`}
                onClick={() => handleFeedback('unhelpful')}
                title="Mark as not helpful"
              >
                <ThumbsDown size={13} />
                <span>Not Helpful</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
