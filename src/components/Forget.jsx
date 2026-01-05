"use client";
import React, { useState } from "react";
import Image from "next/image";
import logo from "@/public/logo.webp";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/firebase"; 
import toast from "react-hot-toast"; 
import { useRouter } from "next/navigation";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await sendPasswordResetEmail(auth, email);
      console.log(r);
      setMessage("Password reset email sent! Check your inbox.");
      toast.success("Reset link sent! 📧");
    } catch (error) {
      setMessage("Error sending password reset email. Try again.");
      toast.error("Oops! Something went wrong. 😕");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-oohpoint-primary-1"></div>

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-center items-center min-h-screen w-full text-white">
        {/* Logo */}
        <Image src={logo} height={100} width={100} alt="Logo" />

        {/* Form Container */}
        <div className="bg-white p-5 lg:p-12 rounded-lg shadow-lg w-full max-w-lg mt-8">
          <h2 className="text-sm font-bold text-center mb-6 text-[#666666]">
            Forgot your password? No worries, we got your back! 😉
          </h2>

          {/* Form */}
          <form className="flex flex-col gap-4" onSubmit={handleResetPassword}>
            {/* Email Field */}
            <div className="text-black">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-[#666666]"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-oohpoint-grey-200 mt-2 border-none"
                placeholder="Enter your email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Message */}
            {message && (
              <p className="text-green-500 text-sm text-center">{message}</p>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 mt-6 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
              disabled={loading}
            >
              {loading ? "Sending reset link..." : "Send Reset Link"}
            </button>
          </form>
          <h2 onClick={() => router.push("/sign-in")} className="text-sm font-bold text-center mt-6 text-[#666666] cursor-pointer">
            Login now!
          </h2>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
