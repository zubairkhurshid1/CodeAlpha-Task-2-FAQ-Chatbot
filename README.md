# 🤖 IntelliFAQ - Intelligent NLP-Powered FAQ Chatbot

> **CodeAlpha Artificial Intelligence Internship — Task 2**  
> An intelligent, production-ready Natural Language Processing (NLP) chatbot designed to understand developer queries in natural language, vectorise conversational text, and match user intents to an indexed knowledge base with mathematical precision.  
> **100% Local NLP Execution — Zero Paid External APIs.**

---

## 📑 Table of Contents

1. [Project Overview](#-project-overview)
2. [Key Features](#-key-features)
3. [Architecture & Technology Stack](#-architecture--technology-stack)
4. [NLP Pipeline Deep Dive](#-nlp-pipeline-deep-dive)
   - [Text Preprocessing & Normalization](#1-text-preprocessing--normalization)
   - [TF-IDF Vectorization](#2-tf-idf-vectorization)
   - [Cosine Similarity Matching](#3-cosine-similarity-matching)
   - [Dynamic Confidence Thresholding](#4-dynamic-confidence-thresholding)
5. [Project Structure](#-project-structure)
6. [Local Installation & Setup](#-local-installation--setup)
   - [Prerequisites](#prerequisites)
   - [Backend Setup (FastAPI & Python)](#backend-setup-fastapi)
   - [Frontend Setup (React & Vite)](#frontend-setup-react--vite)
7. [Running the Application](#-running-the-application)
8. [API Documentation](#-api-documentation)
   - [`POST /api/chat`](#post-apichat)
   - [`GET /api/faqs`](#get-apifaqs)
   - [`GET /api/suggestions`](#get-apisuggestions)
   - [`GET /api/health`](#get-apihealth)
   - [`GET /api/threshold`](#get-apithreshold)
   - [`POST /api/threshold`](#post-apithreshold)
9. [Automated Testing](#-automated-testing)
10. [Deployment Guide](#-deployment-guide)
    - [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
    - [Backend Deployment (Render)](#backend-deployment-render)
11. [Screenshots & UI Showcase](#-screenshots--ui-showcase)
12. [License & Acknowledgments](#-license--acknowledgments)

---

## 🌟 Project Overview

**IntelliFAQ** is built as part of the **CodeAlpha Artificial Intelligence Internship (Task 2)**. Traditional static chatbots rely on hardcoded `if/else` keyword string checks that break easily when users rephrase questions, use typos, or provide polite filler phrases.

IntelliFAQ solves this by employing a genuine **Natural Language Processing (NLP)** pipeline:
- Ingests freeform questions in natural language.
- Cleans and normalizes tokens while protecting domain-specific technical vocabulary (e.g., `React.js`, `CI/CD`, `TF-IDF`, `RESTful`).
- Transforms questions into numerical n-gram vectors using **TF-IDF (Term Frequency-Inverse Document Frequency)**.
- Computes **Cosine Similarity** against an indexed FAQ vector corpus.
- Ranks best matching answers and enforces a configurable similarity threshold to eliminate hallucinations and false positives.

---

## ✨ Key Features

- **Genuine Local NLP Engine:** Operates entirely locally using Scikit-Learn and NLTK without incurring external API latency or costs.
- **Explainable Textual Similarity:** Displays transparent match percentages and confidence badges (e.g., *94.2% Very High Match*) with clear disclaimers that scores indicate textual phrasing alignment.
- **Configurable Similarity Threshold:** Dynamic threshold slider allows tuning between permissive matching and strict rejection of unrelated questions.
- **Suggested Follow-up Questions:** Context-aware interactive question chips allow users to drill deeper into related technologies.
- **Conversation History:** Persists full chat history across sessions using browser `localStorage` with multi-chat session switching and deletion.
- **Interactive Knowledge Hub:** Collapsible sidebar categorizes the entire FAQ dataset across *Frontend*, *Backend*, *AI & NLP*, *DevOps*, and *Databases* with instant click-to-ask functionality.
- **Response Utilities:** Copy chatbot responses to clipboard with visual feedback; rate answers with *Helpful* / *Not Helpful* feedback buttons.
- **Modern SaaS UI/UX:** Built with React 19, Vite, and Lucide React icons, featuring smooth transitions, auto-scrolling, typing indicators, and seamless **Light / Dark mode**.
- **Comprehensive Pytest Suite:** 100% automated test coverage testing exact matches, natural variations, punctuation handling, filler word resilience, out-of-domain rejections, and API contracts.

---

## 🛠 Architecture & Technology Stack

```
┌────────────────────────────────────────────────────────┐
│               React 19 Frontend (Vite)                │
│    • Modern Chat UI       • Light/Dark Theme           │
│    • LocalStorage History • FAQ Knowledge Hub          │
└───────────────────────────▲────────────────────────────┘
                            │ HTTP JSON (CORS Enabled)
┌───────────────────────────▼────────────────────────────┐
│              FastAPI Backend (Python 3.11)             │
│    • Pydantic Validation  • REST API Endpoints         │
│    • Dynamic Thresholds   • Health & Diagnostic Metrics│
├────────────────────────────────────────────────────────┤
│                  Core NLP Pipeline                     │
│    • NLTK Preprocessing   • Stopword Removal           │
│    • Token Lemmatization  • Scikit-Learn TF-IDF        │
│    • Cosine Similarity    • Modular faqs.json Dataset  │
└────────────────────────────────────────────────────────┘
```

### Technology Breakdown

| Component | Technology | Role |
| :--- | :--- | :--- |
| **Frontend Framework** | **React 19** + **Vite** | Modern, lightning-fast component rendering and HMR |
| **Icons & UI** | **Lucide React** + Modern CSS3 | Premium iconography, accessible controls, responsive design |
| **Backend Framework**| **Python 3.11** + **FastAPI** | High-performance asynchronous REST API server |
| **Data Validation** | **Pydantic V2** | Request/response schema contracts and input sanitation |
| **NLP Preprocessing** | **NLTK** + Regex Normalizer | Sentence tokenization, domain term preservation, stopword removal |
| **Vectorization** | **Scikit-Learn `TfidfVectorizer`** | Numerical representation with unigram + bigram n-gram weighting |
| **Similarity Metric** | **Scikit-Learn `cosine_similarity`** | Normalized angle measurement in multi-dimensional vector space |
| **Unit Testing** | **Pytest** + **FastAPI TestClient** | Automated regression, edge-case, and similarity threshold testing |

---

## 🔬 NLP Pipeline Deep Dive

### 1. Text Preprocessing & Normalization
Natural language input is noisy. A question like `"Could you please tell me what React.js is??"` must match the canonical FAQ `"What is React?"`.

1. **Lowercasing:** Converts text to lowercase to ensure case-insensitivity.
2. **Domain-Aware Normalization:** Protects technical terms that would otherwise be mangled by generic punctuation removal:
   - `react.js` / `reactjs` $\rightarrow$ `react`
   - `ci/cd` / `ci-cd` $\rightarrow$ `cicd`
   - `tf-idf` $\rightarrow$ `tfidf`
   - `restful` $\rightarrow$ `rest`
3. **Punctuation Stripping:** Removes question marks, exclamation points, and special characters.
4. **Tokenization:** Breaks the normalized sentence into individual word tokens.
5. **Stopword Filtering:** Removes non-discriminative English filler words (`"could"`, `"you"`, `"please"`, `"me"`, `"is"`) while preserving content-bearing nouns, verbs, and technical adjectives.
6. **Morphological Stemming / Lemmatization:** Normalizes inflections (e.g., `components` $\rightarrow$ `component`, `libraries` $\rightarrow$ `library`).

### 2. TF-IDF Vectorization
The preprocessed corpus of FAQ questions and user input are converted into sparse numerical feature vectors using **Term Frequency-Inverse Document Frequency**:

$$\text{TF-IDF}(t, d, D) = \text{TF}(t, d) \times \text{IDF}(t, D)$$

Where:
- $\text{TF}(t, d)$: The frequency of term $t$ in query/document $d$. Sublinear scaling ($1 + \log(\text{TF})$) is applied to prevent repetitive words from dominating.
- $\text{IDF}(t, D)$: The inverse document frequency across the entire FAQ corpus $D$:

$$\text{IDF}(t, D) = \log\left(\frac{1 + |D|}{1 + |\{d \in D : t \in d\}|}\right) + 1$$

Terms common across every question (like `"software"`) receive lower weight, while distinctive terms (like `"docker"`, `"fastapi"`, or `"virtual dom"`) receive high discriminative weight.

The vectorizer extracts both **unigrams and bigrams** ($1, 2$) so word pairs like `"rest api"` or `"virtual dom"` are captured as distinct features.

### 3. Cosine Similarity Matching
Once the user's query vector $\vec{q}$ and FAQ pattern vectors $\vec{d}_i$ are constructed, the cosine of the angle between them is calculated:

$$\text{Cosine Similarity}(\vec{q}, \vec{d}_i) = \frac{\vec{q} \cdot \vec{d}_i}{\|\vec{q}\| \|\vec{d}_i\|} = \frac{\sum_{k} q_k d_{ik}}{\sqrt{\sum_{k} q_k^2} \sqrt{\sum_{k} d_{ik}^2}}$$

- **Score = 1.0 (100%):** Identical vector orientation (exact match).
- **Score $\approx$ 0.70 – 0.95:** High textual alignment across key words and phrases.
- **Score = 0.0:** Orthogonal vectors with zero vocabulary overlap.

### 4. Dynamic Confidence Thresholding
To prevent the chatbot from returning inaccurate answers for out-of-scope questions (e.g., *"How do I bake a cake?"*), a configurable similarity threshold (default `0.32`) is enforced:

- $\text{Score} \ge \text{Threshold}$: Returns the best matching FAQ answer, confidence score, and relevant follow-ups.
- $\text{Score} < \text{Threshold}$: Returns a polite fallback:
  > *"Sorry, I couldn't find a relevant answer. Please try asking differently."*  
  along with suggested tech questions.

---

## 📁 Project Structure

```
CodeAlpha_FAQ_Chatbot/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx        # App header, status badge, theme & new chat toggles
│   │   │   ├── ChatWindow.jsx    # Welcome screen, message feed, typing indicator
│   │   │   ├── ChatMessage.jsx   # Message bubble, similarity score badge, feedback buttons
│   │   │   ├── ChatInput.jsx     # Auto-resizing textarea, keyboard shortcuts, submit button
│   │   │   ├── Suggestions.jsx   # Responsive grid of clickable FAQ prompt cards
│   │   │   └── Sidebar.jsx       # Multi-chat history, FAQ Hub catalog, threshold slider
│   │   ├── services/
│   │   │   └── chatService.js    # Fetch API client communicating with FastAPI
│   │   ├── App.jsx               # Main state management, localStorage persistence
│   │   ├── App.css               # Modern CSS with full Light & Dark mode themes
│   │   └── main.jsx              # Vite application entry point
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   │   ├── routes/
│   │   │   ├── __init__.py
│   │   │   └── chat.py           # REST endpoints (/api/chat, /api/faqs, /api/suggestions)
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── nlp_processor.py  # NLTK text cleaner, tokenizer & normalizer
│   │   │   └── faq_matcher.py    # Scikit-learn TF-IDF & Cosine Similarity engine
│   │   ├── data/
│   │   │   └── faqs.json         # Modular structured FAQ dataset with 25+ entries & patterns
│   │   ├── __init__.py
│   │   └── main.py               # FastAPI app initialization & CORS configuration
│   ├── tests/
│   │   ├── __init__.py
│   │   └── test_faq.py           # 17 automated Pytest unit and integration tests
│   └── requirements.txt          # Python dependencies
│
├── .gitignore                    # Git ignore file for Python & Node environments
└── README.md                     # Comprehensive project documentation
```

---

## 🚀 Local Installation & Setup

### Prerequisites
- **Node.js** (v18.0 or later) & **npm**
- **Python** (v3.9 to v3.12)
- **Git**

---

### Backend Setup (FastAPI)

1. Navigate to the backend directory:
   ```bash
   cd CodeAlpha_FAQ_Chatbot/backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows:**
     ```powershell
     python -m venv venv
     .\venv\Scripts\Activate.ps1
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install the required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```

   The backend will be running at `http://127.0.0.1:8000`.  
   Interactive API documentation (Swagger UI) is available at `http://127.0.0.1:8000/docs`.

---

### Frontend Setup (React & Vite)

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd CodeAlpha_FAQ_Chatbot/frontend
   ```

2. Install the frontend dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:5173`.

---

## 📡 API Documentation

### `POST /api/chat`
Submits a user question to the NLP pipeline.

**Request Body:**
```json
{
  "question": "What is React?",
  "threshold": 0.32
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "question": "What is React?",
  "answer": "React is an open-source JavaScript library developed by Meta (formerly Facebook) for building interactive user interfaces, particularly single-page applications. It uses a component-based architecture and a Virtual DOM to efficiently update and render UI elements.",
  "matched_question": "What is React?",
  "similarity_score": 1.0,
  "confidence_label": "Very High Textual Match",
  "is_confident": true,
  "category": "Frontend Development",
  "related_questions": [
    "What are React components?",
    "What are React hooks?",
    "What is the Virtual DOM in React?"
  ],
  "similarity_explanation": "Score reflects textual vector similarity (TF-IDF & Cosine Similarity) between questions."
}
```

**Unmatched / Out-of-Domain Response (200 OK):**
```json
{
  "success": false,
  "question": "How do I bake a chocolate cake?",
  "answer": "Sorry, I couldn't find a relevant answer. Please try asking differently.",
  "matched_question": "What is React?",
  "similarity_score": 0.0,
  "confidence_label": "Below Similarity Threshold",
  "is_confident": false,
  "category": null,
  "related_questions": [
    "What are React components?",
    "What are React hooks?",
    "What is the Virtual DOM in React?"
  ],
  "similarity_explanation": "Score reflects textual vector similarity (TF-IDF & Cosine Similarity) between questions."
}
```

---

### `GET /api/faqs`
Retrieves all indexed FAQ entries or filters by category.

**Query Parameters:**
- `category` *(optional)*: e.g. `Frontend Development`, `Backend Development`, `Artificial Intelligence`

---

### `GET /api/suggestions`
Retrieves random suggested questions for the welcome screen.

**Query Parameters:**
- `count` *(optional, default: 4)*: Number of suggestions to return.

---

### `GET /api/health`
Returns the status of the API and index statistics:
```json
{
  "status": "healthy",
  "service": "IntelliFAQ API",
  "total_faqs_indexed": 25,
  "total_patterns_indexed": 153,
  "similarity_threshold": 0.32,
  "engine": "TF-IDF + Cosine Similarity (Scikit-Learn & NLTK)"
}
```

---

## 🧪 Automated Testing

A comprehensive automated test suite is implemented using **pytest** and FastAPI's `TestClient`.

To execute all unit and integration tests:
```bash
cd CodeAlpha_FAQ_Chatbot/backend
pytest tests/ -v
```

### Test Suite Coverage
| Test Case | Objective | Status |
| :--- | :--- | :---: |
| `test_nlp_processor_cleaning` | Verifies punctuation stripping, tech terms normalization | ✅ Passed |
| `test_nlp_processor_tokenization` | Validates sentence tokenization into discrete words | ✅ Passed |
| `test_nlp_processor_stopwords` | Ensures common English stopwords are filtered | ✅ Passed |
| `test_nlp_processor_pipeline` | Validates end-to-end token lemmatization pipeline | ✅ Passed |
| `test_exact_faq_matching` | Tests exact query match ($S \ge 0.70$) | ✅ Passed |
| `test_different_wording_matching` | Tests natural phrasing variations | ✅ Passed |
| `test_spelling_variation_matching`| Tests tech term variations (`reactjs` vs `React.js`) | ✅ Passed |
| `test_unnecessary_words_matching` | Tests queries padded with conversational filler | ✅ Passed |
| `test_unrelated_questions` | Verifies out-of-scope queries fall below threshold | ✅ Passed |
| `test_empty_questions` | Tests empty query and whitespace rejection | ✅ Passed |
| `test_similarity_threshold_behavior`| Tests dynamic threshold enforcement | ✅ Passed |
| `test_api_health` | Integration test for `/api/health` | ✅ Passed |
| `test_api_suggestions` | Integration test for `/api/suggestions` | ✅ Passed |
| `test_api_faqs_listing` | Integration test for `/api/faqs` | ✅ Passed |
| `test_api_chat_success` | End-to-end test for `/api/chat` successful match | ✅ Passed |
| `test_api_chat_unrelated` | End-to-end test for `/api/chat` fallback behavior | ✅ Passed |
| `test_api_chat_validation_empty` | Validates HTTP 400 Bad Request on empty payloads | ✅ Passed |

**Result: 17 Passed / 17 Total (100% Passing)**

---

## 🌐 Deployment Guide

### Frontend Deployment (Vercel)
1. Push the repository to GitHub.
2. Sign in to [Vercel](https://vercel.com) and click **"Add New Project"**.
3. Select your GitHub repository.
4. Set **Root Directory** to `frontend`.
5. Under **Environment Variables**, add:
   - `VITE_API_BASE_URL`: `https://your-backend-service.onrender.com/api`
6. Click **Deploy**.

---

### Backend Deployment (Render)
1. Sign in to [Render](https://render.com).
2. Click **"New +"** and choose **"Web Service"**.
3. Connect your GitHub repository.
4. Set:
   - **Root Directory:** `backend`
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**.
6. Copy the assigned URL (e.g. `https://intellifaq-backend.onrender.com`) and paste it as `VITE_API_BASE_URL` in your frontend environment variables.

---

## 📸 Screenshots & UI Showcase

### 1. Welcome Screen (Dark & Light Theme)
Features the hero greeting, explanation of the local NLP pipeline, and clickable FAQ suggestion cards.

### 2. Live Chat & Similarity Score Badge
Shows the user's question, the chatbot's verified answer, the exact matched FAQ question, and the cosine similarity percentage with clear textual matching disclaimer.

### 3. Related Questions & Response Toolbar
Interactive chips under bot responses allow users to quickly explore related concepts. Responses can be copied with one click or rated as helpful/unhelpful.

### 4. Collapsible Sidebar & Knowledge Hub
Browse the full catalog of indexed FAQs by domain, inspect recent conversations, or adjust the NLP similarity threshold slider in real-time.

---

## 📜 License & Acknowledgments

This project is developed by **Zubair Khurshid** as part of the **CodeAlpha Artificial Intelligence Internship (Task 2: FAQ Chatbot)**.

Built with:
- [FastAPI](https://fastapi.tiangolo.com/)
- [Scikit-Learn](https://scikit-learn.org/)
- [NLTK](https://www.nltk.org/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Lucide Icons](https://lucide.dev/)
