import React, { useState, useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

const App = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', text: '¡Hola! Soy BigDatin, tu asistente de Big Data Academy. ¿En qué puedo ayudarte hoy? 🎓' }
  ]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll al último mensaje
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input };
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
      setMessages(prev => [...prev, { role: 'bot', text: 'Lo siento, hubo un error de conexión. 😰' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      display: 'flex', justifyContent: 'center', alignItems: 'center', 
      height: '100vh', backgroundColor: '#f0f2f5', margin: 0 
    }}>
      <div style={{ 
        width: '100%', maxWidth: '450px', height: '600px', 
        backgroundColor: 'white', borderRadius: '15px', boxShadow: '0 12px 28px rgba(0,0,0,0.12)',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header Corporativo */}
        <div style={{ backgroundColor: '#1a73e8', color: 'white', padding: '20px', textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.2rem' }}>🎓 Big Data Academy</h2>
          <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>Asistente Inteligente (RAG)</span>
        </div>

        {/* Área de Mensajes */}
        <div ref={scrollRef} style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
              backgroundColor: msg.role === 'user' ? '#1a73e8' : '#e4e6eb',
              color: msg.role === 'user' ? 'white' : 'black',
              fontSize: '0.95rem',
              lineHeight: '1.4',
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
            }}>
              {msg.text}
            </div>
          ))}
          {loading && <div style={{ fontSize: '0.8rem', color: '#65676b' }}>BigDatin está escribiendo... ✍️</div>}
        </div>

        {/* Input con estilo moderno */}
        <div style={{ padding: '15px', borderTop: '1px solid #ddd', display: 'flex', gap: '10px' }}>
          <input 
            value={input} 
            onChange={(e) => setInput(e.target.value)} 
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Escribe un mensaje..."
            style={{ 
              flex: 1, padding: '12px', borderRadius: '25px', border: '1px solid #ddd', 
              outline: 'none', fontSize: '0.9rem' 
            }}
          />
          <button onClick={sendMessage} style={{ 
            backgroundColor: '#1a73e8', color: 'white', border: 'none', 
            borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer',
            fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;