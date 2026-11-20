import React, { useState } from 'react';
import { 
  MessageSquare, Plus, Trash2, Sliders, BookOpen, 
  ChevronRight, ChevronDown, X, Award, Search, PlusCircle, Check
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
      {/* Mobile backdrop overlay */}
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}

      <aside className={`sidebar-container ${isOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <button className="sidebar-new-chat-btn" onClick={onNewChat}>
            <Plus size={16} />
            <span>New Conversation</span>
          </button>
          <button className="icon-button close-sidebar-btn" onClick={onClose} title="Close sidebar">
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="sidebar-tabs">
          <button
            className={`sidebar-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
            title="Chat History"
          >
            <MessageSquare size={15} />
            <span>History</span>
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'faqs' ? 'active' : ''}`}
            onClick={() => setActiveTab('faqs')}
            title="Browse FAQ Catalog"
          >
            <BookOpen size={15} />
            <span>FAQ Hub</span>
          </button>
          <button
            className={`sidebar-tab ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
            title="NLP Settings"
          >
            <Sliders size={15} />
            <span>Settings</span>
          </button>
        </div>

        {/* Tab 1: Chat History */}
        {activeTab === 'history' && (
          <div className="sidebar-content history-section">
            <div className="section-label">Recent Chats</div>
            {conversations.length === 0 ? (
              <div className="empty-state-text">No saved conversations yet. Start asking a question!</div>
            ) : (
              <div className="conversation-list">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    className={`conversation-item ${conv.id === activeId ? 'active' : ''}`}
                    onClick={() => onSelectConversation(conv.id)}
                  >
                    <MessageSquare size={14} className="conv-icon" />
                    <span className="conv-title" title={conv.title}>
                      {conv.title || 'New Conversation'}
                    </span>
                    <button
                      className="delete-conv-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteConversation(conv.id);
                      }}
                      title="Delete chat"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {conversations.length > 0 && (
              <button
                className="clear-all-btn"
                onClick={onClearAllConversations}
                title="Clear all chat history"
              >
                <Trash2 size={14} />
                <span>Clear All Chats</span>
              </button>
            )}
          </div>
        )}

        {/* Tab 2: FAQ Knowledge Catalog */}
        {activeTab === 'faqs' && (
          <div className="sidebar-content faq-catalog-section">
            <div className="faq-hub-toolbar">
              <div className="faq-search-box">
                <Search size={14} className="search-icon" />
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="faq-search-input"
                />
                {searchQuery && (
                  <button className="clear-search-btn" onClick={() => setSearchQuery('')}>
                    <X size={12} />
                  </button>
                )}
              </div>

              {onAddFAQ && (
                <button
                  className="add-faq-trigger-btn"
                  onClick={() => setShowAddModal(true)}
                  title="Add custom FAQ entry"
                >
                  <PlusCircle size={14} />
                  <span>Add FAQ</span>
                </button>
              )}
            </div>

            <div className="faq-categories-list">
              {Object.keys(filteredCategories).length === 0 ? (
                <div className="empty-state-text">No FAQs found matching "{searchQuery}".</div>
              ) : (
                Object.entries(filteredCategories).map(([catName, items]) => {
                  const isExpanded = expandedCategory === catName || searchQuery.trim().length > 0;
                  return (
                    <div key={catName} className="category-group">
                      <button
                        className="category-header-btn"
                        onClick={() =>
                          setExpandedCategory((prev) => (prev === catName ? null : catName))
                        }
                      >
                        <span className="category-name">{catName}</span>
                        <span className="category-count">{items.length}</span>
                        {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>

                      {isExpanded && (
                        <div className="category-questions-list">
                          {items.map((item) => (
                            <button
                              key={item.id}
                              className="catalog-question-btn"
                              onClick={() => {
                                onSelectQuestion(item.question);
                                if (window.innerWidth < 768) onClose();
                              }}
                              title={`Ask: ${item.question}`}
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

        {/* Tab 3: NLP Threshold Settings */}
        {activeTab === 'settings' && (
          <div className="sidebar-content settings-section">
            <div className="section-label">NLP Model Configuration</div>

            <div className="setting-card">
              <div className="setting-header">
                <span className="setting-name">Similarity Threshold</span>
                <span className="setting-badge">{(threshold * 100).toFixed(0)}%</span>
              </div>
              <p className="setting-desc">
                Minimum cosine similarity required to accept an FAQ match. Queries scoring below this return the fallback message.
              </p>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.02"
                value={threshold}
                onChange={(e) => onThresholdChange(parseFloat(e.target.value))}
                className="threshold-slider"
              />
              <div className="slider-labels">
                <span>0.10 (Lenient)</span>
                <span>0.32 (Balanced)</span>
                <span>0.80 (Strict)</span>
              </div>
            </div>

            <div className="nlp-architecture-box">
              <div className="arch-title">Pipeline Architecture</div>
              <ul className="arch-steps">
                <li><strong>1. Preprocessing:</strong> Lowercasing, tokenization, tech preservation, stopword removal, lemmatization.</li>
                <li><strong>2. Vectorization:</strong> Scikit-Learn TfidfVectorizer (unigrams & bigrams).</li>
                <li><strong>3. Matching:</strong> Cosine similarity against pre-computed TF-IDF index.</li>
                <li><strong>4. Validation:</strong> Dynamic threshold validation & related suggestion generation.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <div className="internship-badge">
            <Award size={15} className="award-icon" />
            <div className="badge-text">
              <span className="badge-primary">IntelliFAQ NLP Engine</span>
              <span className="badge-secondary">TF-IDF & Cosine Similarity</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Add Custom FAQ Modal */}
      {showAddModal && (
        <div className="modal-backdrop" onClick={() => setShowAddModal(false)}>
          <div className="modal-dialog add-faq-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <PlusCircle size={20} className="modal-title-icon" />
                <h3 className="modal-title">Add Custom FAQ</h3>
              </div>
              <button className="icon-button" onClick={() => setShowAddModal(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleCreateFAQSubmit}>
              <div className="modal-body">
                {addSuccess ? (
                  <div className="add-faq-success-message">
                    <Check size={28} className="success-icon" />
                    <strong>FAQ Added & Indexed!</strong>
                    <span>You can now ask this question in the chat immediately.</span>
                  </div>
                ) : (
                  <>
                    {addError && <div className="add-faq-error">{addError}</div>}

                    <div className="form-field">
                      <label className="form-label">Category</label>
                      <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="e.g. Frontend Development, Databases, etc."
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">Canonical Question</label>
                      <input
                        type="text"
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="e.g. What is GraphQL?"
                        required
                        className="form-input"
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">Answer</label>
                      <textarea
                        value={newAnswer}
                        onChange={(e) => setNewAnswer(e.target.value)}
                        placeholder="Detailed answer text..."
                        required
                        rows={3}
                        className="form-input form-textarea"
                      />
                    </div>

                    <div className="form-field">
                      <label className="form-label">Question Variations (one per line)</label>
                      <textarea
                        value={newPatterns}
                        onChange={(e) => setNewPatterns(e.target.value)}
                        placeholder="What is GraphQL used for?&#10;Explain GraphQL API"
                        rows={2}
                        className="form-input form-textarea"
                      />
                    </div>
                  </>
                )}
              </div>

              {!addSuccess && (
                <div className="modal-footer">
                  <button
                    type="button"
                    className="action-button"
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="action-button modal-primary-btn"
                    disabled={addLoading || !newQuestion.trim() || !newAnswer.trim()}
                  >
                    {addLoading ? 'Indexing...' : 'Save & Index FAQ'}
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
