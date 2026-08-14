import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Paperclip, PhoneOff } from 'lucide-react';

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'bot',
      text: "Hello there. I'm Care Guard AI, here to help you understand patient hospitalization risk predictions. To get started, could you please answer the questions asked..",
    },
  ]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const toggleChat = () => setIsOpen(!isOpen);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    // Add user message
    const newMsg = { id: Date.now(), sender: 'user', text: inputText };
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');

    // Simulate bot response
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: "I am analyzing your input regarding the patient's risk profile. One moment please...",
        },
      ]);
    }, 1000);
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      
      {/* The Chat Window */}
      {isOpen && (
        <div style={{
          width: '380px',
          height: '560px',
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.15)',
          marginBottom: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
          fontFamily: 'var(--font-family-base)'
        }}>
          {/* Header */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '16px',
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#f8fafc'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '16px',
                background: 'linear-gradient(135deg, #3E64FF, #5DD3F3)',
                display: 'flex', justifyContent: 'center', alignItems: 'center', color: '#fff', fontWeight: 'bold'
              }}>
                CG
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 600, color: '#0f1d40' }}>Care Guard AI</h3>
                <span style={{ fontSize: '12px', color: '#10b981' }}>● Online</span>
              </div>
            </div>
            <button onClick={toggleChat} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#ffffff' }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: msg.sender === 'user' ? '#3E64FF' : '#f1f5f9',
                color: msg.sender === 'user' ? '#ffffff' : '#334155',
                fontSize: '14px',
                lineHeight: 1.5,
                borderBottomRightRadius: msg.sender === 'user' ? '4px' : '12px',
                borderBottomLeftRadius: msg.sender === 'bot' ? '4px' : '12px',
              }}>
                {msg.text}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{ padding: '16px', borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }}>
            <form onSubmit={handleSend} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <input
                type="text"
                placeholder="Send a message to start the conversation"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                  outline: 'none',
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button type="button" onClick={toggleChat} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#ef4444', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                  <PhoneOff size={14} /> End chat
                </button>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#64748b', fontSize: '13px', fontWeight: 500, cursor: 'pointer' }}>
                    <Paperclip size={14} /> Attach
                  </button>
                  <button type="submit" disabled={!inputText.trim()} style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', 
                    background: inputText.trim() ? '#3E64FF' : '#cbd5e1', 
                    color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', 
                    fontSize: '13px', fontWeight: 500, cursor: inputText.trim() ? 'pointer' : 'not-allowed',
                    transition: 'background 0.2s'
                  }}>
                    Send <Send size={14} />
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '32px',
            backgroundColor: '#3E64FF',
            color: 'white',
            border: 'none',
            boxShadow: '0 8px 24px rgba(62, 100, 255, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.2s',
          }}
          onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
          aria-label="Open AI Assistant"
        >
          <MessageCircle size={32} />
        </button>
      )}
    </div>
  );
}
