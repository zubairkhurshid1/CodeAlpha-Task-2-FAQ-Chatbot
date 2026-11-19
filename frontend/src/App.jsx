import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import ChatInput from './components/ChatInput';
import { chatService } from './services/chatService';
import { Bot, X, ExternalLink, Cpu, BookOpen, CheckCircle, Award } from 'lucide-react';
import './App.css';

const STORAGE_KEY_CONVERSATIONS = 'intellifaq_conversations';
const STORAGE_KEY_ACTIVE_ID = 'intellifaq_active_id';
const STORAGE_KEY_THEME = 'intellifaq_theme';
const STORAGE_KEY_THRESHOLD = 'intellifaq_threshold';

function generateId() {
  return 'conv_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
}

function createNewConversation() {
  const id = generateId();
  return {
    id,
    title: 'New Conversation',
    createdAt: new Date().toISOString(),
    messages: []
  };
}

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THEME);
    if (saved) return saved === 'dark';
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // About modal state
  const [aboutOpen, setAboutOpen] = useState(false);

  // Backend status
  const [backendStatus, setBackendStatus] = useState('checking'); // 'healthy' | 'offline'

  // Model similarity threshold
  const [threshold, setThreshold] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_THRESHOLD);
    return saved ? parseFloat(saved) : 0.32;
  });

  // Conversations history
  const [conversations, setConversations] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CONVERSATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.error('Error loading conversations from localStorage', e);
    }
    const initial = createNewConversation();
    return [initial];
  });

  // Active conversation ID
  const [activeId, setActiveId] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_ACTIVE_ID);
    return saved || (conversations[0] ? conversations[0].id : null);
  });

  // FAQ catalog & suggestions state
  const [faqs, setFaqs] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  // Active chat interaction state
  const [loading, setLoading] = useState(false);
  const [chatError, setChatError] = useState(null);
  const [lastFailedQuery, setLastFailedQuery] = useState(null);

  // Current active conversation
  const activeConversation = conversations.find((c) => c.id === activeId) || conversations[0];

  // Apply theme class to document element
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(STORAGE_KEY_THEME, isDark ? 'dark' : 'light');
  }, [isDark]);

  // Persist conversations to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CONVERSATIONS, JSON.stringify(conversations));
    } catch (e) {
      console.error('Failed to save conversations', e);
    }
  }, [conversations]);

  // Persist active ID
  useEffect(() => {
    if (activeId) {
      localStorage.setItem(STORAGE_KEY_ACTIVE_ID, activeId);
    }
  }, [activeId]);

  // Persist threshold
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_THRESHOLD, threshold.toString());
  }, [threshold]);

  // Initial data loading: health, suggestions, faqs
  useEffect(() => {
    const checkInit = async () => {
      // 1. Health check
      try {
        const health = await chatService.checkHealth();
        if (health && health.status === 'healthy') {
          setBackendStatus('healthy');
          if (health.similarity_threshold) {
            setThreshold(health.similarity_threshold);
          }
        } else {
          setBackendStatus('offline');
        }
      } catch {
        setBackendStatus('offline');
      }

      // 2. Load suggestions
      loadSuggestions();

      // 3. Load FAQs catalog
      try {
        const faqData = await chatService.getFAQs();
        if (faqData && faqData.faqs) {
          setFaqs(faqData.faqs);
        }
      } catch (err) {
        console.warn('Could not load FAQ catalog:', err);
      }
    };

    checkInit();
  }, []);

  const loadSuggestions = async () => {
    setSuggestionsLoading(true);
    try {
      const data = await chatService.getSuggestions(6);
      if (data && data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (e) {
      console.warn('Failed to load suggestions:', e);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  // Create new chat
  const handleNewChat = useCallback(() => {
    const newConv = createNewConversation();
    setConversations((prev) => [newConv, ...prev]);
    setActiveId(newConv.id);
    setChatError(null);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  // Select conversation
  const handleSelectConversation = useCallback((id) => {
    setActiveId(id);
    setChatError(null);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, []);

  // Delete single conversation
  const handleDeleteConversation = useCallback(
    (id) => {
      setConversations((prev) => {
        const remaining = prev.filter((c) => c.id !== id);
        if (remaining.length === 0) {
          const fresh = createNewConversation();
          setActiveId(fresh.id);
          return [fresh];
        }
        if (activeId === id) {
          setActiveId(remaining[0].id);
        }
        return remaining;
      });
    },
    [activeId]
  );

  // Clear all conversations
  const handleClearAllConversations = useCallback(() => {
    if (window.confirm('Are you sure you want to clear all conversation history?')) {
      const fresh = createNewConversation();
      setConversations([fresh]);
      setActiveId(fresh.id);
      setChatError(null);
    }
  }, []);

  // Send message to chatbot
  const handleSendMessage = async (userText) => {
    if (!userText.trim()) return;

    setChatError(null);
    setLastFailedQuery(null);

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMessage = {
      id: generateId(),
      sender: 'user',
      text: userText,
      timestamp
    };

    // Append user message immediately
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeId) {
          const updatedMessages = [...c.messages, userMessage];
          const updatedTitle =
            c.title === 'New Conversation' ? userText.slice(0, 36) + (userText.length > 36 ? '...' : '') : c.title;
          return {
            ...c,
            title: updatedTitle,
            messages: updatedMessages
          };
        }
        return c;
      })
    );

    setLoading(true);

    try {
      const response = await chatService.sendMessage(userText, threshold);
      const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      const botMessage = {
        id: generateId(),
        sender: 'bot',
        text: response.answer,
        timestamp: botTimestamp,
        matchedQuestion: response.matched_question,
        similarityScore: response.similarity_score,
        confidenceLabel: response.confidence_label,
        category: response.category,
        relatedQuestions: response.related_questions || [],
        isError: false
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeId) {
            return {
              ...c,
              messages: [...c.messages, botMessage]
            };
          }
          return c;
        })
      );
    } catch (err) {
      console.error('Failed to get bot response:', err);
      setChatError(err.message || 'Could not communicate with the IntelliFAQ backend.');
      setLastFailedQuery(userText);

      const errorTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const errorBotMessage = {
        id: generateId(),
        sender: 'bot',
        text: 'Sorry, I encountered an issue connecting to the NLP engine. Please verify the backend is running at http://localhost:8000 and try again.',
        timestamp: errorTimestamp,
        isError: true,
        similarityScore: 0.0
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === activeId) {
            return {
              ...c,
              messages: [...c.messages, errorBotMessage]
            };
          }
          return c;
        })
      );
    } finally {
      setLoading(false);
    }
  };

  // Retry sending query
  const handleRetry = () => {
    if (lastFailedQuery) {
      handleSendMessage(lastFailedQuery);
    }
  };

  return (
    <div className="app-layout">
      {/* Sidebar for Navigation, Chat History & FAQ Browser */}
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        conversations={conversations}
        activeId={activeId}
        onSelectConversation={handleSelectConversation}
        onNewChat={handleNewChat}
        onDeleteConversation={handleDeleteConversation}
        onClearAllConversations={handleClearAllConversations}
        faqs={faqs}
        onSelectQuestion={handleSendMessage}
        threshold={threshold}
        onThresholdChange={setThreshold}
      />

      {/* Main Chat Area */}
      <main className="main-content">
        <Header
          isDark={isDark}
          onToggleTheme={() => setIsDark((prev) => !prev)}
          onNewChat={handleNewChat}
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onOpenAbout={() => setAboutOpen(true)}
          backendStatus={backendStatus}
        />

        <ChatWindow
          messages={activeConversation ? activeConversation.messages : []}
          loading={loading}
          error={chatError}
          onRetry={lastFailedQuery ? handleRetry : null}
          suggestions={suggestions}
          onSelectQuestion={handleSendMessage}
          onRefreshSuggestions={loadSuggestions}
          suggestionsLoading={suggestionsLoading}
        />

        <ChatInput
          onSendMessage={handleSendMessage}
          disabled={loading}
        />
      </main>

      {/* About & NLP Architecture Modal */}
      {aboutOpen && (
        <div className="modal-backdrop" onClick={() => setAboutOpen(false)}>
          <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-group">
                <Bot size={22} className="modal-title-icon" />
                <h2 className="modal-title">About IntelliFAQ</h2>
              </div>
              <button className="icon-button modal-close-btn" onClick={() => setAboutOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <div className="project-banner">
                <Award size={20} className="banner-icon" />
                <div>
                  <strong>CodeAlpha Artificial Intelligence Internship</strong> — Task 2: FAQ Chatbot
                </div>
              </div>

              <h3>1. Natural Language Processing (NLP) Pipeline</h3>
              <p>
                IntelliFAQ is a complete, local NLP application engineered without third-party paid AI APIs. It transforms raw natural language user questions into high-dimensional vector representations and performs geometric similarity matching:
              </p>

              <div className="pipeline-steps-list">
                <div className="step-card">
                  <div className="step-number">Step 1</div>
                  <div className="step-content">
                    <strong>Text Preprocessing (NLTK):</strong> Lowercases queries, normalizes technical frameworks (e.g., <em>React.js → React</em>, <em>CI/CD → cicd</em>), strips punctuation, tokenizes text, and removes English stopwords.
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-number">Step 2</div>
                  <div className="step-content">
                    <strong>TF-IDF Vectorization:</strong> Utilizes Scikit-Learn's <code>TfidfVectorizer</code> with unigram and bigram ranges <code>(1, 2)</code> to calculate term importance scaled by inverse document frequency across the FAQ knowledge base.
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-number">Step 3</div>
                  <div className="step-content">
                    <strong>Cosine Similarity Matching:</strong> Computes the normalized dot product between user query vectors and pre-indexed FAQ vectors to rank candidates from 0.0 (unrelated) to 1.0 (exact match).
                  </div>
                </div>

                <div className="step-card">
                  <div className="step-number">Step 4</div>
                  <div className="step-content">
                    <strong>Confidence Threshold & Fallback:</strong> Enforces a configurable similarity threshold (default: <code>0.32</code>). Unmatched queries return a polite fallback with suggested alternatives.
                  </div>
                </div>
              </div>

              <h3>2. Similarity Score Transparency</h3>
              <p className="disclaimer-text">
                Similarity scores represent <em>textual vector alignment</em> against curated FAQ patterns, rather than factual truth probability. This ensures transparent, explainable AI responses.
              </p>
            </div>

            <div className="modal-footer">
              <button className="action-button modal-primary-btn" onClick={() => setAboutOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
