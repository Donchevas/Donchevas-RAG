import os
import datetime
from langchain_google_vertexai import ChatVertexAI
from langchain_core.messages import HumanMessage
from vertexai.preview import rag
from google.cloud import firestore

# 1. CONFIGURACIÓN DE ENTORNO (Google Cloud)
CONF_MODEL = os.getenv("MODEL_NAME")
CONF_LOCATION = os.getenv("GCP_LOCATION")
CONF_CORPUS = os.getenv("CONF_BASE_DE_CONOCIMIENTO")
PROJECT_ID = os.getenv("GCP_PROJECT_ID")

# Inicializamos el cliente de Firestore (Conexión oficial con tu nueva DB)
db = firestore.Client(project=PROJECT_ID)

def obtener_respuesta_rag(mensaje_usuario: str, user_email: str):
    """
    Versión Profesional: Seguridad gestionada por Google Auth y 
    persistencia real en Firestore por cada usuario (Tatiana, Leandro, Pablo, Christian).
    """
    
    if not CONF_CORPUS:
        raise ValueError("Error: La variable CONF_BASE_DE_CONOCIMIENTO no está configurada.")

    try:
        # 2. RECUPERAR MEMORIA REAL DESDE FIRESTORE
        # Accedemos a la colección específica del usuario logueado
        chat_ref = db.collection("conversaciones").document(user_email).collection("mensajes")
        query = chat_ref.order_by("timestamp", direction=firestore.Query.DESCENDING).limit(6)
        docs = query.stream()
        
        # Invertimos para enviar el contexto cronológicamente a la IA
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

        # 4. PROMPT MAESTRO (Identidad Donchevas)
        prompt_final = f"""
Eres "Donchevas", el asistente de IA y estratega de carrera de Christian Molina. 
Tu prioridad es la PRECISIÓN, la COHERENCIA y la ÉTICA SOCIAL.

### REGLAS DE ORO (ESTRICTO):
1. **FILTRO DE RELEVANCIA:** Si preguntan por temas externos (celebridades, política, etc.), rechaza con cortesía. Pero NO bloquees preguntas sobre "menor" o "mayor" si vienen de una charla de proyectos o dinero.
2. **MEMORIA DE SEGUIMIENTO:** Si el usuario pregunta "y el menor" o "¿cuánto?" tras hablar de presupuestos, entiende que se refiere al MONTO MÁS BAJO de la lista de proyectos. Solo habla de su hijo Leandro si el tema familiar fue el último mencionado.
3. **CRITERIO "PM DEL FUTURO":** Cuando te pidan tu opinión sobre Christian, actúa como un consultor senior. No solo listes datos; analiza cómo su mezcla de PMP (gestión tradicional) + Máster en IA (vanguardia) + Ética Social (armonía) lo convierte en un líder único capaz de generar abundancia para la humanidad.

### INSTRUCCIONES POR DOMINIO:
- **Profesional/CV:** Tono de "Consultor Senior". Resalta la capacidad de Christian para conectar la estrategia de negocio con la IA.
- **Familiar:** Tono cálido. Recuerda que Christian es el pilar de su familia (Tatiana, Sebastián, Leandro, Pablo y Luciana). ✨
- **Proyectos:** Enfócate en el ROI, ahorros y presupuestos (ej. el de $1.2MM o el de $65K).

### CONTEXTO:
- **Historial:** {memoria_contexto}
- **Documentos (RAG):** {contexto_documentos}

### TAREA:
Analiza la trayectoria de Christian y responde con criterio propio a la consulta:
Pregunta: {mensaje_usuario}

        """

        # 5. INVOCACIÓN AL MODELO (Gemini)
        llm = ChatVertexAI(
            model=CONF_MODEL, 
            location=CONF_LOCATION,
            project=PROJECT_ID
        )
        
        resultado = llm.invoke([HumanMessage(content=prompt_final)])
        respuesta_ia = resultado.content

        # 6. PERSISTENCIA EN FIRESTORE (Guardamos pregunta y respuesta)
        timestamp_actual = datetime.datetime.now(datetime.timezone.utc)
        
        chat_ref.add({
            "role": "Usuario",
            "content": mensaje_usuario,
            "timestamp": timestamp_actual
        })
        
        chat_ref.add({
            "role": "Donchevas",
            "content": respuesta_ia,
            "timestamp": timestamp_actual
        })

        return respuesta_ia

    except Exception as e:
        print(f"Error técnico en rag_service: {str(e)}")
        return f"Donchevas tuvo un problema técnico: {str(e)}"