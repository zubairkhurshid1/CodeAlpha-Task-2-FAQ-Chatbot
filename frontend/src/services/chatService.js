/**
 * IntelliFAQ - API Service
 * Handles all HTTP communications with the FastAPI backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const chatService = {
  /**
   * Send a question to the NLP chatbot endpoint
   */
  async sendMessage(question, threshold = null) {
    try {
      const payload = { question: question.trim() };
      if (threshold !== null && threshold !== undefined) {
        payload.threshold = parseFloat(threshold);
      }

      const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || `Server responded with status ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('ChatService Error (sendMessage):', error);
      throw error;
    }
  },

  /**
   * Fetch list of available FAQs (optionally filtered by category)
   */
  async getFAQs(category = null) {
    try {
      const url = category
        ? `${API_BASE_URL}/faqs?category=${encodeURIComponent(category)}`
        : `${API_BASE_URL}/faqs`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load FAQs: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('ChatService Error (getFAQs):', error);
      throw error;
    }
  },

  /**
   * Dynamically add a new FAQ to the knowledge base
   */
  async addFAQ(faqData) {
    try {
      const response = await fetch(`${API_BASE_URL}/faqs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(faqData),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.detail || 'Failed to add FAQ');
      }
      return await response.json();
    } catch (error) {
      console.error('ChatService Error (addFAQ):', error);
      throw error;
    }
  },

  /**
   * Fetch suggested questions for the welcome screen
   */
  async getSuggestions(count = 4) {
    try {
      const response = await fetch(`${API_BASE_URL}/suggestions?count=${count}`);
      if (!response.ok) {
        throw new Error(`Failed to load suggestions: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('ChatService Error (getSuggestions):', error);
      // Fallback suggestions if backend is temporarily unreachable
      return {
        suggestions: [
          'What is React?',
          'What is FastAPI?',
          'What is Natural Language Processing (NLP)?',
          'What is the difference between SQL and NoSQL databases?'
        ]
      };
    }
  },

  /**
   * Check backend health status
   */
  async checkHealth() {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        return { status: 'unhealthy', error: `Status ${response.status}` };
      }
      return await response.json();
    } catch (error) {
      return { status: 'offline', error: error.message };
    }
  },

  /**
   * Get active similarity threshold
   */
  async getThreshold() {
    try {
      const response = await fetch(`${API_BASE_URL}/threshold`);
      if (response.ok) {
        const data = await response.json();
        return data.threshold;
      }
      return 0.32;
    } catch {
      return 0.32;
    }
  },

  /**
   * Update active similarity threshold
   */
  async updateThreshold(newThreshold) {
    try {
      const response = await fetch(`${API_BASE_URL}/threshold`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ threshold: parseFloat(newThreshold) }),
      });
      return await response.json();
    } catch (error) {
      console.error('ChatService Error (updateThreshold):', error);
      throw error;
    }
  }
};
