"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";
import { AlertMessage } from "../../../components/AlertMessage"; // Make sure path is correct

const AdminVehicleApproval = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { data: session, status } = useSession();
  const [alert, setAlert] = useState({ show: false, type: "", message: "" });

  useEffect(() => {
    if (status === "authenticated" && session?.user?.role === "admin") {
      fetchPendingVehicles();
    }
  }, [status, session]);

  const fetchPendingVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles/pending", {
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) {
        throw new Error(`Failed to fetch pending vehicles: ${response.status}`);
      }
      const data = await response.json();
      setVehicles(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching pending vehicles:", error);
      setError(error.message);
      setLoading(false);
    }
  };

  const handleApproveVehicle = async (vehicleId) => {
    try {
      console.log("Approving vehicle with ID:", vehicleId);
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Active" }),
      });
  
      console.log("Response status:", response.status);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to approve vehicle: ${response.status} - ${errorText}`);
      }
  
      const result = await response.json();
      console.log("Approval result:", JSON.stringify(result, null, 2));
      if (result.success) {
        setVehicles((prevVehicles) =>
          prevVehicles.filter((vehicle) => vehicle._id !== vehicleId)
        );
        setAlert({
          show: true,
          type: "success",
          message: "Vehicle listing approved successfully!"
        });
      }
    } catch (error) {
      console.error("Error approving vehicle:", error);
      setAlert({
        show: true,
        type: "error",
        message: error.message || "Failed to approve vehicle"
      });
    }
  };

  const handleRejectVehicle = async (vehicleId) => {
    if (!confirm("Are you sure you want to reject this vehicle listing?")) {
      return;
    }
  
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected" }), // Send status update
      });
  
      if (!response.ok) {
        throw new Error(`Failed to reject vehicle: ${response.status}`);
      }
  
      const result = await response.json();
      if (result.success) {
        setVehicles((prevVehicles) =>
          prevVehicles.filter((vehicle) => vehicle._id !== vehicleId)
        );
        setAlert({
          show: true,
          type: "success", 
          message: "Vehicle listing rejected successfully!"
        });
      }
    } catch (error) {
      console.error("Error rejecting vehicle:", error);
      setAlert({
        show: true, 
        type: "error", 
        message: error.message || "Failed to reject vehicle"
      });
    }
  };

  const dismissAlert = () => {
    setAlert({ show: false, type: "", message: "" });
  };

  const formatPrice = (price) => (price ? price.toLocaleString() : "0");
  const getMainImage = (vehicle) =>
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images[0]
      : "/api/placeholder/400/300";

  if (status === "loading") {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <p>Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "admin") {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Access Denied</p>
          <p>You must be an admin to access this page.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-4 flex justify-center items-center h-64">
        <p>Loading pending vehicles...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {alert.show && (
        <AlertMessage 
          type={alert.type} 
          message={alert.message} 
          onDismiss={dismissAlert} 
        />
      )}

      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Admin Vehicle Approval
      </h1>

      {vehicles.length === 0 ? (
        <div className="text-center p-8 bg-white rounded-lg shadow">
          <p className="text-xl text-gray-600">No pending vehicle listings</p>
          <p className="mt-2 text-gray-500">
            All listings have been reviewed or none are pending.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {vehicles.map((vehicle) => (
            <div
              key={vehicle._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
            >
              <div className="h-48">
                <img
                  src={getMainImage(vehicle)}
                  alt={vehicle.model}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/api/placeholder/400/300";
                  }}
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {vehicle.year} {vehicle.model}
                </h3>
                <p className="text-xl font-bold text-blue-600 mb-2">
                  ${formatPrice(vehicle.price)}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Type: {vehicle.vehicle_type || "N/A"}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  Seller: {vehicle.user?.name || "Unknown"}
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Condition: {vehicle.vehicle_condition || "N/A"}
                </p>
                <div className="flex justify-between gap-2">
                  <button
                    onClick={() => handleApproveVehicle(vehicle._id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  >
                    <CheckCircleIcon className="w-4 h-4 mr-2" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleRejectVehicle(vehicle._id)}
                    className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                  >
                    <XCircleIcon className="w-4 h-4 mr-2" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVehicleApproval;