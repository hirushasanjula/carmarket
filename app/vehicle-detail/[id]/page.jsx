"use client";

import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Share2, Flag, ArrowLeft, MessageSquare, XCircleIcon } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import RecommendedVehicles from "@/components/RecommendedVehicles";
import VehicleMap from "@/components/VehicleMap";

export default function VehicleDetailPage() {
  const [vehicle, setVehicle] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const params = useParams();
  const router = useRouter();
  const vehicleId = params.id;
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchVehicleDetails = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/vehicles/${vehicleId}`, {
          credentials: "include",
        });
        if (!response.ok) {
          if (response.status === 404) throw new Error("Vehicle not found");
          throw new Error(`Failed to fetch vehicle: ${response.status} ${response.statusText}`);
        }
        const data = await response.json();
        setVehicle(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching vehicle details:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    if (vehicleId) {
      fetchVehicleDetails();
      if (status === "authenticated") {
        fetch("/api/interactions", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ vehicleId, action: "view" }),
          credentials: "include",
        }).catch((err) => console.error("Error recording view:", err));
      }
    }
  }, [vehicleId, status]);

  useEffect(() => {
    if (!isChatOpen || !vehicle?.user?._id || status !== "authenticated") return;

    const fetchMessages = async () => {
      try {
        const response = await fetch(`/api/messages?vehicleId=${vehicleId}&receiverId=${vehicle.user._id}`);
        if (!response.ok) throw new Error("Failed to fetch messages");
        const { messages } = await response.json();
        setChatMessages(messages);
      } catch (err) {
        console.error("Error fetching chat messages:", err);
      }
    };

    fetchMessages();
  }, [isChatOpen, vehicle, vehicleId, status]);

  const handleLike = async () => {
    if (status !== "authenticated") {
      alert("Please log in to like this vehicle");
      return;
    }
    try {
      const res = await fetch("/api/interactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vehicleId, action: "like" }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to record like");
      const data = await res.json();
      console.log("Like recorded:", data);
    } catch (error) {
      console.error("Error liking vehicle:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !vehicle?.user?._id || status !== "authenticated") return;

    try {
      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: vehicle.user._id,
          content: newMessage,
          vehicleId,
        }),
      });
      if (!response.ok) throw new Error("Failed to send message");
      const { message } = await response.json();
      setChatMessages((prev) => [message, ...prev]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
      alert("Failed to send message");
    }
  };

  const formatPrice = (price) => (price ? price.toLocaleString() : "0");
  const getImageOrPlaceholder = (index) => {
    if (!vehicle || !vehicle.images || vehicle.images.length === 0) return "/api/placeholder/800/500";
    if (index >= vehicle.images.length) return vehicle.images[0];
    return vehicle.images[index];
  };
  const handleBackClick = (e) => {
    e.preventDefault();
    router.back();
  };
  const getVehicleSpecs = () => {
    if (!vehicle) return {};
    return {
      condition: vehicle.vehicle_condition === "brand-new" ? "Brand New" :
                 vehicle.vehicle_condition === "unregister" ? "Unregistered" : "Used",
      year: vehicle.year,
      mileage: vehicle.mileage ? `${vehicle.mileage.toLocaleString()} km` : "N/A",
      transmission: vehicle.transmission || "N/A",
      fuelType: vehicle.fuelType || "N/A",
      type: vehicle.vehicle_type ? vehicle.vehicle_type.charAt(0).toUpperCase() + vehicle.vehicle_type.slice(1) : "N/A",
    };
  };

  if (loading) return <div className="min-h-screen bg-gray-50 flex justify-center items-center"><p>Loading vehicle details...</p></div>;
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
        <button onClick={handleBackClick} className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft size={20} className="mr-2" /> Back to listings
        </button>
      </div>
    </div>
  );
  if (!vehicle) return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center">
      <p>Vehicle not found</p>
      <button onClick={handleBackClick} className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700">
        <ArrowLeft size={20} className="mr-2" /> Back to listings
      </button>
    </div>
  );

  const vehicleSpecs = getVehicleSpecs();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <button onClick={handleBackClick} className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
          <ArrowLeft size={20} className="mr-2" /> Back to listings
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="relative aspect-video">
                <img
                  src={getImageOrPlaceholder(activeImage)}
                  alt={vehicle.model}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = "/api/placeholder/800/500"; e.target.onerror = null; }}
                />
              </div>
              <div className="p-4 grid grid-cols-4 gap-2">
                {vehicle.images && vehicle.images.length > 0 ? (
                  vehicle.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveImage(index)}
                      className={`aspect-video rounded-lg overflow-hidden border-2 ${activeImage === index ? "border-blue-600" : "border-transparent"}`}
                    >
                      <img
                        src={image}
                        alt={`${vehicle.model} ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => { e.target.src = "/api/placeholder/800/500"; e.target.onerror = null; }}
                      />
                    </button>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-4 text-gray-500">No additional images available</div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Vehicle Details</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {Object.entries(vehicleSpecs).map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-sm text-gray-500 capitalize">{key}</dt>
                    <dd className="text-base font-medium text-gray-900">{value}</dd>
                  </div>
                ))}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Description</h3>
              <p className="text-gray-600 mb-6">{vehicle.description || "No description provided"}</p>
              {vehicle.location && vehicle.location.coordinates.coordinates[0] !== 0 && (
                <div className="mt-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Vehicle Location</h3>
                  <VehicleMap
                    latitude={vehicle.location.coordinates.coordinates[1]}
                    longitude={vehicle.location.coordinates.coordinates[0]}
                    title={`${vehicle.year} ${vehicle.model} - ${vehicle.location.city}`}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Approximate location based on seller-provided coordinates.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
              <div className="mb-4">
                <h1 className="text-2xl font-bold text-gray-900">{vehicle.year} {vehicle.model}</h1>
                <p className="text-3xl font-bold text-blue-600 mt-2">Rs. {formatPrice(vehicle.price)}</p>
              </div>
              {vehicle.location && (
                <div className="flex items-center text-gray-600 mb-4">
                  <MapPin size={20} className="mr-2" />
                  <span>{vehicle.location.region}, {vehicle.location.city}</span>
                </div>
              )}
              {/* Updated Contact Details */}
              <div className="space-y-4 mb-6">
                {vehicle.contactPhone && (
                  <div className="flex items-center text-gray-600">
                    <Phone size={20} className="mr-2" />
                    <a href={`tel:${vehicle.contactPhone}`} className="hover:underline">
                      {vehicle.contactPhone}
                    </a>
                  </div>
                )}
                {vehicle.contactEmail && (
                  <div className="flex items-center text-gray-600">
                    <Mail size={20} className="mr-2" />
                    <a href={`mailto:${vehicle.contactEmail}`} className="hover:underline">
                      {vehicle.contactEmail}
                    </a>
                  </div>
                )}
                {!vehicle.contactPhone && !vehicle.contactEmail && (
                  <p className="text-gray-500">No contact details provided by seller.</p>
                )}
              </div>
              <div className="space-y-3">
                {vehicle.contactPhone && (
                  <a
                    href={`tel:${vehicle.contactPhone}`}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Phone size={20} /> <span>Call Seller</span>
                  </a>
                )}
                {vehicle.user && vehicle.user.email && (
                  <button
                    onClick={() => status === "authenticated" ? setIsChatOpen(true) : alert("Please log in to message the seller")}
                    className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 border-2 border-blue-600 px-6 py-3 rounded-lg hover:bg-blue-50 transition-colors"
                  >
                    <MessageSquare size={20} /> <span>Message Seller</span>
                  </button>
                )}
                <button
                  onClick={handleLike}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
                >
                  <span>Like Vehicle</span>
                </button>
              </div>
              <div className="flex justify-between mt-6 pt-6 border-t border-gray-200">
                <button className="flex items-center text-gray-600 hover:text-blue-600">
                  <Share2 size={20} className="mr-2" /> Share
                </button>
                <button className="flex items-center text-gray-600 hover:text-red-600">
                  <Flag size={20} className="mr-2" /> Report
                </button>
              </div>
            </div>
          </div>
        </div>

        {isChatOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg w-full max-w-md p-6 relative">
              <button
                onClick={() => setIsChatOpen(false)}
                className="absolute top-2 right-2 text-gray-600 hover:text-gray-800"
              >
                <XCircleIcon size={24} />
              </button>
              <h2 className="text-xl font-bold mb-4">
                Message {vehicle.user.name} about {vehicle.year} {vehicle.model}
              </h2>
              <div className="h-64 overflow-y-auto mb-4 flex flex-col gap-2">
                {chatMessages.length === 0 ? (
                  <p className="text-gray-500 text-center">No messages yet</p>
                ) : (
                  chatMessages
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
                    ))
                )}
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
            </div>
          </div>
        )}

        <RecommendedVehicles currentVehicleId={vehicleId} />
      </div>
    </div>
  );
}