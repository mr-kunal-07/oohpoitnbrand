"use client";

import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";

import { auth } from "../../firebase";
import logo from "../../../public/logo.webp";

// Constants
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const SignIn = () => {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  
  // Security state
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState(null);

  // Check for existing lockout on mount
  useEffect(() => {
    const storedLockoutEnd = localStorage.getItem('lockoutEndTime');
    if (storedLockoutEnd) {
      const endTime = parseInt(storedLockoutEnd);
      if (Date.now() < endTime) {
        setIsLocked(true);
        setLockoutEndTime(endTime);
      } else {
        localStorage.removeItem('lockoutEndTime');
        localStorage.removeItem('loginAttempts');
      }
    }

    const storedAttempts = localStorage.getItem('loginAttempts');
    if (storedAttempts) {
      setLoginAttempts(parseInt(storedAttempts));
    }
  }, []);

  // Lockout timer
  useEffect(() => {
    if (!isLocked || !lockoutEndTime) return;

    const timer = setInterval(() => {
      if (Date.now() >= lockoutEndTime) {
        setIsLocked(false);
        setLoginAttempts(0);
        setLockoutEndTime(null);
        localStorage.removeItem('lockoutEndTime');
        localStorage.removeItem('loginAttempts');
        setErrorMessage("");
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isLocked, lockoutEndTime]);

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        router.replace("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Form validation
  const isValidEmail = useCallback((email) => EMAIL_REGEX.test(email), []);
  const canSubmit = email && password && isValidEmail(email) && !isLocked;

  // Handle lockout
  const handleLockout = useCallback(() => {
    const endTime = Date.now() + LOCKOUT_DURATION;
    setIsLocked(true);
    setLockoutEndTime(endTime);
    localStorage.setItem('lockoutEndTime', endTime.toString());
    setErrorMessage(`Too many failed attempts. Please try again in 15 minutes.`);
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (isLocked) {
      const remainingTime = Math.ceil((lockoutEndTime - Date.now()) / 60000);
      setErrorMessage(`Account locked. Try again in ${remainingTime} minute${remainingTime !== 1 ? 's' : ''}.`);
      return;
    }

    if (!canSubmit || loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim().toLowerCase(),
        password
      );

      const user = userCredential.user;

      if (user) {
        // Get Firebase ID token
        const token = await user.getIdToken();

        // Store token securely
        document.cookie = `token=${token}; path=/; max-age=86400; samesite=strict; secure`;

        // Clear login attempts on success
        localStorage.removeItem('loginAttempts');
        localStorage.removeItem('lockoutEndTime');

        toast.success("Login successful");
        router.replace("/dashboard");
      }
    } catch (error) {
      console.error("Login error:", error);

      // Increment failed attempts
      const newAttempts = loginAttempts + 1;
      setLoginAttempts(newAttempts);
      localStorage.setItem('loginAttempts', newAttempts.toString());

      // Check if lockout needed
      if (newAttempts >= MAX_LOGIN_ATTEMPTS) {
        handleLockout();
      } else {
        // Set appropriate error message
        let message = "Login failed. Please try again.";
        
        if (error.code === "auth/invalid-credential" || error.code === "auth/wrong-password") {
          message = "Invalid email or password";
        } else if (error.code === "auth/user-not-found") {
          message = "No account found with this email";
        } else if (error.code === "auth/too-many-requests") {
          message = "Too many attempts. Please try again later.";
        } else if (error.code === "auth/network-request-failed") {
          message = "Network error. Please check your connection.";
        } else if (error.code === "auth/user-disabled") {
          message = "This account has been disabled.";
        }

        setErrorMessage(`${message} (${MAX_LOGIN_ATTEMPTS - newAttempts} attempt${MAX_LOGIN_ATTEMPTS - newAttempts !== 1 ? 's' : ''} remaining)`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = useCallback((e) => {
    if (e.key === 'Enter' && canSubmit && !loading) {
      handleSubmit(e);
    }
  }, [canSubmit, loading]);

  // Handle forgot password
  const handleForgotPassword = useCallback(() => {
    router.push("/forget-password");
  }, [router]);

  // Remaining lockout time display
  const getRemainingLockoutTime = () => {
    if (!isLocked || !lockoutEndTime) return "";
    const remaining = Math.ceil((lockoutEndTime - Date.now()) / 60000);
    return `${remaining} minute${remaining !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-gradient-to-br from-gray-50 to-gray-100">
      
      {/* LEFT PANEL - Brand Section */}
      <div className="hidden lg:flex lg:w-2/5 xl:w-1/2 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
          {/* Animated background elements */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="relative w-full flex flex-col z-10">
          {/* Logo */}
          <div className="p-8 lg:p-10">
            <Image 
              src={logo} 
              alt="OOHPoint Logo" 
              width={80} 
              height={80}
              priority
              className="rounded-2xl shadow-lg"
            />
          </div>

          {/* Content */}
          <div className="flex-1 flex items-center justify-center px-8 lg:px-12 xl:px-16 text-white">
            <div className="max-w-lg">
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-bold mb-4 lg:mb-6 leading-tight">
                Welcome to <span className="text-purple-300">OOHPoint</span>
              </h2>
              <p className="text-base lg:text-lg xl:text-xl text-purple-100 leading-relaxed mb-8">
                Manage campaigns, leads, and interactive OOH experiences from one powerful dashboard.
              </p>
              
              {/* Feature highlights */}
              <div className="space-y-4">
                {["Real-time Analytics", "Lead Management", "Campaign Tracking"].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-purple-100">
                    <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                    <span className="text-sm lg:text-base">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - Form Section */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="w-full max-w-md">
          
          {/* Mobile Logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Image 
              src={logo} 
              alt="OOHPoint Logo" 
              width={60} 
              height={60}
              priority
              className="rounded-xl shadow-lg"
            />
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 lg:p-10 border border-gray-100">
            
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Sign In
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Enter your credentials to access the dashboard
              </p>
            </div>

            <div className="space-y-5" onKeyPress={handleKeyPress}>

              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                    focusedField === 'email' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="you@example.com"
                    disabled={isLocked}
                    className="w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-purple-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors ${
                    focusedField === 'password' ? 'text-purple-600' : 'text-gray-400'
                  }`} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    placeholder="••••••••"
                    disabled={isLocked}
                    className="w-full pl-11 pr-12 py-3 sm:py-3.5 rounded-xl bg-gray-50 border-2 border-gray-200 focus:border-purple-500 focus:bg-white outline-none transition-all text-gray-900 placeholder-gray-400 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLocked}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  disabled={isLocked}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="flex items-start gap-2 p-3 sm:p-4 bg-red-50 border border-red-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-700 flex-1">{errorMessage}</p>
                </div>
              )}

              {/* Lockout Warning */}
              {isLocked && (
                <div className="flex items-start gap-2 p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-xl">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 flex-1">
                    Account temporarily locked. Time remaining: {getRemainingLockoutTime()}
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading || !canSubmit || isLocked}
                className="w-full py-3 sm:py-3.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] disabled:transform-none"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </span>
                ) : (
                  "Sign In"
                )}
              </button>
            </div>

            {/* Footer */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600">
                Need help?{" "}
                <a
                  href="mailto:support@oohpoint.com"
                  className="font-medium text-purple-600 hover:text-purple-700 transition-colors"
                >
                  Contact Support
                </a>
              </p>
            </div>
          </div>

          {/* Security Badge */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              🔒 Secured with enterprise-grade encryption
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignIn;