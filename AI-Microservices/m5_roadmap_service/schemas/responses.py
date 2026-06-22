from pydantic import BaseModel
from typing import Dict, Optional, Any

class StandardResponse(BaseModel):
    success: bool
    data: Dict[str, Any]
    error: Optional[str] = None
