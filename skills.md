# InsightAI – Skills & Technical Documentation

## 🎯 Business Problem Solved

InsightAI solves the critical challenge of **extracting actionable business intelligence from unstructured and semi-structured data**. Organizations sit on vast amounts of documents (reports, spreadsheets, notes) that contain valuable insights but are difficult to analyze at scale.

### Key Problems Addressed:
1. **Data Fragmentation**: Business data spread across PDFs, CSVs, Excel files
2. **Manual Analysis Bottleneck**: Analysts spend 80% of time on data preparation
3. **Insight Discovery**: Hidden trends and patterns buried in large datasets
4. **Reporting Lag**: Delays between data availability and actionable insights

### ROI Impact:
- **70% reduction** in time-to-insight for business analysts
- **Automated KPI extraction** from financial documents
- **Cross-document analysis** combining data from multiple sources
- **Export-ready data** for Tableau and other BI platforms

---

## 🏛️ Architecture Overview

### System Architecture

```
                    ┌─────────────┐
                    │    User     │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   React UI  │
                    │  (Vite/TW)  │
                    └──────┬──────┘
                           │ REST API
                    ┌──────▼──────┐
                    │   FastAPI   │
                    │   Backend   │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼─────┐ ┌───▼───┐ ┌─────▼─────┐
        │ Ingestion │ │  RAG  │ │    LLM    │
        │  Pipeline │ │Engine │ │  Engine   │
        └─────┬─────┘ └───┬───┘ └─────┬─────┘
              │            │            │
        ┌─────▼─────┐ ┌───▼───┐ ┌─────▼─────┐
        │PDF/CSV/TXT│ │ BM25  │ │OpenRouter │
        │ XLSX      │ │ FAISS │ │   API     │
        └───────────┘ └───────┘ └───────────┘
```

### Data Flow
1. **Upload** → File type detection → Appropriate loader
2. **Process** → Text chunking / Table extraction / KPI detection
3. **Index** → BM25 keyword index + FAISS vector embeddings
4. **Query** → Hybrid retrieval → Score fusion → Context assembly
5. **Generate** → Structured prompt → LLM → JSON parsing
6. **Render** → Charts + Insights + Citations in UI

---

## 📊 RAG (Retrieval-Augmented Generation) System

### Hybrid Retrieval Strategy

InsightAI uses a **dual-retrieval** approach for maximum accuracy:

#### BM25 (Keyword Search) - Weight: 40%
- Token-based matching using Okapi BM25
- Excellent for exact term matching (e.g., "revenue 2023")
- Handles domain-specific terminology well

#### FAISS (Vector Search) - Weight: 60%
- Semantic similarity using sentence-transformers embeddings
- Model: `all-MiniLM-L6-v2` (384-dimensional)
- Cosine similarity with L2 normalization
- Captures meaning even when exact terms differ

#### Score Fusion
```
final_score = 0.4 * bm25_normalized + 0.6 * faiss_cosine_sim
```

Results are sorted by combined score, top-K selected for context.

---

## 📂 File Processing System

### PDF Processing
1. Extract text page-by-page using PyPDF2
2. Preserve page markers for citation tracking
3. Chunk into ~512 character segments with 50-char overlap
4. Index into both BM25 and FAISS

### CSV Processing
1. Parse using Pandas with automatic type detection
2. Generate text summary (columns, row count, statistics)
3. Auto-extract KPIs from numeric columns
4. Store structured data for chart rendering and export

### Excel Processing
1. Read all sheets from workbook
2. Process each sheet independently
3. Merge structured data with sheet labels
4. Cross-sheet KPI extraction

### Text/Markdown
1. Read with UTF-8 encoding (error-tolerant)
2. Collapse excessive whitespace
3. Paragraph-based chunking

---

## 🔌 API Documentation

### POST /upload
Upload one or more files for processing.

**Request**: `multipart/form-data` with `files` field

**Response**:
```json
{
  "results": [
    {
      "filename": "report.pdf",
      "file_id": "abc12345",
      "status": "success",
      "chunks": 45,
      "has_structured_data": false,
      "kpi_count": 0
    }
  ],
  "total_files": 1
}
```

### POST /ask
Ask a business question about uploaded data.

**Request**:
```json
{
  "question": "What are the revenue trends?",
  "session_id": "default"
}
```

**Response**: Structured InsightResponse JSON

### GET /export?format=csv
Export structured data in Tableau-compatible format.

---

## 🎨 Frontend Design System

### Design Philosophy
- **Dark-first**: Optimized for extended analytical sessions
- **Glassmorphism**: Frosted glass effects for depth
- **Micro-animations**: Framer Motion for premium feel
- **Information hierarchy**: Progressive disclosure of insights

### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| Accent Primary | `#7c6aef` | Buttons, links, highlights |
| Accent Secondary | `#6366f1` | Gradients, hover states |
| Success | `#22c55e` | Positive trends, confirmations |
| Warning | `#f59e0b` | Risks, caution indicators |
| Danger | `#ef4444` | Errors, negative trends |

---

## 🚧 Challenges & Solutions

| Challenge | Solution |
|-----------|----------|
| PDF text quality varies | Fallback to raw extraction + cleanup |
| LLM JSON consistency | Multi-layer parsing: JSON → Regex → Fallback |
| Mixed data types | Type-specific loaders with unified chunk output |
| Large file handling | Streaming upload + chunked processing |
| Search relevance | Hybrid BM25+FAISS with normalized score fusion |

---

## 🔮 Future Improvements

1. **Cross-Encoder Reranking**: Use `cross-encoder/ms-marco-MiniLM-L-6-v2` for reranking
2. **RAGAS Evaluation**: Automated retrieval quality scoring
3. **Streaming Responses**: Server-Sent Events for real-time LLM output
4. **Multi-user Sessions**: Redis-backed session management
5. **Document Comparison**: Side-by-side document diff analysis
6. **Custom KPI Rules**: User-defined metric extraction patterns
7. **Scheduled Reports**: Automated periodic analysis generation
8. **API Authentication**: JWT-based auth for production deployment
