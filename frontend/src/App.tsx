import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Interfaz para el estándar de calidad
interface Message {
  role: 'user' | 'bot';
  text: string;
}

const App: React.FC = () => {
  // --- ESTADOS DE SEGURIDAD ---
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // --- ESTADOS DEL CHAT ---
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'bot', 
      text: '¡Hola! 👋 Soy **Donchevas**, el asistente personal de Christian. He sido entrenado con sus documentos privados para ayudarte. ¿Qué te gustaría saber hoy? ✨' 
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Verificar sesión existente al cargar
  useEffect(() => {
    const savedAuth = localStorage.getItem('donchevas_auth');
    if (savedAuth) {
      setIsAuthenticated(true);
      setPasswordInput(savedAuth); // Usaremos esto para las peticiones al backend
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // FUNCIÓN DE LOGIN
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim()) {
      localStorage.setItem('donchevas_auth', passwordInput);
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Por favor, ingresa la llave de acceso.');
    }
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    const textToSend = input;
    setInput('');

    try {
      // Conexión con Backend enviando la llave de seguridad
      const response = await fetch("https://donchevas-rag-1069673789450.europe-west1.run.app/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: textToSend,
          key: passwordInput // Aquí enviamos la clave para que el Backend valide
        }),
      });

      const data = await response.json();

      // Validación de acceso denegado desde el Backend
      if (data.answer === "ERROR_ACCESO_DENEGADO") {
        setIsAuthenticated(false);
        localStorage.removeItem('donchevas_auth');
        alert("Llave de acceso incorrecta o expirada.");
      } else {
        setMessages((prev) => [...prev, { role: 'bot', text: data.answer }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Lo siento, hay un problema de conexión con mi cerebro en la nube. 😰' }]);
    } finally {
      setLoading(false);
    }
  };

  // --- RENDERIZADO DE PANTALLA DE LOGIN ---
  if (!isAuthenticated) {
    return (
      <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a', justifyContent: 'center', alignItems: 'center', fontFamily: 'Inter, sans-serif' }}>
        <div style={{ backgroundColor: '#1e293b', padding: '40px', borderRadius: '20px', border: '1px solid #334155', width: '400px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}>
          <h1 style={{ fontSize: '2rem', marginBottom: '10px' }}>🤖 DONCHEVAS</h1>
          <p style={{ color: '#94a3b8', marginBottom: '30px' }}>Ingresa la llave maestra familiar</p>
          <form onSubmit={handleLogin}>
            <input 
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Contraseña..."
              style={{ width: '100%', padding: '15px', borderRadius: '10px', border: '1px solid #334155', backgroundColor: '#0f172a', color: 'white', marginBottom: '20px', outline: 'none' }}
            />
            {loginError && <p style={{ color: '#f87171', fontSize: '0.8rem', marginBottom: '15px' }}>{loginError}</p>}
            <button type="submit" style={{ width: '100%', padding: '15px', borderRadius: '10px', backgroundColor: '#38bdf8', color: '#0f172a', fontWeight: 'bold', border: 'none', cursor: 'pointer' }}>
              Acceder al Sistema
            </button>
          </form>
        </div>
      </div>
    );
  }

  // --- RENDERIZADO DEL CHAT (Tu diseño original) ---
  return (
    <div style={{ display: 'flex', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif' }}>
      
      {/* SIDEBAR */}
      <div style={{ width: '280px', backgroundColor: '#1e293b', padding: '30px', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h2 style={{ color: '#38bdf8', fontSize: '1.2rem', marginBottom: '10px' }}>🛡️ Datos Privados</h2>
        <div style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.6' }}>
          <p>• **Fuente:** Documentos Familiares</p>
          <p>• **Seguridad:** Backend Validated</p>
          <p>• **Motor:** Gemini 2.5 Flash Lite</p>
        </div>
        <button 
          onClick={() => { setIsAuthenticated(false); localStorage.removeItem('donchevas_auth'); }}
          style={{ marginTop: '20px', padding: '10px', background: 'none', border: '1px solid #f87171', color: '#f87171', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem' }}
        >
          Cerrar Sesión
        </button>
        <div style={{ marginTop: 'auto', fontSize: '0.8rem', borderTop: '1px solid #334155', paddingTop: '20px' }}>
          <p style={{ color: '#38bdf8' }}>Desarrollado por: <br/><strong style={{ fontSize: '1rem' }}>Christian Molina</strong></p>
        </div>
      </div>

      {/* ÁREA DE CHAT */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
        <div style={{ textAlign: 'center', padding: '35px 20px' }}>
          <h1 style={{ fontSize: '2.4rem', margin: 0, fontWeight: 800 }}>👨‍👩‍👦 Personal Knowledge Bot</h1>
          <p style={{ color: '#94a3b8', marginTop: '8px' }}>Información exclusiva de la familia Molina - Valdivia</p>
        </div>

        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '0 15% 120px 15%', display: 'flex', flexDirection: 'column', gap: '25px' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
              <span style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '4px', fontWeight: 'bold', letterSpacing: '1px' }}>
                {msg.role === 'user' ? 'TÚ' : '🤖 DONCHEVAS'}
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
          {loading && <div style={{ color: '#38bdf8', fontSize: '0.9rem', fontStyle: 'italic', marginLeft: '10px' }}>Donchevas está consultando tus documentos... 🔍</div>}
        </div>

        {/* INPUT */}
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
            <button onClick={sendMessage} disabled={loading} style={{ background: '#38bdf8', border: 'none', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', marginLeft: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <span style={{ fontSize: '1.3rem', color: '#0f172a' }}>➤</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;