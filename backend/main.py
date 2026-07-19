from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from config import settings
from routers.transactions import router as transactions_router
from routers.customers import router as customers_router
from routers.nudges import router as nudges_router

app = FastAPI(title="Hisaab AI API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(transactions_router)
app.include_router(customers_router)
app.include_router(nudges_router)


@app.get("/")
async def health_check():
    return {"status": "ok", "service": "Hisaab AI"}


@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "Route not found"},
    )


@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc):
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
    )
