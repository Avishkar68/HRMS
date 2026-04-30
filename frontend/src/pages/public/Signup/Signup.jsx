import React from "react";
import { Link } from "react-router-dom";

const Signup = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4">Get an Account</h2>
        <p className="text-gray-600 mb-6">
          User accounts in this HRMS are created by your company administrator.
          Contact your admin or HR team to get your login credentials.
        </p>
        <Link
          to="/signin"
          className="inline-block bg-black text-white px-6 py-2 rounded hover:opacity-90"
        >
          Back to Sign In
        </Link>
      </div>
    </div>
  );
};

export default Signup;
