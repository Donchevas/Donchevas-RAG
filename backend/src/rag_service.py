import os
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage
from vertexai.preview import rag

# 1. CONFIGURACIÓN DE ENTORNO
CONF_MODEL = os.getenv("MODEL_NAME")
CONF_LOCATION = os.getenv("GCP_LOCATION")
CONF_CORPUS = os.getenv("CONF_BASE_DE_CONOCIMIENTO")
PROJECT_ID = os.getenv("GCP_PROJECT_ID")

# 2. MEMORIA DE HILO
historial_texto = []

def obtener_respuesta_rag(mensaje_usuario: str):
    global historial_texto
    
    if not CONF_CORPUS:
        raise ValueError("Error: Configuración de corpus faltante.")

    try:
        # 3. RECUPERACIÓN (RAG)
        config_rag = rag.RagRetrievalConfig(top_k=3) 
        respuesta_rag = rag.retrieval_query(
            rag_resources=[rag.RagResource(rag_corpus=CONF_CORPUS)],
            text=mensaje_usuario,
            rag_retrieval_config=config_rag
        )
        contexto_documentos = "\n".join([c.text for c in respuesta_rag.contexts.contexts])
        
        memoria_contexto = "\n".join(historial_texto[-6:])

        # 4. PROMPT DE RAG ESTRICTO (El "Candado")
        prompt_final = f"""
Eres un asistente corporativo especializado para Christian Molina. 

REGLA DE HIERRO (CANDADO): 
1. Responde ÚNICAMENTE utilizando la información proporcionada en el "CONTEXTO DE DOCUMENTOS RELEVANTES".
2. Si la respuesta no se encuentra en el contexto, di textualmente: "Lo siento, no tengo información oficial sobre ese tema en mis registros corporativos". 
3. Tienes PROHIBIDO utilizar tu conocimiento general o historia externa (como inventores o hechos históricos no listados).
4. No menciones que estás usando documentos; simplemente responde con la información si existe.

HISTORIAL RECIENTE:
{memoria_contexto}

CONTEXTO DE DOCUMENTOS RELEVANTES:
{contexto_documentos}

Pregunta del usuario: {mensaje_usuario}
        """

        # 5. INVOCACIÓN CON TEMPERATURA 0 (Determinismo total)
        llm = ChatVertexAI(
            model=CONF_MODEL, 
            location=CONF_LOCATION,
            project=PROJECT_ID,
            temperature=0.3  # Evita la creatividad del modelo
        )
        
        resultado = llm.invoke([HumanMessage(content=prompt_final)])
        respuesta_ia = resultado.content

        # 6. ACTUALIZACIÓN DEL HISTORIAL
        historial_texto.append(f"Usuario: {mensaje_usuario}")
        historial_texto.append(f"Donchevas: {respuesta_ia}")

        return respuesta_ia

    except Exception as e:
        return f"Error en el sistema corporativo: {str(e)}"