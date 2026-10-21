import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes.api import router as api_router
from app.services.excel_reader import ExcelReaderService

app = FastAPI(
    title="Stellantis General Assembly Shop Assessment Dashboard API",
    description="High-performance backend API powering the Stellantis General Assembly Station Assessment Dashboard, integrating Excel models, persistent configurable operational tables, and live data synchronization.",
    version="1.0.0"
)

# CORS configuration to allow local Vite frontend and hosted environments
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)

@app.on_event("startup")
async def startup_event():
    print("=" * 60)
    print("STELLANTIS GENERAL ASSEMBLY SHOP DASHBOARD BACKEND")
    print("Initializing Excel reader service...")
    try:
        reader = ExcelReaderService()
        tables, discrepancies = reader.read_workbook()
        print(f"Successfully loaded {len(tables)} tables from Excel source.")
        for tid, t in tables.items():
            print(f"  - {t.title}: {len(t.rows)} categories, total={t.total}")
        if discrepancies:
            print(f"Detected {len(discrepancies)} data discrepancies documented in audit.")
    except Exception as e:
        print(f"WARNING: Initial Excel read encountered error: {e}")
    print("FastAPI Backend ready on http://localhost:8000")
    print("=" * 60)

@app.get("/")
def root():
    return {
        "app": "Stellantis General Assembly Shop Assessment Dashboard",
        "status": "online",
        "api_docs": "/docs",
        "api_prefix": "/api"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
