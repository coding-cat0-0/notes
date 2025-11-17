from fastapi import FastAPI, status
from sqlmodel import SQLModel
from database import engine   
from routers import login_route, notes_route          
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

app = FastAPI()

# 2️ Add CORS middleware (must be before include_router)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or specify: ["http://127.0.0.1:5500"]
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    # Extract error messages only
    errors = [err['msg'] for err in exc.errors()] # exc.errors is a method in Request validation error class that provides error details
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"message": ", ".join(errors)},
    )
#  Include routers
app.include_router(login_route.router)
app.include_router(notes_route.router)

#  Create tables on startup
@app.on_event("startup")
def on_startup() -> None:
    SQLModel.metadata.create_all(engine)
