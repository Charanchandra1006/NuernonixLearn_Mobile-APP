import os
from abc import ABC, abstractmethod
from typing import Optional

class GenAIProvider(ABC):
    @abstractmethod
    def generate_feedback(self, prompt: str, max_tokens: int = 200) -> str:
        pass

class MockGenAIProvider(GenAIProvider):
    def generate_feedback(self, prompt: str, max_tokens: int = 200) -> str:
        # Simulating GenAI which takes longer than ML prediction
        import time
        time.sleep(1.5)
        return "This is a mocked GenAI feedback response. The student should focus on improving their understanding of the core concepts before proceeding to advanced topics."

class GenericOpenAIProvider(GenAIProvider):
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or os.getenv("OPENAI_API_KEY")
        # Initialize direct SDK client here, avoiding LangChain lock-in

    def generate_feedback(self, prompt: str, max_tokens: int = 200) -> str:
        if not self.api_key:
            return "Error: OPENAI_API_KEY not configured."
        # Call openai.ChatCompletion directly
        return "Real GenAI response would go here."

def get_genai_provider() -> GenAIProvider:
    # Factory to switch providers without changing business logic
    env = os.getenv("ENVIRONMENT", "dev")
    if env == "dev":
        return MockGenAIProvider()
    return GenericOpenAIProvider()
