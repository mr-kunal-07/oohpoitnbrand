"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import logo from "../../public/logo.webp";
import login from "@/public/login.svg";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";

const SignIn = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.push("/");
      }
    });
    return () => unsubscribe();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userCredential.user;
      
      if (user) {
        toast.success("Login successful.");
        router.push("/");
      }

    } catch (error) {

      setErrorMessage(error.code === "auth/invalid-credential" ? "Invalid Credentails" : "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-white md:bg-gradient-to-b from-[#1A0933] to-[#4D1B99]">
      {/* Background Gradient */}

      <div className="flex items-center justify-center">
        <div className="hidden md:block md:w-2/5 bg-white h-full">
          <div className="bg-gradient-to-b from-[#1A0933] to-[#4D1B99] rounded-br-[48px] h-screen">
            <div className="p-8">
              <Image src={logo} height={75} width={75} alt="Logo" />
            </div>
            <div className="relative h-96 w-full mt-12">
              <Image src={login} fill className="object-contain" />
            </div>
          </div>
        </div>
        {/* Content */}
        <div className="md:w-3/5">
          {/* Logo */}

          {/* Form Container */}
          <div className="bg-white h-screen w-full md:rounded-tl-[48px] flex justify-center items-center">
            <div className="w-96 p-8 md:py-8">
              <h3 className="font-bold text-3xl py-2">Sign In</h3>
              <p className="text-sm font-bold text-[#666666]">
                Please fill in your unique admin login details below
              </p>

              {/* Form */}
              <form
                className="flex flex-col gap-4"
                onSubmit={handleSubmit}
              >
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

                {/* Password Field */}
                <div className="text-black">
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-[#666666]"
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    id="password"
                    className="bg-oohpoint-grey-200 mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent border-none"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>

                <div className="w-full flex md:justify-end">
                  <h3
                    onClick={() => router.push("forget-password")}
                    className="text-sm font-medium text-[#666666] cursor-pointer"
                  >
                    Forgot Password?
                  </h3>
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <p className="text-red-500 text-sm text-center">
                    {errorMessage}
                  </p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full py-3 mt-6 bg-[#6825CC] hover:bg-[#341266] transition-colors duration-300 text-white font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50"
                  disabled={loading}
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
