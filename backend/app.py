"""
InsightAI Backend - Main FastAPI Application
Enterprise AI Business Intelligence Platform
"""

import os
import json
import uuid
import logging
from typing import List, Optional
from datetime import datetime
from pathlib import Path

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, JSONResponse
from pydantic import BaseModel, Field
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parent.parent / ".env", override=True)

from ingestion.processor import FileProcessor
from retrieval.hybrid_retriever import HybridRetriever
from generation.llm_engine import LLMEngine
from generation.prompt_builder import PromptBuilder
from generation.report_generator import ReportGenerator
import time

# ── Logging ──────────────────────────────────────────────────────────────
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("insightai")

# ── FastAPI App ──────────────────────────────────────────────────────────
app = FastAPI(
    title="InsightAI – AI Business Analyst",
    description="Enterprise-grade AI analytics platform",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Data directory ───────────────────────────────────────────────────────
DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

# ── Global state ─────────────────────────────────────────────────────────
file_processor = FileProcessor(str(DATA_DIR))
retriever = HybridRetriever()
llm_engine = LLMEngine()
prompt_builder = PromptBuilder()
report_gen = ReportGenerator()

# Chat memory (session-based)
chat_memory: dict[str, list] = {}
# Structured data store (CSV/XLSX table data)
structured_store: dict[str, dict] = {}
# Uploaded file registry
file_registry: list[dict] = []


# ── Pydantic Models ─────────────────────────────────────────────────────
class AskRequest(BaseModel):
    question: str
    session_id: Optional[str] = "default"


class KPI(BaseModel):
    metric: str
    values: List[float] = []
    labels: List[str] = []


class InsightResponse(BaseModel):
    answer: str = ""
    insights: List[str] = []
    trends: List[str] = []
    risks: List[str] = []
    opportunities: List[str] = []
    kpis: List[KPI] = []
    sources: List[str] = []
    session_id: str = "default"
    performance: Optional[dict] = Field(default_factory=dict)
    debug: Optional[dict] = Field(default_factory=dict)


class HealthResponse(BaseModel):
    status: str
    version: str
    files_loaded: int
    chunks_indexed: int
    timestamp: str


# ── Health ──────────────────────────────────────────────────────────────
@app.get("/health", response_model=HealthResponse)
async def health_check():
    return HealthResponse(
        status="healthy",
        version="1.0.0",
        files_loaded=len(file_registry),
        chunks_indexed=retriever.total_chunks,
        timestamp=datetime.utcnow().isoformat(),
    )


# ── Upload ──────────────────────────────────────────────────────────────
@app.post("/upload")
async def upload_files(files: List[UploadFile] = File(...)):
    results = []
    for file in files:
        file_id = str(uuid.uuid4())[:8]
        ext = Path(file.filename).suffix.lower()

        if ext not in [".pdf", ".txt", ".md", ".csv", ".xlsx"]:
            results.append({
                "filename": file.filename,
                "status": "error",
                "message": f"Unsupported file type: {ext}",
            })
            continue

        # Save file
        save_path = DATA_DIR / f"{file_id}_{file.filename}"
        content = await file.read()
        with open(save_path, "wb") as f:
            f.write(content)

        try:
            # Process file
            processed = file_processor.process(str(save_path), ext)

            # Index text chunks
            if processed.get("chunks"):
                retriever.add_documents(
                    processed["chunks"],
                    metadata_list=[
                        {"source": file.filename, "file_id": file_id, "chunk_id": i}
                        for i in range(len(processed["chunks"]))
                    ],
                )

            # Store structured data
            if processed.get("structured_data"):
                structured_store[file_id] = {
                    "filename": file.filename,
                    "data": processed["structured_data"],
                    "kpis": processed.get("kpis", []),
                }

            file_registry.append({
                "file_id": file_id,
                "filename": file.filename,
                "type": ext,
                "size": len(content),
                "chunks": len(processed.get("chunks", [])),
                "has_structured_data": bool(processed.get("structured_data")),
                "uploaded_at": datetime.utcnow().isoformat(),
            })

            results.append({
                "filename": file.filename,
                "file_id": file_id,
                "status": "success",
                "chunks": len(processed.get("chunks", [])),
                "has_structured_data": bool(processed.get("structured_data")),
                "kpi_count": len(processed.get("kpis", [])),
            })
            logger.info(f"Processed {file.filename}: {len(processed.get('chunks', []))} chunks")

        except Exception as e:
            logger.error(f"Error processing {file.filename}: {e}")
            results.append({
                "filename": file.filename,
                "status": "error",
                "message": str(e),
            })

    return {"results": results, "total_files": len(file_registry)}


# ── Ask ─────────────────────────────────────────────────────────────────
@app.post("/ask", response_model=InsightResponse)
async def ask_question(req: AskRequest):
    if retriever.total_chunks == 0 and not structured_store:
        raise HTTPException(
            status_code=400,
            detail="No documents uploaded yet. Please upload files first.",
        )

    session_id = req.session_id or "default"
    
    start_time = time.time()
    logger.info(f"Processing question: {req.question}")
    
    # Retrieve relevant context
    retrieval_start = time.time()
    retrieved = retriever.search(req.question, top_k=int(os.getenv("TOP_K", "5")))
    retrieval_time = (time.time() - retrieval_start) * 1000
    
    rerank_time = 0.0 # included in retrieval search
    
    context_chunks = [r["text"] for r in retrieved]
    sources = list({r["metadata"].get("source", "Unknown") for r in retrieved})
    rerank_scores = [float(r["score"]) for r in retrieved]

    # Gather structured data context
    struct_context = ""
    all_kpis_from_data = []
    for fid, sdata in structured_store.items():
        if sdata.get("data"):
            struct_context += f"\n\n[Structured Data from {sdata['filename']}]:\n"
            # Provide summary of structured data
            if isinstance(sdata["data"], list) and len(sdata["data"]) > 0:
                headers = list(sdata["data"][0].keys()) if isinstance(sdata["data"][0], dict) else []
                struct_context += f"Columns: {', '.join(headers)}\n"
                for row in sdata["data"][:20]:  # limit rows
                    struct_context += json.dumps(row) + "\n"
        if sdata.get("kpis"):
            all_kpis_from_data.extend(sdata["kpis"])

    # Chat memory
    history = chat_memory.get(session_id, [])

    # Build prompt
    prompt = prompt_builder.build(
        question=req.question,
        context_chunks=context_chunks,
        structured_context=struct_context,
        chat_history=history[-6:],  # last 3 exchanges
    )

    # Generate response
    llm_start = time.time()
    raw_response = await llm_engine.generate(prompt)
    llm_time = (time.time() - llm_start) * 1000

    # Parse structured response
    parsed = _parse_llm_response(raw_response, sources, all_kpis_from_data)

    # Update chat memory
    history.append({"role": "user", "content": req.question})
    history.append({
        "role": "assistant", 
        "content": parsed.answer,
        "data": parsed.model_dump() if hasattr(parsed, "model_dump") else parsed.dict()
    })
    chat_memory[session_id] = history

    total_time = (time.time() - start_time) * 1000
    
    parsed.performance = {
        "retrieval_ms": round(retrieval_time, 2),
        "rerank_ms": round(rerank_time, 2),
        "llm_ms": round(llm_time, 2),
        "total_ms": round(total_time, 2)
    }
    
    parsed.debug = {
        "retrieved_docs": context_chunks,
        "latency_ms": round(total_time, 2),
        "model_used": os.getenv("LLM_PROVIDER", "openai"),
        "rerank_scores": rerank_scores,
        "logs": [
            f"Retrieved {len(context_chunks)} chunks in {round(retrieval_time, 2)}ms",
            f"LLM generation took {round(llm_time, 2)}ms"
        ]
    }
    
    if os.getenv("ENVIRONMENT", "development").lower() == "production":
        parsed.debug = {}
    
    parsed.session_id = session_id
    return parsed


def _parse_llm_response(raw: str, sources: list, extracted_kpis: list) -> InsightResponse:
    """Parse LLM response — try JSON first, fallback to text."""
    # Try to extract JSON from the response
    try:
        # Find JSON block in response
        json_start = raw.find("{")
        json_end = raw.rfind("}") + 1
        if json_start != -1 and json_end > json_start:
            json_str = raw[json_start:json_end]
            data = json.loads(json_str)
            kpis = []
            for k in data.get("kpis", []):
                if isinstance(k, dict):
                    kpis.append(KPI(
                        metric=k.get("metric", "Unknown"),
                        values=[float(v) for v in k.get("values", []) if _is_numeric(v)],
                        labels=[str(l) for l in k.get("labels", [])],
                    ))
            if not kpis and extracted_kpis:
                # Fallback: Add extracted KPIs from structured data if LLM found none
                for ek in extracted_kpis:
                    if isinstance(ek, dict):
                        kpis.append(KPI(
                            metric=ek.get("metric", "Unknown"),
                            values=[float(v) for v in ek.get("values", []) if _is_numeric(v)],
                            labels=[str(l) for l in ek.get("labels", [])],
                        ))

            return InsightResponse(
                answer=data.get("answer", raw),
                insights=data.get("insights", []),
                trends=data.get("trends", []),
                risks=data.get("risks", []),
                opportunities=data.get("opportunities", []),
                kpis=kpis,
                sources=[f"[{i+1}] {s}" for i, s in enumerate(sources)],
            )
    except (json.JSONDecodeError, ValueError, KeyError):
        pass

    # Fallback: return raw text as answer
    kpis = []
    for ek in extracted_kpis:
        if isinstance(ek, dict):
            kpis.append(KPI(
                metric=ek.get("metric", "Unknown"),
                values=[float(v) for v in ek.get("values", []) if _is_numeric(v)],
                labels=[str(l) for l in ek.get("labels", [])],
            ))

    return InsightResponse(
        answer=raw.strip(),
        insights=[],
        trends=[],
        risks=[],
        opportunities=[],
        kpis=kpis,
        sources=[f"[{i+1}] {s}" for i, s in enumerate(sources)],
    )


def _is_numeric(val) -> bool:
    try:
        float(val)
        return True
    except (ValueError, TypeError):
        return False


# ── Export ───────────────────────────────────────────────────────────────
@app.get("/export")
async def export_data(format: str = Query("csv", enum=["csv", "json"])):
    if not structured_store:
        raise HTTPException(status_code=400, detail="No structured data available for export.")

    # Merge all structured data
    all_rows = []
    for fid, sdata in structured_store.items():
        if isinstance(sdata.get("data"), list):
            for row in sdata["data"]:
                if isinstance(row, dict):
                    row_copy = dict(row)
                    row_copy["_source_file"] = sdata.get("filename", "unknown")
                    all_rows.append(row_copy)

    if not all_rows:
        raise HTTPException(status_code=400, detail="No tabular data available.")

    if format == "json":
        return JSONResponse(content=all_rows)

    # CSV export
    import csv
    import io

    output = io.StringIO()
    if all_rows:
        fieldnames = list(all_rows[0].keys())
        writer = csv.DictWriter(output, fieldnames=fieldnames)
        writer.writeheader()
        for row in all_rows:
            writer.writerow({k: row.get(k, "") for k in fieldnames})

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=insightai_export.csv"},
    )


# ── Files list ──────────────────────────────────────────────────────────
@app.get("/files")
async def list_files():
    return {"files": file_registry}


class ReportRequest(BaseModel):
    title: str = "Business Analysis Report"
    summary: str = ""
    insights: List[str] = []
    trends: List[str] = []
    risks: List[str] = []
    opportunities: List[str] = []
    recommendations: List[str] = []
    kpis: List[dict] = []
    sources: List[str] = []


@app.post("/report")
async def generate_report(req: ReportRequest):
    try:
        data = req.dict()
        pdf_bytes = report_gen.generate_pdf(req.title, data)
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={"Content-Disposition": "attachment; filename=insight_report.pdf"},
        )
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ── History ─────────────────────────────────────────────────────────────
@app.get("/history")
async def get_history(session_id: str = "default"):
    return {"history": chat_memory.get(session_id, [])}


# ── Clear ───────────────────────────────────────────────────────────────
@app.post("/clear")
async def clear_all():
    global file_registry, structured_store, chat_memory
    file_registry = []
    structured_store = {}
    chat_memory = {}
    retriever.clear()
    return {"status": "cleared"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
