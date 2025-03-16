"use client";

import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
    if (status === "authenticated") {
      fetchMessages();
    }
  }, [status, session, router]);

  const fetchMessages = async () => {
    try {
      const response = await fetch("/api/messages");
      if (!response.ok) throw new Error("Failed to fetch messages");
      const { messages } = await response.json();
      setMessages(messages);
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
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedUser._id,
          content: newMessage,
          vehicleId: null, // Add vehicleId if linked to a vehicle
        }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      const { message } = await response.json();
      setMessages((prev) => [message, ...prev]);
      setNewMessage("");
    } catch (err) {
      setError(err.message);
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

  // Group messages by conversation partner
  const conversations = messages.reduce((acc, msg) => {
    const otherUser =
      msg.sender._id === session?.user.id ? msg.receiver : msg.sender;
    if (!acc[otherUser._id]) {
      acc[otherUser._id] = { user: otherUser, messages: [] };
    }
    acc[otherUser._id].messages.push(msg);
    return acc;
  }, {});

  if (status === "loading" || loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/3 bg-white rounded-lg shadow-md p-4">
        <h2 className="text-xl font-bold mb-4">Conversations</h2>
        {Object.keys(conversations).length === 0 ? (
          <p className="text-gray-600">No messages yet</p>
        ) : (
          Object.values(conversations).map((conv) => (
            <div
              key={conv.user._id}
              onClick={() => {
                setSelectedUser(conv.user);
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
                {conv.messages[0].content}
              </p>
            </div>
          ))
        )}
      </div>

      <div className="w-full md:w-2/3 bg-white rounded-lg shadow-md p-4">
        {selectedUser ? (
          <>
            <h2 className="text-xl font-bold mb-4">Chat with {selectedUser.name}</h2>
            <div className="h-96 overflow-y-auto mb-4 flex flex-col gap-2">
              {conversations[selectedUser._id].messages
                .slice()
                .reverse()
                .map((msg) => (
                  <div
                    key={msg._id}
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