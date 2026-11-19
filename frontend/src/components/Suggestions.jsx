import React from 'react';
import { HelpCircle, RefreshCw, MessageSquare, Terminal, Cpu, Database } from 'lucide-react';

const CATEGORY_ICONS = {
  'Frontend Development': Terminal,
  'Backend Development': Database,
  'Artificial Intelligence': Cpu,
  'DevOps & Cloud': ServerIcon,
  'Programming Languages': MessageSquare,
  'default': HelpCircle
};

function ServerIcon(props) {
  return (
    <svg width={props.size || 16} height={props.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={props.className}>
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
      <line x1="6" y1="6" x2="6.01" y2="6"></line>
      <line x1="6" y1="18" x2="6.01" y2="18"></line>
    </svg>
  );
}

export default function Suggestions({ suggestions, onSelectQuestion, onRefresh, loading }) {
  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  return (
    <div className="suggestions-container">
      <div className="suggestions-header">
        <div className="suggestions-title-group">
          <HelpCircle size={16} className="suggestions-header-icon" />
          <span className="suggestions-title">Frequently Asked Questions</span>
        </div>
        {onRefresh && (
          <button
            className="icon-button refresh-btn"
            onClick={onRefresh}
            disabled={loading}
            title="Load more suggestions"
            aria-label="Refresh suggestions"
          >
            <RefreshCw size={14} className={loading ? 'spin' : ''} />
            <span className="refresh-text">Shuffle</span>
          </button>
        )}
      </div>

      <div className="suggestions-grid">
        {suggestions.map((item, idx) => {
          const questionText = typeof item === 'string' ? item : item.question;
          const category = typeof item === 'object' ? item.category : 'General Tech';
          const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.default;

          return (
            <button
              key={idx}
              className="suggestion-card"
              onClick={() => onSelectQuestion(questionText)}
              title={`Ask: "${questionText}"`}
            >
              <div className="suggestion-card-header">
                <span className="suggestion-category-badge">{category}</span>
                <Icon size={14} className="suggestion-icon" />
              </div>
              <div className="suggestion-question-text">{questionText}</div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
