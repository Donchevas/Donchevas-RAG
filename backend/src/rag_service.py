import os
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage
from vertexai.preview import rag

# EXTRAEMOS TODO DEL ENTORNO (Sincronizado con tu captura de Cloud Run)
# IMPORTANTE: Los nombres dentro de "" deben ser idénticos a los de la consola de GCP
CONF_MODEL = os.getenv("MODEL_NAME")              # En tu imagen pusiste MODEL_NAME
CONF_LOCATION = os.getenv("GCP_LOCATION")          # En tu imagen pusiste GCP_LOCATION
CONF_CORPUS = os.getenv("CONF_BASE_DE_CONOCIMIENTO") # En tu imagen pusiste este nombre
PROJECT_ID = os.getenv("GCP_PROJECT_ID")           # En tu imagen pusiste GCP_PROJECT_ID

def obtener_respuesta_rag(mensaje_usuario: str):
    # Validamos que las variables críticas existan antes de proceder
    if not CONF_CORPUS:
        raise ValueError("Error: La variable CONF_BASE_DE_CONOCIMIENTO no está configurada en la consola de Cloud Run.")

    # 1. Recuperación desde el Corpus ID (usa las 3 coincidencias de tu lab) [cite: 23, 24]
    config_rag = rag.RagRetrievalConfig(top_k=3) 
    
    respuesta_rag = rag.retrieval_query(
        rag_resources=[rag.RagResource(rag_corpus=CONF_CORPUS)],
        text=mensaje_usuario,
        rag_retrieval_config=config_rag
    )
    
    contexto = "\n".join([c.text for c in respuesta_rag.contexts.contexts]) [cite: 24, 25]
    
    # 2. Configuración del modelo dinámico
    llm = ChatVertexAI(
        model=CONF_MODEL, 
        location=CONF_LOCATION,
        project=PROJECT_ID
    )
    
    # 3. Personalidad del bot (BigDatin - lenguaje formal y amigable) [cite: 32]
    prompt = f"""
    Eres "BigDatin", asistente de Big Data Academy. 
    Responde con armonía y claridad basándote en el siguiente contexto.
    Usa emojis al responder. [cite: 32]
    
    Contexto:
    {contexto}
    
    Pregunta: {mensaje_usuario}
    """
    
    return llm.invoke([HumanMessage(content=prompt)]).content [cite: 26]