from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app import models
from app.routes_auth import router as auth_router
from app.routes_eventos import router as eventos_router
from app.routes_certificados import router as certificados_router
from app.routes_admin import router as admin_router

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Íntegra: Humano por Inteiro - API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # em produção, trocar "*" pelo endereço real do front
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(eventos_router)
app.include_router(certificados_router)
app.include_router(admin_router)

@app.get("/")
def raiz():
    return {"mensagem": "API do Íntegra: Humano por Inteiro está no ar"}