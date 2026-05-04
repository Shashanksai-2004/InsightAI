# InsightAI — AI Business Analyst

> Upload business documents. Ask in plain English. Get cited answers with KPIs, trends, risks, and opportunities.

![Stack](https://img.shields.io/badge/stack-React%2019%20%2B%20FastAPI-1f3a5f) ![License](https://img.shields.io/badge/license-MIT-green)

---

## Demo

**▶ [shashanksai-2004.github.io/InsightAI](https://shashanksai-2004.github.io/InsightAI/)** — 90-second auto-playing pitch. Hosted via GitHub Pages from [`insightai-pitch.html`](insightai-pitch.html).

URL params: `?dev=1` (scene-jump panel), `?scene=N` (jump to scene N).

Run locally: open [`insightai-pitch.html`](insightai-pitch.html) in any browser. No build, no deps.

> Pages setup (one-time): repo **Settings → Pages → Source: `main` / root**.

---

## Features

- **Multi-format ingestion** — PDF, TXT, Markdown, CSV, XLSX
- **Hybrid retrieval** — BM25 + FAISS with score fusion
- **Structured output** — KPIs, insights, trends, risks, opportunities as fields, not chat blob
- **Source citations** — every claim links to a source chunk
- **Interactive charts** — line / bar / area, switchable live
- **Multi-format export** — PDF report, CSV, JSON
- **Dark + light themes**, persisted

---

## Quick Start

```bash
# Backend
cd backend && pip install -r requirements.txt && python app.py
# → http://localhost:8000

# Frontend
cd frontend-v2 && npm install && npm run dev
# → http://localhost:5173
```

`.env` at repo root:

```env
OPENROUTER_API_KEY=your_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=meta-llama/llama-3.1-8b-instruct:free
EMBEDDING_MODEL=sentence-transformers/all-MiniLM-L6-v2
```

`frontend/` (legacy) and `frontend-v2/` (active) both run against the same backend.

---

## API

| Endpoint  | Method | Purpose                                |
|-----------|--------|----------------------------------------|
| `/health` | GET    | Health + stats                         |
| `/upload` | POST   | Upload files (multipart)               |
| `/ask`    | POST   | Ask a question                         |
| `/files`  | GET    | List files                             |
| `/history`| GET    | Session history                        |
| `/report` | POST   | Generate PDF report                    |
| `/export` | GET    | Export `csv` or `json`                 |
| `/clear`  | POST   | Clear all data                         |

`/ask` returns `{ answer, insights[], trends[], risks[], opportunities[], kpis[], sources[], performance{} }`.

---

## Tech Stack

| Layer       | Tech                                                   |
|-------------|--------------------------------------------------------|
| Frontend    | React 19, Vite 6, Tailwind v4, Framer Motion, Recharts |
| Backend     | FastAPI, Pydantic v2                                   |
| Retrieval   | rank-bm25 + faiss-cpu hybrid                           |
| Embeddings  | sentence-transformers/all-MiniLM-L6-v2                 |
| LLM gateway | OpenRouter (model-agnostic)                            |
| Files       | PyPDF2, Pandas, openpyxl, ReportLab                    |

---

## License

MIT
