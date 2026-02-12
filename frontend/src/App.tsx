import React, { useState, useEffect, useRef } from 'react';

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'bot', text: '¡Hola! Soy BigDatin 🤖. ¿En qué curso estás interesado hoy? (Big Data, Cloud o IA)' }]);
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
    const currentInput = input;
    setInput('');

    try {
      const response = await fetch("https://donchevas-rag-1069673789450.europe-west1.run.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: currentInput }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'bot', text: data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Error de conexión con el RAG 😰' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* Sidebar de Arquitectura - Estilo Analizador de Reuniones */}
      <div style={{ width: '300px', backgroundColor: '#1e293b', padding: '30px', borderRight: '1px solid #334155', display: 'none' /* Opcional: mostrar en escritorio */ }}>
        <h3 style={{ color: '#38bdf8' }}>🏗️ Arquitectura</h3>
        <p style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Cloud Run + Vertex AI RAG + Gemini 2.5 Flash Lite</p>
        <hr style={{ borderColor: '#334155', margin: '20px 0' }} />
        <p style={{ fontSize: '0.85rem' }}>👨‍💻 Desarrollado por: <strong>Christian Molina</strong></p>
      </div>

      {/* Área Principal de Chat */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        
        {/* Header - Estilo Big Data Academy Chat */}
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }}>🎓 Big Data Academy Chat</h1>
          <p style={{ color: '#94a3b8' }}>Pregúntame sobre nuestros cursos de IA y Cloud.</p>
        </div>

        {/* Mensajes con Scroll */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0 20% 100px 20%', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
              <div style={{ 
                backgroundColor: msg.role === 'user' ? '#38bdf8' : '#334155',
                color: msg.role === 'user' ? '#0f172a' : 'white',
                padding: '15px 20px', borderRadius: '15px', lineHeight: '1.5'
              }}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <div style={{ color: '#38bdf8', fontSize: '0.9rem' }}>BigDatin está procesando... 🚀</div>}
        </div>

        {/* Input Flotante - Estilo Moderno */}
        <div style={{ position: 'absolute', bottom: '30px', left: '20%', right: '20%' }}>
          <div style={{ backgroundColor: '#1e293b', borderRadius: '30px', padding: '10px 20px', display: 'flex', alignItems: 'center', border: '1px solid #334155' }}>
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Escribe tu consulta aquí..."
              style={{ flex: 1, background: 'none', border: 'none', color: 'white', outline: 'none', padding: '10px' }}
            />
            <button onClick={sendMessage} style={{ background: '#38bdf8', border: 'none', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', marginLeft: '10px' }}>
              ➤
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;