"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export default function Chatbot() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hi! How can I assist you with CarMarket today?" },
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user's message
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");

    // Call OpenAI API
    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input, userId: session?.user?.id }),
      });
      const { reply } = await response.json();
      setMessages((prev) => [...prev, { sender: "bot", text: reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, something went wrong. Try again!" },
      ]);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
        >
          Chat
        </button>
      ) : (
        <div className="w-80 h-96 bg-white rounded-lg shadow-lg flex flex-col">
          <div className="flex justify-between items-center p-2 bg-blue-600 text-white rounded-t-lg">
            <span>CarMarket Assistant</span>
            <button onClick={() => setIsOpen(false)} className="text-xl">&times;</button>
          </div>
          <div className="flex-1 p-2 overflow-y-auto">
            {messages.map((msg, index) => (
              <div
                key={index} // Use a unique ID in production
                className={`mb-2 p-2 rounded-lg ${
                  msg.sender === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"
                }`}
              >
                {msg.text}
              </div>
            ))}
          </div>
          <div className="p-2 border-t">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Type a message..."
              className="w-full p-1 border rounded focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="mt-1 w-full bg-blue-600 text-white p-1 rounded hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}