from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from src.rag_service import obtener_respuesta_rag

app = FastAPI(title="Christian Molina - Donchevas RAG Multi-User")

# --- CONFIGURACIÓN DE CORS ACTUALIZADA ---
# Agregamos tu dominio de Vercel y localhost
origins = [
    "http://localhost:3000",
    "https://donchevas-rag.vercel.app",
    "https://projectsuite-ai-premium.vercel.app" # Tu nueva URL de producción
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- MODELO DE DATOS EVOLUCIONADO ---
# Ahora el Backend espera la identidad del usuario en lugar de una llave maestra
class ChatRequest(BaseModel):
    message: str
    user_email: str  # Reemplaza a 'key'
    user_name: str | None = None

# Lista de correos autorizados (Tu familia Molina - Valdivia)
USUARIOS_AUTORIZADOS = [
    "christian.molina.icaza@gmail.com", 
    "tatiana.valdivia.cubas@gmail.com", 
    "leandro.molina.condori@gmail.com", 
    "molina.condori.pablo@gmail.com"
]

@app.get("/")
def read_root():
    return {"status": "online", "message": "Cerebro de Donchevas listo para la familia Molina"}

@app.post("/chat")
def chat_endpoint(request: ChatRequest):
    try:
        # 1. Validación de Seguridad IAM:
        # Solo respondemos si el correo está en nuestra lista blanca
        if request.user_email not in USUARIOS_AUTORIZADOS:
            print(f"Intento de acceso denegado para: {request.user_email}")
            raise HTTPException(status_code=401, detail="Usuario no autorizado en el sistema familiar")

        # 2. Invocación al RAG pasándole la identidad:
        # Enviamos el email para que rag_service sepa qué historial de Firestore consultar
        respuesta = obtener_respuesta_rag(request.message, request.user_email)
        
        return {"answer": respuesta}

    except HTTPException as he:
        raise he
    except Exception as e:
        print(f"Error crítico: {str(e)}")
        raise HTTPException(status_code=500, detail="Error interno en el cerebro de Donchevas")