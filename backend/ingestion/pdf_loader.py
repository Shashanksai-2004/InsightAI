"""
PDF Loader - Extract text from PDF documents
"""
import logging
from pathlib import Path

logger = logging.getLogger("insightai.pdf_loader")


def load_pdf(file_path: str) -> str:
    """Extract text from a PDF file."""
    try:
        from PyPDF2 import PdfReader

        reader = PdfReader(file_path)
        text_parts = []
        for i, page in enumerate(reader.pages):
            page_text = page.extract_text()
            if page_text:
                text_parts.append(f"[Page {i+1}]\n{page_text.strip()}")

        full_text = "\n\n".join(text_parts)
        logger.info(f"Extracted {len(full_text)} chars from {Path(file_path).name}")
        return full_text
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        raise ValueError(f"Failed to read PDF: {e}")
