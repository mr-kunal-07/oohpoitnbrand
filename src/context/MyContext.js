"use client";
import React, { createContext, useState, useEffect, useCallback, useContext } from "react";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { collection, query, where, getDocs } from "firebase/firestore";

const MyContext = createContext();

// Custom hook with error checking
export const useAuth = () => {
  const context = useContext(MyContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within MyProvider');
  }
  return context;
};

const MyProvider = ({ children }) => {
  // User State
  const [user, setUser] = useState(null);
  const [uid, setUid] = useState("");

  // Data State
  const [campaigns, setCampaigns] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [users, setUsers] = useState([]); // ✅

  // Loading State
  const [loading, setLoading] = useState(true);

  const router = useRouter();

  // Fetch brand
  const fetchUser = useCallback(async (userId) => {
    try {
      const res = await fetch("/api/getbrand");
      const brands = await res.json();
      const userBrand = brands.find((b) => b.uid === userId);
      
      if (userBrand) {
        setUser(userBrand);
        return userBrand;
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      toast.error("Failed to load user data");
    }
    return null;
  }, []);

  // Fetch campaigns
  const fetchCampaigns = useCallback(async (brandId) => {
    try {
      const res = await fetch("/api/getCampaigns");
      const allCampaigns = await res.json();
      const userCampaigns = allCampaigns
        .filter((c) => c.client === brandId)
        .reverse();
      
      setCampaigns(userCampaigns);
      return userCampaigns;
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast.error("Failed to load campaigns");
      setCampaigns([]);
    }
    return [];
  }, []);

  // Fetch vendors
  const fetchVendors = useCallback(async (campaignsList) => {
    try {
      const vendorIds = new Set();
      
      campaignsList.forEach((campaign) => {
        campaign.vendors?.forEach((v) => {
          if (v.vendorId) vendorIds.add(v.vendorId);
        });
      });

      if (vendorIds.size === 0) {
        setVendors([]);
        return;
      }

      const vendorIdsArray = Array.from(vendorIds);
      const allVendors = [];

      // Firestore 'in' query supports max 10 items
      for (let i = 0; i < vendorIdsArray.length; i += 10) {
        const batch = vendorIdsArray.slice(i, i + 10);
        const q = query(collection(db, "vendors"), where("__name__", "in", batch));
        const snapshot = await getDocs(q);
        
        snapshot.forEach((doc) => {
          allVendors.push({ id: doc.id, ...doc.data() });
        });
      }

      setVendors(allVendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      toast.error("Failed to load vendors");
      setVendors([]);
    }
  }, []);

  // ✅ Fetch users (customers)
  const fetchUsers = useCallback(async () => {
    try {
      console.log("🔄 Fetching users from API...");
      const res = await fetch("/api/getusers");
      
      if (!res.ok) {
        throw new Error(`API returned ${res.status}`);
      }
      
      const allUsers = await res.json();
      console.log("✅ Users fetched:", allUsers?.length);
      setUsers(allUsers);
      return allUsers;
    } catch (error) {
      console.error("❌ Error fetching users:", error);
      toast.error("Failed to load users");
      setUsers([]);
    }
    return [];
  }, []);

  // ✅ Load user data - NOW INCLUDES fetchUsers
  const loadUserData = useCallback(async (userId) => {
    const userBrand = await fetchUser(userId);
    
    if (userBrand?.brandId) {
      const userCampaigns = await fetchCampaigns(userBrand.brandId);
      
      if (userCampaigns.length > 0) {
        await fetchVendors(userCampaigns);
      }
      
      // ✅ FETCH USERS HERE
      await fetchUsers();
    }
  }, [fetchUser, fetchCampaigns, fetchVendors, fetchUsers]);

  // Check auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUid(firebaseUser.uid);
        await loadUserData(firebaseUser.uid);
      } else {
        // Clear all data on logout
        setUser(null);
        setUid("");
        setCampaigns([]);
        setVendors([]);
        setUsers([]); // ✅ Also clear users
        router.push("/");
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [loadUserData, router]);

  // Show loader while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <MyContext.Provider
      value={{
        // User
        user,
        uid,

        // Data
        campaigns,
        vendors,
        users, // ✅ EXPOSE USERS

        // Methods
        fetchCampaigns,
        fetchUser,
        fetchUsers, // ✅ EXPOSE fetchUsers (optional, but good to have)
      }}
    >
      {children}
    </MyContext.Provider>
  );
};

export { MyContext, MyProvider };