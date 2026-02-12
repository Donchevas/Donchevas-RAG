import os
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage, SystemMessage
from vertexai.preview import rag

# Configuraciones extraídas de tu Lab
CONF_MODEL = "gemini-2.5-flash-lite"
CONF_LOCATION = "global"

def obtener_respuesta_rag(mensaje_usuario: str):
    # Obtenemos el Corpus ID de las variables de entorno de GCP
    corpus_id = os.getenv("CONF_BASE_DE_CONOCIMIENTO")
    
    # 1. Recuperación de contexto desde la base de conocimientos de GCP
    config_rag = rag.RagRetrievalConfig(top_k=3)
    respuesta_rag = rag.retrieval_query(
        rag_resources=[rag.RagResource(rag_corpus=corpus_id)],
        text=mensaje_usuario,
        rag_retrieval_config=config_rag
    )
    
    # Acumulamos los fragmentos encontrados
    contexto_busqueda = "\n".join([chunk.text for chunk in respuesta_rag.contexts.contexts])
    
    # 2. Configuración del modelo con la "personalidad" de BigDatin
    llm = ChatVertexAI(model=CONF_MODEL, location=CONF_LOCATION)
    
    # Construimos el prompt final con las reglas de tu sesión
    prompt_final = f"""
    Eres un asistente llamado "BigDatin" que atenderá consultas de alumnos en "Big Data Academy".
    REGLAS:
    1. Lenguaje formal pero amigable.
    2. Usa emojis al responder.
    3. Si no sabes la respuesta basándote en el contexto, dilo honestamente.

    Contexto:
    {contexto_busqueda}

    Pregunta del alumno:
    {mensaje_usuario}
    """
    
    response = llm.invoke([HumanMessage(content=prompt_final)])
    return response.content