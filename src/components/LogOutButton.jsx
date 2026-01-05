"use client";
import { auth } from "@/firebase"; // Import your Firebase configuration
import { signOut } from "firebase/auth";
import { useRouter } from "next/navigation";

const LogOutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out from Firebase
      localStorage.removeItem("user"); // Clear user data from localStorage
      router.push("/login"); // Redirect to login page or home page
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
};

export default LogOutButton;
