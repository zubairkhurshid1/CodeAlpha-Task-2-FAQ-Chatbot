"""
IntelliFAQ - Main FastAPI Application
"""

import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.chat import router as chat_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure NLP resources and FAQ matcher index are loaded
    print("IntelliFAQ NLP Engine initialized successfully.")
    yield
    # Shutdown logic if needed
    print("IntelliFAQ shutting down.")


app = FastAPI(
    title="IntelliFAQ Backend API",
    description="Intelligent NLP-powered FAQ Chatbot using Scikit-Learn TF-IDF and Cosine Similarity.",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for frontend clients (Vite dev server, Vercel deployments, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for local dev and cloud deployment
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(chat_router)


@app.get("/", summary="Root endpoint")
async def root():
    return {
        "message": "Welcome to IntelliFAQ API - Your Intelligent FAQ Assistant",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
