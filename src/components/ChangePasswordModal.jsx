"use client"
import React, { useState } from "react";
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth";
import { auth } from "@/firebase"; // assuming you've set up Firebase config
import toast from "react-hot-toast";

const ChangePasswordModal = ({ onClose }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async () => {
    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    const user = auth.currentUser;
    const credential = EmailAuthProvider.credential(user.email, currentPassword);

    try {
      // Re-authenticate the user with the current password
      await reauthenticateWithCredential(user, credential);

      // Update the password
      await updatePassword(user, newPassword);
      toast.success("Password updated successfully!");
      onClose(); // close modal on success
    } catch (error) {
      setError("Failed to update password. Please check your current password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-[400px]">
        <h2 className="text-2xl font-bold mb-4">Change Password</h2>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="mb-4">
          <label className="block font-medium mb-1">Current Password</label>
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">New Password</label>
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border"
          />
        </div>

        <div className="mb-4">
          <label className="block font-medium mb-1">Confirm New Password</label>
          <input
            type="password"
            value={confirmNewPassword}
            onChange={(e) => setConfirmNewPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border"
          />
        </div>

        <button
          onClick={handlePasswordChange}
          className="bg-oohpoint-primary-2 hover:bg-oohpoint-primary-3 text-white py-2 px-6 rounded-lg hover:scale-95 transition-all w-full"
          disabled={loading}
        >
          {loading ? "Updating..." : "Change Password"}
        </button>

        <button onClick={onClose} className="w-full bg-oohpoint-grey-200 hover:scale-95 hover:text-white transition-all hover:bg-oohpoint-grey-300 mt-4 py-2 rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
