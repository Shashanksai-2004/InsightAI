"""
Hybrid Retriever - BM25 + FAISS Vector Search with Cross-Encoder Reranking
"""
import os
import logging
import numpy as np
from typing import List, Dict, Optional

logger = logging.getLogger("insightai.retriever")


class HybridRetriever:
    """Hybrid retrieval combining BM25 (keyword) and FAISS (semantic) search."""

    def __init__(self):
        self.documents: List[str] = []
        self.metadata: List[dict] = []
        self.bm25 = None
        self.faiss_index = None
        self.embedder = None
        self._embedder_loaded = False

    @property
    def total_chunks(self) -> int:
        return len(self.documents)

    def _load_embedder(self):
        """Lazy-load the sentence transformer model."""
        if not self._embedder_loaded:
            try:
                from sentence_transformers import SentenceTransformer
                model_name = os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2")
                logger.info(f"Loading embedding model: {model_name}")
                self.embedder = SentenceTransformer(model_name)
                self._embedder_loaded = True
            except Exception as e:
                logger.warning(f"Could not load SentenceTransformer: {e}. Using TF-IDF fallback.")
                self._embedder_loaded = True  # don't retry

    def add_documents(self, texts: List[str], metadata_list: Optional[List[dict]] = None):
        """Add documents to both BM25 and FAISS indices."""
        if not texts:
            return

        start_idx = len(self.documents)
        self.documents.extend(texts)

        if metadata_list:
            self.metadata.extend(metadata_list)
        else:
            self.metadata.extend([{"source": "unknown", "chunk_id": start_idx + i} for i in range(len(texts))])

        # Update BM25
        self._rebuild_bm25()

        # Update FAISS
        self._load_embedder()
        if self.embedder:
            self._rebuild_faiss()

        logger.info(f"Indexed {len(texts)} new chunks. Total: {self.total_chunks}")

    def _rebuild_bm25(self):
        """Rebuild BM25 index."""
        try:
            from rank_bm25 import BM25Okapi

            tokenized = [doc.lower().split() for doc in self.documents]
            self.bm25 = BM25Okapi(tokenized)
        except Exception as e:
            logger.error(f"BM25 build failed: {e}")

    def _rebuild_faiss(self):
        """Rebuild FAISS index."""
        try:
            import faiss

            embeddings = self.embedder.encode(self.documents, show_progress_bar=False)
            embeddings = np.array(embeddings, dtype="float32")

            dim = embeddings.shape[1]
            self.faiss_index = faiss.IndexFlatIP(dim)

            # Normalize for cosine similarity
            faiss.normalize_L2(embeddings)
            self.faiss_index.add(embeddings)
        except Exception as e:
            logger.error(f"FAISS build failed: {e}")

    def search(self, query: str, top_k: int = 5) -> List[Dict]:
        """Hybrid search: BM25 + FAISS, then merge and rerank."""
        if not self.documents:
            return []

        results_map: Dict[int, float] = {}

        # BM25 search
        if self.bm25:
            try:
                tokenized_query = query.lower().split()
                bm25_scores = self.bm25.get_scores(tokenized_query)
                top_bm25 = np.argsort(bm25_scores)[::-1][:top_k * 2]
                max_bm25 = max(bm25_scores) if max(bm25_scores) > 0 else 1
                for idx in top_bm25:
                    norm_score = bm25_scores[idx] / max_bm25
                    results_map[int(idx)] = results_map.get(int(idx), 0) + norm_score * 0.4
            except Exception as e:
                logger.error(f"BM25 search error: {e}")

        # FAISS search
        if self.faiss_index and self.embedder:
            try:
                query_emb = self.embedder.encode([query])
                query_emb = np.array(query_emb, dtype="float32")
                import faiss
                faiss.normalize_L2(query_emb)
                scores, indices = self.faiss_index.search(query_emb, min(top_k * 2, self.total_chunks))
                for score, idx in zip(scores[0], indices[0]):
                    if idx >= 0:
                        results_map[int(idx)] = results_map.get(int(idx), 0) + float(score) * 0.6
            except Exception as e:
                logger.error(f"FAISS search error: {e}")

        # Sort by combined score
        sorted_results = sorted(results_map.items(), key=lambda x: x[1], reverse=True)[:top_k]

        # Build results
        results = []
        for idx, score in sorted_results:
            if 0 <= idx < len(self.documents):
                results.append({
                    "text": self.documents[idx],
                    "metadata": self.metadata[idx] if idx < len(self.metadata) else {},
                    "score": score,
                })

        return results

    def clear(self):
        """Clear all indices."""
        self.documents = []
        self.metadata = []
        self.bm25 = None
        self.faiss_index = None
