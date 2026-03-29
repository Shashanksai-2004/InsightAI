"""
Text/Markdown Loader - Load and clean text files
"""
import logging
import re
from pathlib import Path

logger = logging.getLogger("insightai.text_loader")


def load_text(file_path: str) -> str:
    """Load and clean a text or markdown file."""
    try:
        path = Path(file_path)
        text = path.read_text(encoding="utf-8", errors="replace")

        # Basic cleaning
        text = re.sub(r'\n{3,}', '\n\n', text)  # collapse multiple newlines
        text = text.strip()

        logger.info(f"Loaded {len(text)} chars from {path.name}")
        return text
    except Exception as e:
        logger.error(f"Text loading failed: {e}")
        raise ValueError(f"Failed to read text file: {e}")
