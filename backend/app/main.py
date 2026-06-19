from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from app.modules.auth.router import router as auth_router
from app.modules.vendor.router import router as vendor_router
from app.modules.owner.router import router as owner_router, canteen_router as owner_canteen_router
from app.modules.admin.router import router as admin_router
from app.modules.webhooks.router import router as webhook_router
from app.modules.menu.router import router as menu_router
from app.modules.orders.router import router as orders_router, payments_router, staff_router as orders_staff_router, owner_router as orders_owner_router, notifications_router, dashboard_router
from app.modules.student.router import router as student_router

app = FastAPI(
    title="BiteNow API",
    description="Smart college canteen management system",
    version="1.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000", 
    "http://127.0.0.1:3000", 
    "http://localhost:5173", 
    "http://127.0.0.1:5173",
    "https://bite-now-alpha.vercel.app"
]

frontend_url = os.getenv("FRONTEND_URL")
if frontend_url:
    clean_url = frontend_url.strip().rstrip("/")
    if clean_url and clean_url not in origins:
        origins.append(clean_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(vendor_router)
app.include_router(owner_router)
app.include_router(owner_canteen_router)
app.include_router(admin_router)
app.include_router(webhook_router)
app.include_router(menu_router)
app.include_router(orders_router)
app.include_router(payments_router)
app.include_router(orders_staff_router)
app.include_router(orders_owner_router)
app.include_router(notifications_router)
app.include_router(dashboard_router)
app.include_router(student_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to BiteNow API"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}

from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request
import logging

logger = logging.getLogger("uvicorn.error")

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    logger.error(f"422 Validation Error: {exc.errors()}")
    logger.error(f"Body: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors()},
    )
