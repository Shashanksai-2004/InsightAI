"""
Prompt Builder - Constructs structured prompts for the LLM
"""
import logging

logger = logging.getLogger("insightai.prompt_builder")


class PromptBuilder:
    """Build structured prompts for business intelligence analysis."""

    SYSTEM_TEMPLATE = """You are InsightAI, an expert AI Business Analyst.
Analyze the provided data and context to answer the user's question.

RULES:
1. Be specific and data-driven in your analysis
2. Extract numerical KPIs when available
3. Identify trends, risks, and opportunities
4. Cite sources using [1], [2], etc.
5. ALWAYS respond in valid JSON format

RESPONSE FORMAT (strict JSON):
{{
    "answer": "Your comprehensive analysis here...",
    "insights": ["Key insight 1", "Key insight 2"],
    "trends": ["Trend 1", "Trend 2"],
    "risks": ["Risk 1", "Risk 2"],
    "opportunities": ["Opportunity 1", "Opportunity 2"],
    "kpis": [
        {{
            "metric": "Metric Name",
            "values": [100, 140, 160],
            "labels": ["2021", "2022", "2023"]
        }}
    ],
    "sources": ["[1]", "[2]"]
}}
"""

    def build(
        self,
        question: str,
        context_chunks: list = None,
        structured_context: str = "",
        chat_history: list = None,
    ) -> str:
        """Build the full prompt."""
        parts = [self.SYSTEM_TEMPLATE]

        # Add context chunks
        if context_chunks:
            parts.append("\n--- RETRIEVED CONTEXT ---")
            for i, chunk in enumerate(context_chunks):
                parts.append(f"\n[Source {i+1}]:\n{chunk}")

        # Add structured data context
        if structured_context:
            parts.append(f"\n--- STRUCTURED DATA ---\n{structured_context}")

        # Add chat history
        if chat_history:
            parts.append("\n--- CONVERSATION HISTORY ---")
            for msg in chat_history:
                role = msg.get("role", "user")
                content = msg.get("content", "")
                parts.append(f"{role.upper()}: {content}")

        # Add question
        parts.append(f"\n--- USER QUESTION ---\n{question}")
        parts.append("\nRespond with valid JSON only:")

        prompt = "\n".join(parts)
        logger.info(f"Built prompt ({len(prompt)} chars)")
        return prompt
