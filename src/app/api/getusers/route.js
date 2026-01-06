import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("📥 API: Fetching users from Firestore...");
    
    const usersRef = collection(db, "users"); // Make sure this collection name is correct
    const snapshot = await getDocs(usersRef);
    
    const users = [];
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log("✅ API: Fetched", users.length, "users");
    return NextResponse.json(users);
  } catch (error) {
    console.error("❌ API Error fetching users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users", details: error.message }, 
      { status: 500 }
    );
  }
}