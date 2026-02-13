import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Definición de tipos para mantener el estándar de Ingeniero de Sistemas
interface Message {
  role: 'user' | 'bot';
  text: string;
}

const App: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      text: '¡Hola! 👋 Soy **Donchevas**, el asistente personal de Christian. He sido entrenado con sus documentos privados para ayudarte. ¿Qué te gustaría saber hoy? ✨' 
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll para una experiencia de usuario fluida
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
      // Conexión con tu backend en Cloud Run
      const response = await fetch("https://donchevas-rag-1069673789450.europe-west1.run.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'bot', text: data.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Lo siento, hay un problema de conexión con mi cerebro en la nube. 😰' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* SIDEBAR: Enfocado en Seguridad y Propiedad */}
      <div style={{ width: '280px', backgroundColor: '#1e293b', padding: '30px', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ color: '#38bdf8', fontSize: '1.2rem', marginBottom: '10px' }}>🛡️ Datos Privados</h2>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6' }}>
          <p>• **Fuente:** Documentos Familiares</p>
          <p>• **Seguridad:** RAG Restringido</p>
          <p>• **Motor:** Gemini 2.5 Flash Lite</p>
        </div>
        <div style={{ marginTop: 'auto', fontSize: '0.8rem', borderTop: '1px solid #334155', paddingTop: '20px' }}>
          <p style={{ color: '#38bdf8' }}>Desarrollado por: <br/><strong style={{ fontSize: '1rem' }}>Christian Molina</strong></p>
        </div>
      </div>

      {/* ÁREA DE CHAT PRINCIPAL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Header Personalizado */}
        <div style={{ textAlign: 'center', padding: '35px 20px' }}>
          <h1 style={{ fontSize: '2.4rem', margin: 0, fontWeight: 800 }}>👨‍👩‍👦 Personal Knowledge Bot</h1>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>Información exclusiva de la familia Molina - Valdivia</p>
        </div>

        {/* Mensajes con Estilo Markdown Profesional */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0 15% 120px 15%', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' 
            }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold', letterSpacing: '1px' }}>
                {msg.role === 'user' ? 'TÚ' : '🤖 BIGDATIN'}
              </span>
              
              <div style={{ 
                backgroundColor: msg.role === 'user' ? '#38bdf8' : '#1e293b',
                color: msg.role === 'user' ? '#0f172a' : '#f8fafc',
                padding: '20px 25px', borderRadius: '15px',
                maxWidth: '90%', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                fontSize: '1.05rem', lineHeight: '1.8'
              }}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    p: ({...props}) => <p style={{ margin: '0 0 15px 0' }} {...props} />,
                    li: ({...props}) => <li style={{ margin: '8px 0' }} {...props} />,
                    strong: ({...props}) => <strong style={{ color: '#38bdf8', fontWeight: 'bold' }} {...props} />
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && <div style={{ color: '#38bdf8', fontSize: '0.9rem', fontStyle: 'italic', marginLeft: '10px' }}>BigDatin está consultando tus documentos... 🔍</div>}
        </div>

        {/* Input de Mensajes Estilo Moderno */}
        <div style={{ position: 'absolute', bottom: '35px', left: '15%', right: '15%' }}>
          <div style={{ 
            backgroundColor: '#1e293b', borderRadius: '35px', padding: '10px 25px', 
            display: 'flex', alignItems: 'center', border: '1px solid #334155',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2)'
          }}>
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Pregunta sobre Luciana o Tatiana..."
              style={{ flex: 1, background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '1rem', padding: '10px' }}
            />
            <button 
              onClick={sendMessage} 
              disabled={loading}
              style={{ 
                background: '#38bdf8', border: 'none', borderRadius: '50%', 
                width: '45px', height: '45px', cursor: 'pointer', marginLeft: '10px',
                display: 'flex', justifyContent: 'center', alignItems: 'center',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.1)')}
              onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
            >
              <span style={{ fontSize: '1.3rem', color: '#0f172a' }}>➤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;