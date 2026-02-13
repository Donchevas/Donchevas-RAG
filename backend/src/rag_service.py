import os
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage
from vertexai.preview import rag

# 1. CONFIGURACIÓN DE ENTORNO
CONF_MODEL = os.getenv("MODEL_NAME")
CONF_LOCATION = os.getenv("GCP_LOCATION")
CONF_CORPUS = os.getenv("CONF_BASE_DE_CONOCIMIENTO")
PROJECT_ID = os.getenv("GCP_PROJECT_ID")

historial_texto = []

def obtener_respuesta_rag(mensaje_usuario: str):
    global historial_texto
    
    if not CONF_CORPUS:
        raise ValueError("Configuración de corpus faltante.")

    try:
        # 2. RECUPERACIÓN (RAG)
        config_rag = rag.RagRetrievalConfig(top_k=3) 
        respuesta_rag = rag.retrieval_query(
            rag_resources=[rag.RagResource(rag_corpus=CONF_CORPUS)],
            text=mensaje_usuario,
            rag_retrieval_config=config_rag
        )
        contexto_documentos = "\n".join([c.text for c in respuesta_rag.contexts.contexts])
        memoria_contexto = "\n".join(historial_texto[-6:])

        # 3. PROMPT BALANCEADO (Identidad + Inteligencia)
        prompt_final = f"""
Eres "Donchevas", el asistente experto y coach profesional de Christian Molina. 

OBJETIVO: Brindar respuestas inteligentes, analíticas y cálidas basadas en la información proporcionada.

GUÍAS DE RESPUESTA:
1. Usa el CONTEXTO DE DOCUMENTOS para dar datos exactos, pero tienes libertad para ANALIZARLOS y dar conclusiones profesionales.
2. Si se habla de presupuestos, usa el HISTORIAL para comparar cuál es el mayor o menor sin que el usuario tenga que repetirlo.
3. Mantén un tono de alto nivel: eres un colaborador estratégico para los proyectos de Christian.
4. Si te preguntan sobre temas generales de IA (como Turing), puedes dar una breve pincelada informativa si ayuda a explicar los cursos de Christian.

HISTORIAL RECIENTE:
{memoria_contexto}

CONTEXTO DE DOCUMENTOS:
{contexto_documentos}

Pregunta: {mensaje_usuario}
        """

        # 4. CONFIGURACIÓN CON TEMPERATURA 0.7 (Vuelve la chispa)
        llm = ChatVertexAI(
            model=CONF_MODEL, 
            location=CONF_LOCATION,
            project=PROJECT_ID,
            temperature=0.7 
        )
        
        resultado = llm.invoke([HumanMessage(content=prompt_final)])
        respuesta_ia = resultado.content

        historial_texto.append(f"Usuario: {mensaje_usuario}")
        historial_texto.append(f"Donchevas: {respuesta_ia}")

        return respuesta_ia

    except Exception as e:
        return f"Donchevas está reiniciando sus procesos: {str(e)}"