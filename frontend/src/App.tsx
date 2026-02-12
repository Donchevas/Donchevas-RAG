import React, { useState } from 'react';

const ChatBigDatin = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([{ role: 'bot', text: '¡Hola! Soy BigDatin. ¿En qué puedo ayudarte hoy? 🎓' }]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setInput('');

    try {
      const response = await fetch("https://donchevas-rag-1069673789450.europe-west1.run.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      setMessages((prev) => [...prev, { role: 'bot', text: data.answer }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Lo siento, hubo un error de conexión. 😰' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '10px', maxWidth: '400px' }}>
      <div style={{ height: '300px', overflowY: 'scroll', marginBottom: '10px' }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ textAlign: msg.role === 'user' ? 'right' : 'left', margin: '5px' }}>
            <strong>{msg.role === 'user' ? 'Tú' : 'BigDatin'}:</strong> {msg.text}
          </div>
        ))}
        {loading && <p>Escribiendo... ✍️</p>}
      </div>
      <input 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
        placeholder="Escribe tu duda aquí..."
        style={{ width: '80%', padding: '5px' }}
      />
      <button onClick={sendMessage} style={{ width: '18%' }}>Enviar</button>
    </div>
  );
};

export default ChatBigDatin;