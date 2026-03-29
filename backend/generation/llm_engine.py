"""
LLM Engine - Model-agnostic LLM interface via OpenRouter
"""
import os
import json
import logging
import httpx

logger = logging.getLogger("insightai.llm_engine")


class LLMEngine:
    """Async LLM client using OpenRouter API."""

    def __init__(self):
        self.api_key = os.getenv("OPENROUTER_API_KEY", "")
        self.base_url = os.getenv("OPENROUTER_BASE_URL", "https://openrouter.ai/api/v1")
        self.model = "liquid/lfm-2.5-1.2b-instruct:free"
        if not self.api_key:
            logger.warning("OPENROUTER_API_KEY not set!")

    async def generate(self, prompt: str, max_tokens: int = 2048) -> str:
        """Generate a response from the LLM."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "HTTP-Referer": "https://insightai.app",
            "X-Title": "InsightAI",
        }

        payload = {
            "model": self.model,
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are InsightAI, an expert AI Business Analyst. "
                        "You analyze business data, extract KPIs, identify trends, "
                        "and provide structured insights. Always respond in valid JSON format."
                    ),
                },
                {"role": "user", "content": prompt},
            ],
            "max_tokens": max_tokens,
            "temperature": 0.3,
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{self.base_url}/chat/completions",
                    headers=headers,
                    json=payload,
                )
                response.raise_for_status()
                data = response.json()
                content = data["choices"][0]["message"]["content"]
                logger.info(f"LLM response received ({len(content)} chars)")
                return content
        except httpx.HTTPStatusError as e:
            logger.error(f"LLM API error: {e.response.status_code} - {e.response.text}")
            return json.dumps({
                "answer": f"LLM API error: {e.response.status_code}. Please check your API key.",
                "insights": [],
                "trends": [],
                "risks": [],
                "opportunities": [],
                "kpis": [],
                "sources": [],
            })
        except Exception as e:
            logger.error(f"LLM generation failed: {e}")
            return json.dumps({
                "answer": f"Error generating response: {str(e)}",
                "insights": [],
                "trends": [],
                "risks": [],
                "opportunities": [],
                "kpis": [],
                "sources": [],
            })
