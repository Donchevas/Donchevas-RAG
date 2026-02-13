import os
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage
from vertexai.preview import rag

# 1. EXTRACCIÓN DE VARIABLES DE ENTORNO (Configuración GCP)
CONF_MODEL = os.getenv("MODEL_NAME")
CONF_LOCATION = os.getenv("GCP_LOCATION")
CONF_CORPUS = os.getenv("CONF_BASE_DE_CONOCIMIENTO")
PROJECT_ID = os.getenv("GCP_PROJECT_ID")

# 2. MEMORIA DE CORTO PLAZO (Persistente mientras el contenedor esté vivo)
# Usamos una lista de strings para máxima compatibilidad y evitar errores de tipo
historial_texto = []

def obtener_respuesta_rag(mensaje_usuario: str):
    global historial_texto
    
    # Validación de seguridad para la base de conocimiento
    if not CONF_CORPUS:
        raise ValueError("Error: La variable CONF_BASE_DE_CONOCIMIENTO no está configurada.")

    try:
        # 3. RECUPERACIÓN (RAG) - Consulta a Vertex AI Search
        config_rag = rag.RagRetrievalConfig(top_k=3) 
        
        respuesta_rag = rag.retrieval_query(
            rag_resources=[rag.RagResource(rag_corpus=CONF_CORPUS)],
            text=mensaje_usuario,
            rag_retrieval_config=config_rag
        )
        
        # Extraemos los fragmentos de texto encontrados
        contexto_documentos = "\n".join([c.text for c in respuesta_rag.contexts.contexts])
        
        # 4. PREPARACIÓN DE LA MEMORIA (Context Window)
        # Tomamos los últimos 6 mensajes para mantener el hilo sin saturar el modelo
        memoria_contexto = "\n".join(historial_texto[-6:])

        # 5. CONSTRUCCIÓN DEL PROMPT MAESTRO
        # Aquí inyectamos la identidad de Donchevas y las reglas de oro
        prompt_final = f"""
Eres "Donchevas", el asistente inteligente y personal de Christian Molina. 

REGLAS DE ORO:
1. Usa el HISTORIAL RECIENTE para entender el hilo de la conversación (ej. preguntas cortas como "¿y el menor?").
2. Usa el CONTEXTO DE DOCUMENTOS para dar datos exactos de presupuestos, cursos o familia.
3. Si la info no está en el contexto, declina amablemente la respuesta.
4. Tono: Profesional para temas de ingeniería y cálido/emotivo para temas de la familia Molina-Valdivia. ✨

HISTORIAL RECIENTE:
{memoria_contexto}

CONTEXTO DE DOCUMENTOS RELEVANTES:
{contexto_documentos}

Pregunta actual del usuario: {mensaje_usuario}
        """

        # 6. INVOCACIÓN AL MODELO (LLM)
        llm = ChatVertexAI(
            model=CONF_MODEL, 
            location=CONF_LOCATION,
            project=PROJECT_ID
        )
        
        # Enviamos como un mensaje simple para asegurar que no se pierda el hilo
        resultado = llm.invoke([HumanMessage(content=prompt_final)])
        respuesta_ia = resultado.content

        # 7. ACTUALIZACIÓN DE LA MEMORIA
        # Guardamos la interacción para que esté disponible en la siguiente pregunta
        historial_texto.append(f"Usuario: {mensaje_usuario}")
        historial_texto.append(f"Donchevas: {respuesta_ia}")

        return respuesta_ia

    except Exception as e:
        # En caso de error técnico, devolvemos un mensaje descriptivo para debug
        return f"Donchevas tuvo un pequeño cruce de cables: {str(e)}"