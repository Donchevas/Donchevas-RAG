import os
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage
from vertexai.preview import rag

# 1. CONFIGURACIÓN DE ENTORNO (Google Cloud)
CONF_MODEL = os.getenv("MODEL_NAME")
CONF_LOCATION = os.getenv("GCP_LOCATION")
CONF_CORPUS = os.getenv("CONF_BASE_DE_CONOCIMIENTO")
PROJECT_ID = os.getenv("GCP_PROJECT_ID")

# LLAVE MAESTRA: Se lee desde las variables de entorno de Cloud Run
MASTER_KEY_BACKEND = os.getenv("MASTER_KEY")

# 2. MEMORIA DE HILO (Contextual)
historial_texto = []

def obtener_respuesta_rag(mensaje_usuario: str, password_enviado: str):
    global historial_texto
    
    # --- BLOQUE DE SEGURIDAD ---
    # Si la llave enviada desde el frontend no coincide con la de Cloud Run, bloqueamos.
    if password_enviado != MASTER_KEY_BACKEND:
        return "ERROR_ACCESO_DENEGADO"
    # ---------------------------

    if not CONF_CORPUS:
        raise ValueError("Error: La variable CONF_BASE_DE_CONOCIMIENTO no está configurada.")

    try:
        # 3. RECUPERACIÓN (RAG)
        config_rag = rag.RagRetrievalConfig(top_k=3) 
        
        respuesta_rag = rag.retrieval_query(
            rag_resources=[rag.RagResource(rag_corpus=CONF_CORPUS)],
            text=mensaje_usuario,
            rag_retrieval_config=config_rag
        )
        
        contexto_documentos = "\n".join([c.text for c in respuesta_rag.contexts.contexts])
        
        # 4. PREPARACIÓN DE LA MEMORIA (Últimas 3 interacciones)
        memoria_contexto = "\n".join(historial_texto[-6:])

        # 5. PROMPT MAESTRO (Mantiene tu lógica estable de Christian Molina)
        prompt_final = f"""
Eres "Donchevas", el asistente experto de Christian Molina. Tu prioridad es la COHERENCIA y el CRITERIO.

INSTRUCCIONES DE COMPORTAMIENTO:
1. Si el usuario pregunta por algo "mayor", "menor" o "más barato" justo después de hablar de PRESUPUESTOS o PROYECTOS, mantente en el tema financiero. NO hables de la familia a menos que se mencione un nombre propio (ej. Sebastian).
2. Usa el CONTEXTO DE DOCUMENTOS para extraer cifras exactas ($, USD, S/).
3. Si la pregunta es sobre Luciana, Tatiana o los chicos, usa un tono cálido y familiar. ✨
4. Si no tienes la información exacta en el contexto, admítelo con profesionalismo.

HISTORIAL DE LA CONVERSACIÓN:
{memoria_contexto}

CONTEXTO DE DOCUMENTOS RELEVANTES:
{contexto_documentos}

Pregunta actual: {mensaje_usuario}
        """

        # 6. INVOCACIÓN AL MODELO
        llm = ChatVertexAI(
            model=CONF_MODEL, 
            location=CONF_LOCATION,
            project=PROJECT_ID
        )
        
        resultado = llm.invoke([HumanMessage(content=prompt_final)])
        respuesta_ia = resultado.content

        # 7. ACTUALIZACIÓN DEL HISTORIAL
        historial_texto.append(f"Usuario: {mensaje_usuario}")
        historial_texto.append(f"Donchevas: {respuesta_ia}")

        return respuesta_ia

    except Exception as e:
        return f"Donchevas tuvo un problema técnico: {str(e)}"