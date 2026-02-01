import React, { useEffect, useState } from "react";
import axios from "axios";

const MarkAttendance = () => {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}` };

  const fetchStatus = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:3000/api/attendance/today",
        { headers }
      );
      setStatus(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleCheckIn = async () => {
    if (!navigator.geolocation) {
      alert("Geolocation not supported");
      return;
    }
  
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          await axios.post(
            "http://localhost:3000/api/attendance/check-in",
            {
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              accuracy: pos.coords.accuracy
            },
            { headers }
          );
          fetchStatus();
        } catch (err) {
          alert(err.response?.data?.message || "Check-in failed");
        }
      },
      (error) => {
        // 🔥 THIS WAS MISSING
        console.error(error);
        alert("Location permission is required to check in");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };
  

  const handleCheckOut = async () => {
    try {
      await axios.post(
        "http://localhost:3000/api/attendance/check-out",
        {},
        { headers }
      );
      fetchStatus();
    } catch (err) {
      alert(err.response?.data?.message || "Check-out failed");
    }
  };
  
  /* ================= UI ================= */

  if (loading) {
    return (
      <div className="bg-white p-6 rounded shadow max-w-md">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded shadow max-w-md">
      <h2 className="text-xl font-bold mb-4">Mark Attendance</h2>

      {/* 🔵 ON LEAVE */}
      {status?.status === "on_leave" && (
        <div className="bg-blue-100 text-blue-700 p-3 rounded text-sm">
          You are on approved leave today.
        </div>
      )}

      {!status && (
        <button
          onClick={handleCheckIn}
          className="bg-green-600 text-white px-4 py-2"
        >
          Check In
        </button>
      )}

      {status?.status === "on_leave" && (
        <button
          disabled
          className="bg-gray-300 text-gray-600 px-4 py-2 cursor-not-allowed"
        >
          On Leave
        </button>
      )}

      {/* ✅ CHECK OUT */}
      {status && status.status !== "on_leave" && !status.checkOutTime && (
        <button
          onClick={handleCheckOut}
          className="bg-red-600 text-white px-4 py-2"
        >
          Check Out
        </button>
      )}

      {/* ℹ️ STATUS INFO */}
      {status && status.status !== "on_leave" && (
        <div className="mt-4 text-sm space-y-1">
          <p>
            <b>Check In:</b> {status.checkInTime || "--"}
          </p>
          <p>
            <b>Check Out:</b> {status.checkOutTime || "--"}
          </p>
          <p>
            <b>Status:</b> {status.status}
          </p>
        </div>
      )}
    </div>
  );
};

export default MarkAttendance;
