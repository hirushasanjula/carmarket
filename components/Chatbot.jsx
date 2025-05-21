"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { MessageCircle, Send, X, ChevronDown, ChevronUp } from "lucide-react";

export default function Chatbot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([
    { 
      sender: "bot", 
      text: "Hi! How can I assist you with VehicleMarket today?",
      timestamp: new Date()
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [messages, isOpen, isMinimized]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user's message
    const userMessage = {
      sender: "user",
      text: input,
      timestamp: new Date()
    };
    
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Call OpenAI API
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userId: session?.user?.id }),
      });
      const { reply } = await response.json();
      
      // Simulate typing delay for more natural feel
      setTimeout(() => {
        setIsTyping(false);
        setMessages((prev) => [
          ...prev, 
          { 
            sender: "bot", 
            text: reply,
            timestamp: new Date()
          }
        ]);
      }, 500 + Math.random() * 1000);
      
    } catch (error) {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { 
          sender: "bot", 
          text: "Sorry, something went wrong. Try again!",
          timestamp: new Date()
        },
      ]);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-4 rounded-full shadow-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-300 flex items-center justify-center"
          aria-label="Open chat"
        >
          <MessageCircle size={24} />
        </button>
      ) : (
        <div className={`bg-white rounded-lg shadow-xl flex flex-col transition-all duration-300 ${isMinimized ? 'w-64 h-12' : 'w-96 h-128'} max-h-96 border border-gray-200`}>
          <div className="flex justify-between items-center p-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <MessageCircle size={18} />
              <span className="font-medium">VehicleMarket Assistant</span>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                onClick={toggleMinimize} 
                className="hover:bg-blue-700 rounded p-1 transition-colors"
                aria-label={isMinimized ? "Expand chat" : "Minimize chat"}
              >
                {isMinimized ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:bg-blue-700 rounded p-1 transition-colors"
                aria-label="Close chat"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          {!isMinimized && (
            <>
              <div className="flex-1 p-3 overflow-y-auto bg-gray-50">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`mb-3 flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div 
                      className={`max-w-3/4 p-3 rounded-2xl ${
                        msg.sender === "user" 
                          ? "bg-blue-600 text-white rounded-br-none" 
                          : "bg-gray-200 text-gray-800 rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm">{msg.text}</p>
                      <p className={`text-xs mt-1 ${msg.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                        {formatTime(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start mb-3">
                    <div className="bg-gray-200 text-gray-800 p-3 rounded-2xl rounded-bl-none">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
              
              <div className="p-3 border-t border-gray-200 bg-white rounded-b-lg">
                <div className="flex items-center space-x-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    placeholder="Type a message..."
                    className="flex-1 p-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSend}
                    disabled={!input.trim()}
                    className={`p-2 rounded-full ${
                      input.trim() 
                        ? "bg-blue-600 hover:bg-blue-700" 
                        : "bg-gray-300"
                    } text-white transition-colors duration-200`}
                    aria-label="Send message"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}