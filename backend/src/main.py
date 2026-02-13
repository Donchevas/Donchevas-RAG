from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.rag_service import obtener_respuesta_rag

app = FastAPI(title="Christian Molina - Personal RAG Engine")

# --- CONFIGURACIÓN DE CORS ---
origins = [
    "http://localhost:3000",
    "https://donchevas-rag.vercel.app"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELO DE DATOS ACTUALIZADO ---
# Definimos que cada petición DEBE traer el mensaje y la llave
class ChatRequest(BaseModel):
    message: str
    key: str 

@app.get("/")
def read_root():
    return {"status": "online", "message": "Microservicio RAG de Christian activo"}

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    try:
        # Aquí enviamos AMBOS parámetros a tu función de rag_service.py
        respuesta = obtener_respuesta_rag(request.message, request.key)
        
        # Si tu rag_service devuelve el error de acceso, lanzamos el código 401
        if respuesta == "ERROR_ACCESO_DENEGADO":
            raise HTTPException(status_code=401, detail="Acceso no autorizado")
            
        return {"answer": respuesta}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))