import os
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from vertexai.preview import rag

# ... (Tus variables de entorno se mantienen igual)

# 1. Definimos una estructura para la memoria de corto plazo (en memoria por ahora)
# En producción, esto podría ir a un Redis o Firestore
historial_memoria = [] 

def obtener_respuesta_rag(mensaje_usuario: str):
    global historial_memoria
    
    if not CONF_CORPUS:
        raise ValueError("Error: La variable CONF_BASE_DE_CONOCIMIENTO no está configurada.")

    # 2. Recuperación del contexto (RAG)
    config_rag = rag.RagRetrievalConfig(top_k=3) 
    respuesta_rag = rag.retrieval_query(
        rag_resources=[rag.RagResource(rag_corpus=CONF_CORPUS)],
        text=mensaje_usuario,
        rag_retrieval_config=config_rag
    )
    
    contexto_documentos = "\n".join([c.text for c in respuesta_rag.contexts.contexts])
    
    # 3. Configuración del modelo
    llm = ChatVertexAI(
        model=CONF_MODEL, 
        location=CONF_LOCATION,
        project=PROJECT_ID
    )

    # 4. Construcción del Prompt con Memoria e Identidad
    # Incluimos el historial para que sepa que "el menor" se refiere a "presupuestos"
    mensajes = [
        SystemMessage(content=f"""
            Eres "Donchevas", el asistente experto de Christian Molina.
            
            REGLAS DE ORO:
            1. Usa el CONTEXTO DE DOCUMENTOS para responder datos exactos (presupuestos, fechas, nombres).
            2. Usa el HISTORIAL DE CONVERSACIÓN para no perder el hilo. Si el usuario pregunta "y el menor", entiende que se refiere al tema anterior.
            3. Si el dato está en el contexto (como los $1.2MM), NO digas que no lo tienes. Sé consistente.
            4. Tono: Profesional para proyectos, cálido para familia. ✨
            
            CONTEXTO DE DOCUMENTOS:
            {contexto_documentos}
        """)
    ]

    # Agregamos los últimos 4 mensajes del historial para dar coherencia
    for msg in historial_memoria[-4:]:
        mensajes.append(msg)

    # Agregamos la pregunta actual
    mensajes.append(HumanMessage(content=mensaje_usuario))

    # 5. Ejecución
    respuesta_ia = llm.invoke(mensajes).content

    # 6. Actualizamos la memoria para la próxima pregunta
    historial_memoria.append(HumanMessage(content=mensaje_usuario))
    historial_memoria.append(AIMessage(content=respuesta_ia))

    return respuesta_ia