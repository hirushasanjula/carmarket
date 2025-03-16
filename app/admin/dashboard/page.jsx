"use client";

import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CheckCircleIcon, XCircleIcon } from "lucide-react";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("listings");
  const [vehicles, setVehicles] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect non-admins
  useEffect(() => {
    if (status === "authenticated" && session?.user?.role !== "admin") {
      router.push("/");
    }
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, session, router]);

  // Fetch data based on active tab
  useEffect(() => {
    if (status !== "authenticated" || session?.user?.role !== "admin") return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (activeTab === "listings") {
          const response = await fetch("/api/vehicles/pending", {
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to fetch pending vehicles");
          const data = await response.json();
          setVehicles(Array.isArray(data) ? data : []);
        } else if (activeTab === "users") {
          const response = await fetch("/api/admin/users", {
            headers: { "Content-Type": "application/json" },
          });
          if (!response.ok) throw new Error("Failed to fetch users");
          const data = await response.json();
          setUsers(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab, status, session]);

  // Approve vehicle (reused from your code)
  const handleApproveVehicle = async (vehicleId) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Active" }),
      });
      if (!response.ok) throw new Error(`Failed to approve vehicle: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setVehicles((prev) => prev.filter((vehicle) => vehicle._id !== vehicleId));
        alert("Vehicle listing approved successfully!");
      }
    } catch (error) {
      console.error("Error approving vehicle:", error);
      setError(error.message);
    }
  };

  // Reject vehicle (reused from your code)
  const handleRejectVehicle = async (vehicleId) => {
    if (!confirm("Are you sure you want to reject this vehicle listing?")) return;
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "Rejected" }),
      });
      if (!response.ok) throw new Error(`Failed to reject vehicle: ${response.status}`);
      const result = await response.json();
      if (result.success) {
        setVehicles((prev) => prev.filter((vehicle) => vehicle._id !== vehicleId));
        alert("Vehicle listing rejected successfully!");
      }
    } catch (error) {
      console.error("Error rejecting vehicle:", error);
      setError(error.message);
    }
  };

  // Update user role
  const handleRoleUpdate = async (userId, newRole) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      });
      if (!response.ok) throw new Error("Failed to update role");
      setUsers((prev) =>
        prev.map((user) => (user._id === userId ? { ...user, role: newRole } : user))
      );
      alert("User role updated successfully!");
    } catch (err) {
      setError(err.message);
    }
  };

  const formatPrice = (price) => (price ? price.toLocaleString() : "0");
  const getMainImage = (vehicle) =>
    vehicle.images && vehicle.images.length > 0
      ? vehicle.images[0]
      : "/api/placeholder/400/300";

  if (status === "loading") return <div className="text-center py-8">Loading...</div>;
  if (session?.user?.role !== "admin") return null;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          onClick={() => setActiveTab("listings")}
          className={`px-4 py-2 font-medium ${
            activeTab === "listings"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          Manage Listings
        </button>
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-medium ${
            activeTab === "users"
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-600 hover:text-blue-600"
          }`}
        >
          User Management
        </button>
      </div>

      {/* Error Display */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Listings Tab */}
      {activeTab === "listings" && (
        <div>
          {loading ? (
            <div className="text-center py-8">Loading pending vehicles...</div>
          ) : vehicles.length === 0 ? (
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
                      onError={(e) => (e.target.src = "/api/placeholder/400/300")}
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
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <CheckCircleIcon className="w-4 h-4 mr-2" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleRejectVehicle(vehicle._id)}
                        className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
      )}

      {/* Users Tab */}
      {activeTab === "users" && (
        <div>
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : users.length === 0 ? (
            <div className="text-center p-8 bg-white rounded-lg shadow">
              <p className="text-xl text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {users.map((user) => (
                <div
                  key={user._id}
                  className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">{user.name}</h2>
                    <p className="text-sm text-gray-600">Email: {user.email}</p>
                    <p className="text-sm text-gray-600">Role: {user.role}</p>
                  </div>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleUpdate(user._id, e.target.value)}
                    className="px-3 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}