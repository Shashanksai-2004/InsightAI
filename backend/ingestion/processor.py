"""
File Processor - Orchestrates file ingestion based on type
Handles chunking for text data and structured extraction for tabular data
"""
import logging
import re
from typing import Dict, List
from pathlib import Path

from ingestion.pdf_loader import load_pdf
from ingestion.text_loader import load_text
from ingestion.csv_loader import load_csv
from ingestion.excel_loader import load_excel

logger = logging.getLogger("insightai.processor")

CHUNK_SIZE = 512
CHUNK_OVERLAP = 50


class FileProcessor:
    def __init__(self, data_dir: str):
        self.data_dir = data_dir

    def process(self, file_path: str, ext: str) -> Dict:
        """
        Process a file based on its extension.
        Returns dict with: chunks, structured_data, kpis
        """
        result = {
            "chunks": [],
            "structured_data": None,
            "kpis": [],
        }

        if ext in [".pdf"]:
            text = load_pdf(file_path)
            result["chunks"] = self._chunk_text(text)

        elif ext in [".txt", ".md"]:
            text = load_text(file_path)
            result["chunks"] = self._chunk_text(text)

        elif ext in [".csv"]:
            text, structured, kpis = load_csv(file_path)
            result["chunks"] = self._chunk_text(text)
            result["structured_data"] = structured
            result["kpis"] = kpis

        elif ext in [".xlsx"]:
            text, structured, kpis = load_excel(file_path)
            result["chunks"] = self._chunk_text(text)
            result["structured_data"] = structured
            result["kpis"] = kpis

        return result

    def _chunk_text(self, text: str, chunk_size: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP) -> List[str]:
        """Split text into overlapping chunks."""
        if not text.strip():
            return []

        # Split by paragraphs first
        paragraphs = re.split(r'\n\n+', text)
        chunks = []
        current_chunk = ""

        for para in paragraphs:
            para = para.strip()
            if not para:
                continue

            if len(current_chunk) + len(para) + 1 <= chunk_size:
                current_chunk += (" " + para if current_chunk else para)
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                # If paragraph itself is too long, split by sentences
                if len(para) > chunk_size:
                    sentences = re.split(r'(?<=[.!?])\s+', para)
                    current_chunk = ""
                    for sent in sentences:
                        if len(current_chunk) + len(sent) + 1 <= chunk_size:
                            current_chunk += (" " + sent if current_chunk else sent)
                        else:
                            if current_chunk:
                                chunks.append(current_chunk.strip())
                            current_chunk = sent
                else:
                    current_chunk = para

        if current_chunk.strip():
            chunks.append(current_chunk.strip())

        # Add overlap between chunks
        if overlap > 0 and len(chunks) > 1:
            overlapped = [chunks[0]]
            for i in range(1, len(chunks)):
                prev_tail = chunks[i-1][-overlap:] if len(chunks[i-1]) > overlap else chunks[i-1]
                overlapped.append(prev_tail + " " + chunks[i])
            chunks = overlapped

        logger.info(f"Created {len(chunks)} chunks from text ({len(text)} chars)")
        return chunks
