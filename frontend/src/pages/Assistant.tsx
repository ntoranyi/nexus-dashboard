import { useState, useRef, useEffect } from 'react';
import { Send, Zap, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import './Assistant.css';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const QUICK_ACTIONS = [
  'Analyse mes performances',
  'Trouve un produit gagnant',
  'Stratégie TikTok Ads',
  'Optimise mon budget',
];

export default function Assistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Bonjour CEO! Je suis NEXUS AI, votre assistant ecommerce 7 figures. Comment puis-je vous aider aujourd'hui?\n\nJe peux vous aider à:\n• Trouver des produits gagnants\n• Créer des stratégies publicitaires\n• Analyser vos performances\n• Optimiser votre ROI",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionId = useRef(`session-${Date.now()}`);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const data = await api.chat(sessionId.current, messageText);
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response || "Désolé, une erreur est survenue.",
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Erreur de connexion. Veuillez réessayer.",
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="assistant-page">
      <header className="assistant-header">
        <div className="avatar">
          <Zap size={24} color="#00d4aa" />
        </div>
        <div className="header-info">
          <h1>NEXUS AI</h1>
          <p>Assistant CEO 7 Figures</p>
        </div>
        <div className="status">
          <span className="status-dot" />
          En ligne
        </div>
      </header>

      <div className="messages-container">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.role}`}>
            {message.role === 'assistant' && (
              <div className="message-avatar">
                <Zap size={14} color="#00d4aa" />
              </div>
            )}
            <div className="message-content">
              {message.content.split('\n').map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>
          </div>
        ))}
        {loading && (
          <div className="message assistant">
            <div className="message-avatar">
              <Zap size={14} color="#00d4aa" />
            </div>
            <div className="message-content">
              <Loader2 size={20} className="spinning" color="#00d4aa" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {messages.length <= 2 && (
        <div className="quick-actions">
          {QUICK_ACTIONS.map(action => (
            <button
              key={action}
              className="quick-action"
              onClick={() => sendMessage(action)}
            >
              {action}
            </button>
          ))}
        </div>
      )}

      <div className="input-container">
        <div className="input-wrapper">
          <input
            placeholder="Posez votre question..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            disabled={loading}
          />
          <button
            className="send-btn"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
