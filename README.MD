# 🎓 BigDatin - Asistente Inteligente RAG para Big Data Academy

**BigDatin** es una aplicación Full-Stack de Inteligencia Artificial Generativa diseñada para gestionar consultas sobre oferta académica mediante una arquitectura de **Generación Aumentada por Recuperación (RAG)**.

## 🏗️ Arquitectura del Sistema
El proyecto utiliza una infraestructura moderna basada en microservicios y servicios administrados de Google Cloud:

* **Frontend**: Desarrollado en **React + Vite** y desplegado en **Vercel** para una entrega continua (CI/CD).
* **Backend**: Microservicio en **Python** desplegado en **Google Cloud Run** (región europe-west1).
* **Motor de IA**: Implementación de **Gemini 2.5 Flash Lite** para razonamiento y generación de respuestas.
* **Base de Conocimiento**: Integración con **Vertex AI Vector Search** para la recuperación precisa de documentos técnicos y académicos de Big Data Academy.



## 🚀 Características Principales
* **Interfaz Adaptativa**: Diseño en modo oscuro con renderizado de Markdown para una legibilidad superior.
* **Seguridad**: Configuración de políticas **CORS** para restringir el acceso al backend únicamente desde dominios autorizados.
* **Escalabilidad**: Contenedores Dockerizados que permiten el auto-escalado según la demanda en Cloud Run.

## 🛠️ Stack Tecnológico
| Capa | Tecnología |
| :--- | :--- |
| **Frontend** | React, TypeScript, Vite, React-Markdown |
| **Backend** | Python, FastAPI/Flask, Docker |
| **Cloud** | Google Cloud Platform (GCP), Cloud Run |
| **IA/ML** | Vertex AI, Gemini API, RAG Architecture |
| **DevOps** | GitHub Actions, Vercel |

## 👨‍💻 Desarrollador
**Christian Molina** - Ingeniero de Sistemas especializado en Agentes de IA e Hiperautomatización.