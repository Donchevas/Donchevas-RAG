import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'bot', text: '¡Hola Christian! 👋 Soy **BigDatin**. ¿Listo para potenciar tu carrera con IA y Cloud? 🚀' }]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    const textToSend = input;
    setInput('');

    try {
      const response = await fetch("https://donchevas-rag-1069673789450.europe-west1.run.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: textToSend }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error de conexión. Revisa tu backend en Cloud Run. 😰' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* SIDEBAR PROFESIONAL (Como en tu Analizador de Reuniones) */}
      <div style={{ width: '280px', backgroundColor: '#1e293b', padding: '30px', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ color: '#38bdf8', fontSize: '1.2rem' }}>🏗️ Arquitectura</h2>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
          <p>• Cloud Run (Python)</p>
          <p>• Vertex AI RAG</p>
          <p>• Gemini 2.5 Flash Lite</p>
        </div>
        <div style={{ marginTop: 'auto', fontSize: '0.8rem', borderTop: '1px solid #334155', paddingTop: '20px' }}>
          <p>👨‍💻 **Desarrollado por:** <br/> Christian Molina</p>
        </div>
      </div>

      {/* CHAT PRINCIPAL */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <h1 style={{ fontSize: '2.2rem', margin: 0 }}>🎓 Big Data Academy Chat</h1>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '20px 10% 120px 10%', display: 'flex', flexDirection: 'column', gap: '30px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' 
            }}>
              {/* Etiqueta de quién habla */}
              <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '5px', marginLeft: '10px' }}>
                {msg.role === 'user' ? 'TÚ' : '🤖 BIGDATIN'}
              </span>
              
              <div style={{ 
                backgroundColor: msg.role === 'user' ? '#38bdf8' : '#1e293b',
                color: msg.role === 'user' ? '#0f172a' : '#f8fafc',
                padding: '20px 25px', borderRadius: '15px',
                maxWidth: '90%', boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                fontSize: '1.05rem', lineHeight: '1.8'
              }}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // AQUÍ ESTÁ LA SOLUCIÓN: Márgenes forzados para cada párrafo
                    p: ({...props}) => <p style={{ margin: '0 0 20px 0' }} {...props} />,
                    li: ({...props}) => <li style={{ margin: '10px 0' }} {...props} />,
                    strong: ({...props}) => <strong style={{ color: '#38bdf8' }} {...props} />
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {loading && <div style={{ color: '#38bdf8' }}>Escribiendo... 🚀</div>}
        </div>

        {/* INPUT FLOTANTE */}
        <div style={{ position: 'absolute', bottom: '30px', left: '10%', right: '10%', backgroundColor: '#1e293b', borderRadius: '30px', padding: '10px 25px', display: 'flex', border: '1px solid #334155' }}>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Pregunta lo que quieras..."
            style={{ flex: 1, background: 'none', border: 'none', color: 'white', outline: 'none', fontSize: '1rem' }}
          />
          <button onClick={sendMessage} style={{ background: '#38bdf8', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', marginLeft: '10px' }}>➤</button>
        </div>
      </div>
    </div>
  );
};

export default App;