from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from src.rag_service import obtener_respuesta_rag

app = FastAPI(title="Big Data Academy RAG API")

# Definimos el modelo de datos de entrada
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