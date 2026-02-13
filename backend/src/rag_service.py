import os
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage
from vertexai.preview import rag
# --- NUEVA IMPORTACIÓN PARA LA MEMORIA ---
from google.cloud import firestore
import datetime

# 1. CONFIGURACIÓN DE ENTORNO
CONF_MODEL = os.getenv("MODEL_NAME")
CONF_LOCATION = os.getenv("GCP_LOCATION")
CONF_CORPUS = os.getenv("CONF_BASE_DE_CONOCIMIENTO")
PROJECT_ID = os.getenv("GCP_PROJECT_ID")

# Inicializamos el cliente de Firestore
db = firestore.Client(project=PROJECT_ID)

def obtener_respuesta_rag(mensaje_usuario: str, user_email: str):
    """
    Evolución: Ahora recibe 'user_email' en lugar de 'password_enviado'.
    La seguridad ya se validó en main.py.
    """
    
    if not CONF_CORPUS:
        raise ValueError("Error: La variable CONF_BASE_DE_CONOCIMIENTO no está configurada.")

    try:
        # 2. RECUPERAR HISTORIAL REAL DESDE FIRESTORE (Aislado por usuario)
        # Buscamos los últimos 6 mensajes de este usuario específico
        chat_ref = db.collection("conversaciones").document(user_email).collection("mensajes")
        query = chat_ref.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(6)
        docs = query.stream()
        
        # Invertimos para que el orden sea cronológico: Viejo -> Nuevo
        mensajes_anteriores = []
        for doc in reversed(list(docs)):
            data = doc.to_dict()
            mensajes_anteriores.append(f"{data['role']}: {data['content']}")
        
        memoria_contexto = "\n".join(mensajes_anteriores)

        # 3. RECUPERACIÓN (RAG) - Vertex AI Search
        config_rag = rag.RagRetrievalConfig(top_k=3) 
        respuesta_rag = rag.retrieval_query(
            rag_resources=[rag.RagResource(rag_corpus=CONF_CORPUS)],
            text=mensaje_usuario,
            rag_retrieval_config=config_rag
        )
        
        contexto_documentos = "\n".join([c.text for c in respuesta_rag.contexts.contexts])

        # 4. PROMPT MAESTRO (Sin cambios, es tu lógica de marca)
        prompt_final = f"""
Eres "Donchevas", el asistente experto de Christian Molina. Tu prioridad es la COHERENCIA y el CRITERIO.

INSTRUCCIONES DE COMPORTAMIENTO:
1. Si el usuario pregunta por temas financieros o proyectos, mantente en ese flujo.
2. Si la pregunta es sobre la familia Molina - Valdivia, usa un tono cálido y familiar. ✨
3. Usa el contexto de documentos para dar datos exactos.

HISTORIAL DE LA CONVERSACIÓN (Identidad: {user_email}):
{memoria_contexto}

CONTEXTO DE DOCUMENTOS RELEVANTES:
{contexto_documentos}

Pregunta actual: {mensaje_usuario}
        """

        # 5. INVOCACIÓN AL MODELO (Gemini)
        llm = ChatVertexAI(
            model=CONF_MODEL, 
            location=CONF_LOCATION,
            project=PROJECT_ID
        )
        
        resultado = llm.invoke([HumanMessage(content=prompt_final)])
        respuesta_ia = resultado.content

        # 6. PERSISTENCIA: GUARDAR EN FIRESTORE
        # Guardamos el mensaje del usuario
        chat_ref.add({
            "role": "Usuario",
            "content": mensaje_usuario,
            "timestamp": datetime.datetime.now(datetime.timezone.utc)
        })
        # Guardamos la respuesta de Donchevas
        chat_ref.add({
            "role": "Donchevas",
            "content": respuesta_ia,
            "timestamp": datetime.datetime.now(datetime.timezone.utc)
        })

        return respuesta_ia

    except Exception as e:
        print(f"Error en rag_service: {str(e)}")
        return f"Donchevas tuvo un problema técnico: {str(e)}"