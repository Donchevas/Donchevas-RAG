from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.rag_service import obtener_respuesta_rag

app = FastAPI(title="Christian Molina - Personal RAG Engine")

# --- CONFIGURACIÓN DE CORS ---
# Aquí permitimos que otros dominios se conecten a tu API
origins = [
    "http://localhost:3000",      # Para cuando pruebes tu frontend localmente
    "https://donchevas-rag.vercel.app"    
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Dominios permitidos
    allow_credentials=True,
    allow_methods=["*"],         # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],         # Permite todos los encabezados
)

class ChatRequest(BaseModel):
    message: str

@app.get("/")
def read_root():
    return {"status": "online", "message": "Microservicio RAG de Christian activo"}

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    try:
        respuesta = obtener_respuesta_rag(request.message)
        return {"answer": respuesta}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))