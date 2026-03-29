# InsightAI – AI Business Analyst

> **Enterprise-grade AI-powered Business Intelligence platform** that ingests multiple file formats, performs RAG-based analysis, extracts KPIs, visualizes trends, and exports Tableau-compatible data.

![Platform](https://img.shields.io/badge/Platform-Web-blue) ![License](https://img.shields.io/badge/License-MIT-green) ![Status](https://img.shields.io/badge/Status-Production-brightgreen)

---

## 🚀 Features

- **Multi-format ingestion**: PDF, TXT/Markdown, CSV, Excel (.xlsx)
- **Hybrid RAG retrieval**: BM25 + FAISS vector search with score fusion
- **AI-powered analysis**: Structured insights, trends, risks, opportunities
- **KPI extraction engine**: Automatic metric detection from tabular data
- **Interactive charts**: Line, Bar, Area charts via Recharts
- **Tableau export**: CSV and JSON export for external BI tools
- **Chat memory**: Conversational context across questions
- **Premium UI**: Dark mode, glassmorphism, Framer Motion animations
- **Source citations**: Every claim backed by document references

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Sidebar  │ │   Chat   │ │  Charts  │ │ Insights │      │
│  │ + Upload │ │ Messages │ │ Recharts │ │  Panel   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP / JSON
┌──────────────────────────┴──────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │ Ingestion│ │ Retrieval│ │ LLM      │ │  Export  │      │
│  │   PDF    │ │ BM25     │ │ OpenRouter│ │  CSV/JSON│      │
│  │   CSV    │ │ FAISS    │ │ Prompt   │ │          │      │
│  │   XLSX   │ │ Hybrid   │ │ Builder  │ │          │      │
│  │   TXT    │ │          │ │          │ │          │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📋 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### 1. Backend Setup

```bash
cd backend
pip install -r requirements.txt
python app.py
```

The API server starts at `http://localhost:8000`

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend starts at `http://localhost:5173`

### 3. Environment Variables

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=your_api_key_here
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=meta-llama/llama-3.1-8b-instruct:free
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

---

## 🔌 API Reference

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | System health check |
| `/upload` | POST | Upload files (multipart) |
| `/ask` | POST | Ask a business question |
| `/export` | GET | Export data (csv/json) |
| `/files` | GET | List uploaded files |
| `/clear` | POST | Clear all data |

### Response Format

```json
{
  "answer": "Analysis text...",
  "insights": ["Key insight 1", "Key insight 2"],
  "trends": ["Revenue grew 15% YoY"],
  "risks": ["Market concentration risk"],
  "opportunities": ["Expansion into APAC"],
  "kpis": [
    {
      "metric": "Revenue",
      "values": [100, 140, 160],
      "labels": ["2021", "2022", "2023"]
    }
  ],
  "sources": ["[1] annual_report.pdf", "[2] financials.csv"]
}
```

---

## 📁 Project Structure

```
InsightAI/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Chat.jsx          # Chat interface
│   │   │   ├── Message.jsx       # Message rendering
│   │   │   ├── ChartPanel.jsx    # KPI dashboard
│   │   │   ├── InsightPanel.jsx  # Insights display
│   │   │   ├── Sidebar.jsx       # Navigation + upload
│   │   │   ├── Upload.jsx        # Drag & drop upload
│   │   │   ├── ExportButton.jsx  # Data export
│   │   │   └── SourceCard.jsx    # Citations
│   │   ├── services/
│   │   │   └── api.js            # API client
│   │   ├── App.jsx               # Main application
│   │   ├── main.jsx              # Entry point
│   │   └── index.css             # Design system
│   └── package.json
├── backend/
│   ├── ingestion/
│   │   ├── pdf_loader.py         # PDF text extraction
│   │   ├── text_loader.py        # TXT/MD loading
│   │   ├── csv_loader.py         # CSV parsing + KPIs
│   │   ├── excel_loader.py       # XLSX multi-sheet
│   │   └── processor.py          # File orchestrator
│   ├── retrieval/
│   │   └── hybrid_retriever.py   # BM25 + FAISS
│   ├── generation/
│   │   ├── llm_engine.py         # OpenRouter LLM
│   │   └── prompt_builder.py     # Structured prompts
│   ├── app.py                    # FastAPI application
│   └── requirements.txt
├── data/                          # Uploaded files
├── .env                           # Configuration
├── README.md
└── skills.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite, Tailwind CSS v4 |
| UI Components | Framer Motion, Recharts, Lucide Icons |
| Backend | Python 3.10+, FastAPI, Pydantic v2 |
| RAG Pipeline | BM25 (rank-bm25) + FAISS (faiss-cpu) |
| Embeddings | sentence-transformers/all-MiniLM-L6-v2 |
| LLM | OpenRouter (model-agnostic) |
| File Processing | PyPDF2, Pandas, openpyxl |

---

## 📝 License

MIT License
