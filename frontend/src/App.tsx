/* 1. Asegúrate de importar esto al inicio de tu App.tsx */
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Esto ayuda con el formato de listas y tablas

// ... dentro de tu map de mensajes:

{messages.map((msg, i) => (
  <div key={i} style={{ 
    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
    maxWidth: '85%',
    padding: '18px 25px', // Más espaciado interno
    borderRadius: '18px',
    backgroundColor: msg.role === 'user' ? '#38bdf8' : '#1e293b',
    color: msg.role === 'user' ? '#0f172a' : '#f8fafc',
    fontSize: '1.05rem',
    lineHeight: '1.7', // Aumentamos el interlineado para que sea más legible
    boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
    whiteSpace: 'pre-wrap' // <--- ESTO ES CLAVE: Mantiene los saltos de línea originales
  }}>
    {msg.role === 'user' ? (
      msg.text
    ) : (
      <ReactMarkdown 
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({node, ...props}) => <p style={{margin: '0 0 15px 0', display: 'block'}} {...props} />,
          li: ({node, ...props}) => <li style={{margin: '8px 0', listStylePosition: 'inside'}} {...props} />,
          ul: ({node, ...props}) => <ul style={{paddingLeft: '10px', margin: '10px 0'}} {...props} />,
          strong: ({node, ...props}) => <strong style={{color: '#38bdf8', fontWeight: 'bold'}} {...props} />
        }}
      >
        {msg.text}
      </ReactMarkdown>
    )}
  </div>
))}