import { useState } from 'react';
import { Bot, Send, User, AlertCircle } from 'lucide-react';
import './AISymptomChecker.css';

const AISymptomChecker = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI Medical Assistant. Please describe your symptoms, and I'll do my best to guide you. (Note: This is not a substitute for professional medical advice)", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { id: Date.now(), text: input, isBot: false };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = "Based on your symptoms, it's difficult to give a precise diagnosis. Please consult a registered doctor on our platform.";
      
      const lowerInput = userMessage.text.toLowerCase();
      if (lowerInput.includes('headache') && lowerInput.includes('fever')) {
        aiResponse = "Symptoms of headache and fever can indicate a viral infection or flu. Please monitor your temperature, stay hydrated, and consider booking a consultation with a General Physician.";
      } else if (lowerInput.includes('stomach') || lowerInput.includes('nausea')) {
        aiResponse = "Stomach pain or nausea could be related to digestion issues or food poisoning. I recommend you speak with a Gastroenterologist or General Physician.";
      } else if (lowerInput.includes('skin') || lowerInput.includes('rash')) {
        aiResponse = "Skin issues might require a visual examination. A Dermatologist would be best equipped to help you with this.";
      }

      setMessages((prev) => [...prev, { id: Date.now(), text: aiResponse, isBot: true }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <div className="ai-checker glass-card">
      <div className="ai-header">
        <Bot size={24} className="ai-icon" />
        <div>
          <h3>AI Symptom Checker</h3>
          <p>Get preliminary triage advice</p>
        </div>
      </div>
      
      <div className="ai-disclaimer">
        <AlertCircle size={16} />
        <span>For informational purposes only. In case of emergency, call local emergency services immediately.</span>
      </div>

      <div className="ai-chat-area">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-message ${msg.isBot ? 'bot' : 'user'}`}>
            <div className="avatar">
              {msg.isBot ? <Bot size={16} /> : <User size={16} />}
            </div>
            <div className="message-content">
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="chat-message bot typing">
            <div className="avatar"><Bot size={16} /></div>
            <div className="message-content typing-indicator">
              <span>.</span><span>.</span><span>.</span>
            </div>
          </div>
        )}
      </div>

      <form className="ai-input-area" onSubmit={handleSend}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your symptoms here..."
          disabled={isTyping}
        />
        <button type="submit" disabled={isTyping || !input.trim()} className="btn btn-primary">
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default AISymptomChecker;
