import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';

// Estructura de mensajes para TypeScript
interface Message {
  role: 'user' | 'bot';
  text: string;
}

const App: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '¡Hola! Soy **BigDatin** 🤖. ¿En qué puedo ayudarte hoy con nuestros cursos de IA y Cloud? 🎓' }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para mantener siempre el último mensaje a la vista
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    const textToSend = input;
    setInput('');

    try {
      const response = await fetch("https://donchevas-rag-1069673789450.europe-west1.run.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      if (!response.ok) throw new Error('Error en la comunicación con el RAG');

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'bot', text: data.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Lo siento, hubo un error al conectar con el servidor. 😰' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, system-ui, sans-serif' }}>
      
      {/* Sidebar de Arquitectura (Visible en pantallas grandes) */}
      <div style={{ width: '260px', backgroundColor: '#1e293b', padding: '25px', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ color: '#38bdf8', fontSize: '1.1rem', margin: 0 }}>🏗️ Arquitectura RAG</h3>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
          <p>• **Backend:** Cloud Run (Python)</p>
          <p>• **LLM:** Gemini 2.5 Flash Lite</p>
          <p>• **Data:** Vertex AI Vector Search</p>
        </div>
        <hr style={{ borderColor: '#334155', width: '100%' }} />
        <p style={{ fontSize: '0.8rem', color: '#38bdf8' }}>Desarrollado por: <br/><strong>Christian Molina</strong></p>
      </div>

      {/* Contenedor Principal del Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Encabezado */}
        <div style={{ textAlign: 'center', padding: '30px 20px', borderBottom: '1px solid #1e293b' }}>
          <h1 style={{ fontSize: '2rem', margin: 0, fontWeight: 700 }}>🎓 Big Data Academy Chat</h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '5px' }}>Consulta inteligente sobre nuestra oferta académica.</p>
        </div>

        {/* Área de Conversación */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 15%', display: 'flex', flexDirection: 'column', gap: '25px', paddingBottom: '100px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '85%' }}>
              <div style={{ 
                backgroundColor: msg.role === 'user' ? '#38bdf8' : '#1e293b',
                color: msg.role === 'user' ? '#0f172a' : '#f8fafc',
                padding: '15px 22px', 
                borderRadius: '18px',
                lineHeight: '1.6',
                fontSize: '1rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}>
                {msg.role === 'user' ? (
                  msg.text
                ) : (
                  /* Renderizado de Markdown para las respuestas de BigDatin */
                  <ReactMarkdown components={{
                    p: ({...props}) => <p style={{margin: '0 0 12px 0'}} {...props} />,
                    ul: ({...props}) => <ul style={{paddingLeft: '20px', margin: '10px 0'}} {...props} />,
                    li: ({...props}) => <li style={{marginBottom: '8px'}} {...props} />,
                    strong: ({...props}) => <strong style={{color: '#38bdf8'}} {...props} />
                  }}>
                    {msg.text}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          ))}
          {loading && <div style={{ color: '#38bdf8', fontSize: '0.9rem', fontStyle: 'italic' }}>BigDatin está analizando tu consulta... 🚀</div>}
        </div>

        {/* Input de Mensajes */}
        <div style={{ position: 'absolute', bottom: '25px', left: '15%', right: '15%' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '30px', padding: '8px 15px', display: 'flex', alignItems: 'center', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)' }}>
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Hazme una pregunta sobre IA o AWS..."
              style={{ flex: 1, background: 'none', border: 'none', color: 'white', outline: 'none', padding: '10px', fontSize: '1rem' }}
            />
            <button onClick={sendMessage} disabled={loading} style={{ background: '#38bdf8', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', marginLeft: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'transform 0.2s' }}>
              <span style={{ fontSize: '1.2rem' }}>➤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;