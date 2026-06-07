from fastapi import APIRouter
from fastapi.responses import RedirectResponse

router = APIRouter()

@router.get("/test-ui")
async def get_test_ui():
    """Redirect legacy /test-ui to the enhanced /v2/test-ui interface."""
    return RedirectResponse(url="/v2/test-ui")
