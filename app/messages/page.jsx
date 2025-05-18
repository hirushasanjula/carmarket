"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Messages() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
    if (status === "authenticated") {
      fetchMessages();
    }
  }, [status, session, router]);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, selectedUser]);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (!response.ok) throw new Error("Failed to fetch messages");
      const { messages } = await response.json();
      console.log("Fetched messages:", messages); // Debug log
      setMessages(messages || []); // Ensure messages is an array
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!selectedUser || !newMessage.trim()) return;

    try {
      const messageContent = newMessage.trim();
      setNewMessage(""); // Clear input immediately

      // Create a temporary message with all required fields
      const tempMessage = {
        _id: `temp-${Date.now()}`, // Temporary ID until server responds
        content: messageContent,
        sender: {
          _id: session.user.id,
          name: session.user.name,
          email: session.user.email
        },
        receiver: selectedUser,
        createdAt: new Date().toISOString(),
        read: false,
        isTemp: true // Flag to identify temp messages
      };

      // Add the temporary message to state immediately
      setMessages(prev => [tempMessage, ...prev]);

      // Send to server
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUser._id,
          content: messageContent,
          vehicleId: null,
        }),
      });

      if (!response.ok) throw new Error("Failed to send message");
      const { message } = await response.json();

      // Replace the temporary message with the server response
      setMessages(prev => 
        prev.map(msg => 
          msg._id === tempMessage._id ? { ...message, sender: tempMessage.sender, receiver: tempMessage.receiver } : msg
        )
      );
    } catch (err) {
      setError(err.message);
      // Remove the temporary message if there was an error
      setMessages(prev => prev.filter(msg => !msg.isTemp));
    }
  };

  const markAsRead = async (messageId) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      if (response.ok) {
        setMessages((prev) =>
          prev.map((msg) => (msg._id === messageId ? { ...msg, read: true } : msg))
        );
      }
    } catch (err) {
      console.error("Error marking message as read:", err);
    }
  };

  // Process messages into conversations
  const getConversations = () => {
    if (!session?.user?.id || !messages.length) return {};
    
    return messages.reduce((acc, msg) => {
      // Skip messages with incomplete data
      if (!msg.sender || !msg.receiver) {
        console.warn("Incomplete message data:", msg);
        return acc;
      }
      
      // Determine the other user in the conversation
      const otherUser = msg.sender._id === session.user.id ? msg.receiver : msg.sender;
      
      if (!otherUser || !otherUser._id) {
        console.warn("Missing user data in message:", msg);
        return acc;
      }
      
      if (!acc[otherUser._id]) {
        acc[otherUser._id] = { user: otherUser, messages: [] };
      }
      
      acc[otherUser._id].messages.push(msg);
      return acc;
    }, {});
  };
  
  const conversations = getConversations();

  // Find conversation messages for selected user
  const getConversationMessages = () => {
    if (!selectedUser || !selectedUser._id || !conversations[selectedUser._id]) {
      return [];
    }
    
    return [...conversations[selectedUser._id].messages]
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  const currentMessages = getConversationMessages();

  if (status === "loading" || loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
      <div className="w-full mt-20 md:w-1/3 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Conversations</h2>
        {Object.keys(conversations).length === 0 ? (
          <p className="text-gray-600">No messages yet</p>
        ) : (
          // Map through conversations with explicit index for keying
          Object.entries(conversations).map(([userId, conv], index) => (
            <div
              key={`conversation-${userId}-${index}`}
              onClick={() => {
                setSelectedUser(conv.user);
                // Mark unread messages as read
                conv.messages.forEach((msg) => {
                  if (!msg.read && msg.receiver._id === session.user.id) {
                    markAsRead(msg._id);
                  }
                });
              }}
              className={`p-3 mb-2 rounded-lg cursor-pointer ${
                selectedUser?._id === conv.user._id
                  ? "bg-blue-100 text-blue-800"
                  : "hover:bg-gray-100"
              }`}
            >
              <p className="font-semibold">{conv.user.name}</p>
              <p className="text-sm text-gray-600 truncate">
                {conv.messages[0]?.content || "No messages"}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="w-full mt-20 md:w-2/3 bg-white rounded-lg shadow-md p-4">
        {selectedUser ? (
          <>
            <h2 className="text-xl font-bold mb-4">Chat with {selectedUser.name}</h2>
            <div className="h-96 overflow-y-auto mb-4 flex flex-col gap-2 p-2">
              {currentMessages.map((msg, index) => (
                <div
                  key={`msg-${msg._id || index}-${msg.isTemp ? 'temp' : ''}`}
                  className={`p-3 rounded-lg max-w-[70%] ${
                    msg.sender._id === session.user.id
                      ? "bg-blue-500 text-white self-end"
                      : "bg-gray-200 text-gray-800 self-start"
                  }`}
                >
                  <p>{msg.content}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(msg.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
              <div ref={messagesEndRef} /> {/* For auto-scrolling */}
            </div>
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <p className="text-center text-gray-600 py-8">Select a conversation to start chatting</p>
        )}
      </div>
    </div>
  );
}