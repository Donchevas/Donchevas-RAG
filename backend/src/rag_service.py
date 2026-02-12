import os
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage
from vertexai.preview import rag

# EXTRAEMOS TODO DEL ENTORNO
CONF_MODEL = os.getenv("MODEL_NAME")
CONF_LOCATION = os.getenv("GCP_LOCATION")
CONF_CORPUS = os.getenv("CONF_BASE_DE_CONOCIMIENTO")
PROJECT_ID = os.getenv("GCP_PROJECT_ID")

def obtener_respuesta_rag(mensaje_usuario: str):
    if not CONF_CORPUS:
        raise ValueError("Error: La variable CONF_BASE_DE_CONOCIMIENTO no está configurada.")

    # 1. Recuperación desde el Corpus ID
    config_rag = rag.RagRetrievalConfig(top_k=3) 
    
    respuesta_rag = rag.retrieval_query(
        rag_resources=[rag.RagResource(rag_corpus=CONF_CORPUS)],
        text=mensaje_usuario,
        rag_retrieval_config=config_rag
    )
    
    contexto = "\n".join([c.text for c in respuesta_rag.contexts.contexts])
    
    # 2. Configuración del modelo dinámico
    llm = ChatVertexAI(
        model=CONF_MODEL, 
        location=CONF_LOCATION,
        project=PROJECT_ID
    )
    
    # 3. Personalidad del bot
    prompt = f"""
    Eres "BigDatin", asistente de Big Data Academy. 
    Responde con armonía y claridad basándote en el siguiente contexto.
    Usa emojis al responder.
    
    Contexto:
    {contexto}
    
    Pregunta: {mensaje_usuario}
    """
    
    return llm.invoke([HumanMessage(content=prompt)]).content