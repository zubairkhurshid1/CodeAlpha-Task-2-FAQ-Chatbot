import React, { useState } from 'react';
import { 
  MessageSquare, Plus, Trash2, Sliders, BookOpen, 
  ChevronRight, ChevronDown, X, Search, PlusCircle, Check, Cpu
} from 'lucide-react';

export default function Sidebar({
  isOpen,
  onClose,
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onClearAllConversations,
  faqs,
  onSelectQuestion,
  threshold,
  onThresholdChange,
  onAddFAQ
}) {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'faqs' | 'settings'
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);

  // Add FAQ modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCategory, setNewCategory] = useState('General');
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [newPatterns, setNewPatterns] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addError, setAddError] = useState(null);

  // Group FAQs by category
  const categories = React.useMemo(() => {
    if (!faqs || faqs.length === 0) return {};
    const map = {};
    faqs.forEach((faq) => {
      const cat = faq.category || 'General';
      if (!map[cat]) map[cat] = [];
      map[cat].push(faq);
    });
    return map;
  }, [faqs]);

  // Filter FAQs by search query
  const filteredCategories = React.useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    const result = {};
    Object.keys(categories).forEach((cat) => {
      const matched = categories[cat].filter(
        (f) =>
          f.question.toLowerCase().includes(q) ||
          f.answer.toLowerCase().includes(q) ||
          (f.keywords && f.keywords.some((k) => k.toLowerCase().includes(q)))
      );
      if (matched.length > 0) {
        result[cat] = matched;
      }
    });
    return result;
  }, [categories, searchQuery]);

  const handleCreateFAQSubmit = async (e) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;

    setAddLoading(true);
    setAddError(null);

    const patternsArr = newPatterns
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    try {
      if (onAddFAQ) {
        await onAddFAQ({
          category: newCategory.trim() || 'General',
          question: newQuestion.trim(),
          answer: newAnswer.trim(),
          patterns: patternsArr.length > 0 ? patternsArr : [newQuestion.trim()],
          related_questions: [],
          keywords: []
        });
      }
      setAddSuccess(true);
      setTimeout(() => {
        setAddSuccess(false);
        setShowAddModal(false);
        setNewQuestion('');
        setNewAnswer('');
        setNewPatterns('');
      }, 1500);
    } catch (err) {
      setAddError(err.message || 'Failed to save FAQ');
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar ${isOpen ? 'is-open' : 'is-collapsed'}`}>
        <div className="sidebar-top">
          <button className="new-chat-action" onClick={onNewChat}>
            <Plus size={15} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Minimal Nav Tabs */}
        <div className="sidebar-nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'history' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('history')}
            title="Chat History"
          >
            <MessageSquare size={14} />
            <span>Chats</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'faqs' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('faqs')}
            title="FAQ Knowledge Hub"
          >
            <BookOpen size={14} />
            <span>Knowledge</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'settings' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="Settings"
          >
            <Sliders size={14} />
            <span>Model</span>
          </button>
        </div>

        {/* Tab 1: History */}
        {activeTab === 'history' && (
          <div className="sidebar-pane">
            <div className="pane-heading">Recent conversations</div>
            {conversations.length === 0 ? (
              <div className="pane-empty">No conversations yet.</div>
            ) : (
              <div className="chat-nav-list">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`chat-nav-item ${conv.id === activeId ? 'is-active' : ''}`}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <MessageSquare size={13} className="item-icon" />
                    <span className="item-title" title={conv.title}>
                      {conv.title || 'New Conversation'}
                    </span>
                    <button
                      className="item-delete-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      title="Delete"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {conversations.length > 0 && (
              <button
                className="clear-history-btn"
                onClick={onClearAllConversations}
                title="Clear all"
              >
                <span>Clear history</span>
              </button>
            )}
          </div>
        )}

        {/* Tab 2: Knowledge Base */}
        {activeTab === 'faqs' && (
          <div className="sidebar-pane">
            <div className="knowledge-toolbar">
              <div className="clean-search">
                <Search size={13} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
                {searchQuery && (
                  <button className="clear-filter" onClick={() => setSearchQuery('')}>
                    <X size={11} />
                  </button>
                )}
              </div>

              {onAddFAQ && (
                <button
                  className="add-topic-btn"
                  onClick={() => setShowAddModal(true)}
                  title="Add custom topic"
                >
                  <PlusCircle size={13} />
                  <span>Add Topic</span>
                </button>
              )}
            </div>

            <div className="category-accordion">
              {Object.keys(filteredCategories).length === 0 ? (
                <div className="pane-empty">No topics found.</div>
              ) : (
                Object.entries(filteredCategories).map(([catName, items]) => {
                  const isExpanded = expandedCategory === catName || searchQuery.trim().length > 0;
                  return (
                    <div key={catName} className="category-block">
                      <button
                        className="category-trigger"
                        onClick={() =>
                          setExpandedCategory((prev) => (prev === catName ? null : catName))
                        }
                      >
                        <span className="cat-name">{catName}</span>
                        <span className="cat-num">{items.length}</span>
                        {isExpanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
                      </button>

                      {isExpanded && (
                        <div className="topic-sublist">
                          {items.map((item) => (
                            <button
                              key={item.id}
                              className="topic-pill"
                              onClick={() => {
                                onSelectQuestion(item.question);
                                if (window.innerWidth < 768) onClose();
                              }}
                              title={item.question}
                            >
                              <span>{item.question}</span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Model Settings */}
        {activeTab === 'settings' && (
          <div className="sidebar-pane">
            <div className="pane-heading">NLP Configuration</div>

            <div className="clean-card">
              <div className="card-top">
                <span className="card-title">Similarity Threshold</span>
                <span className="card-badge">{(threshold * 100).toFixed(0)}%</span>
              </div>
              <p className="card-caption">
                Minimum cosine similarity to accept an answer.
              </p>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.02"
                value={threshold}
                onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
                className="clean-slider"
              />
              <div className="slider-range-legend">
                <span>0.10</span>
                <span>0.32 (Balanced)</span>
                <span>0.80</span>
              </div>
            </div>

            <div className="clean-card pipeline-specs">
              <div className="card-title">NLP Architecture</div>
              <ul className="spec-items">
                <li>• NLTK Preprocessing & Lemmatization</li>
                <li>• Scikit-Learn TfidfVectorizer (1, 2)</li>
                <li>• Cosine Similarity Vector Space</li>
                <li>• Dynamic Threshold Guardrails</li>
              </ul>
            </div>
          </div>
        )}

        {/* Subtle Minimal Footer */}
        <div className="sidebar-bottom">
          <div className="system-pill">
            <Cpu size={13} />
            <span>TF-IDF • Cosine Similarity</span>
          </div>
        </div>
      </aside>

      {/* Add Custom FAQ Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="clean-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Add Knowledge Topic</h3>
              <button className="ghost-btn" onClick={() => setShowAddModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleCreateFAQSubmit}>
              <div className="modal-content">
                {addSuccess ? (
                  <div className="modal-success">
                    <Check size={24} className="success-icon" />
                    <strong>Topic Added & Indexed!</strong>
                    <span>You can now ask this in the chat immediately.</span>
                  </div>
                ) : (
                  <>
                    {addError && <div className="modal-alert">{addError}</div>}

                    <div className="input-group">
                      <label>Category</label>
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="e.g. Frontend Development, Databases"
                        required
                        className="clean-input"
                      />
                    </div>

                    <div className="input-group">
                      <label>Question</label>
                      <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="e.g. What is GraphQL?"
                        required
                        className="clean-input"
                      />
                    </div>

                    <div className="input-group">
                      <label>Answer</label>
                      <textarea
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        placeholder="Verified answer explanation..."
                        required
                        rows={3}
                        className="clean-input clean-textarea"
                      />
                    </div>

                    <div className="input-group">
                      <label>Variations (one per line, optional)</label>
                      <textarea
                        value={newPatterns}
                        onChange={(e) => setNewPatterns(e.target.value)}
                        placeholder="What is GraphQL used for?&#10;Explain GraphQL API"
                        rows={2}
                        className="clean-input clean-textarea"
                      />
                    </div>
                  </>
                )}
              </div>

              {!addSuccess && (
                <div className="modal-actions">
                  <button
                    type="button"
                    className="modal-cancel-btn"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="modal-submit-btn"
                    disabled={addLoading || !newQuestion.trim() || !newAnswer.trim()}
                  >
                    {addLoading ? 'Indexing...' : 'Save & Index'}
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
