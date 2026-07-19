import os
from pydantic import BaseSettings, AnyHttpUrl, root_validator
from typing import List, Optional


class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_KEY: Optional[str] = None
    SUPABASE_ANON_KEY: Optional[str] = None
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173",
        "http://localhost:4173",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:4173",
    ]

    @root_validator(pre=True)
    def populate_keys(cls, values):
        key = values.get("SUPABASE_KEY") or values.get("SUPABASE_ANON_KEY")
        if not key:
            raise ValueError("SUPABASE_KEY or SUPABASE_ANON_KEY must be set in environment")
        values["SUPABASE_KEY"] = key
        return values

    class Config:
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), ".env")
        env_file_encoding = "utf-8"


settings = Settings()

