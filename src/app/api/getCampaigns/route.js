import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const campaignsSnapshot = await getDocs(collection(db, "campaigns"));
    
    const campaigns = [];
    campaignsSnapshot.forEach((doc) => {
      campaigns.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json(campaigns, { status: 200 });
  } catch (error) {
    console.error("Error fetching campaigns:", error);
    return NextResponse.json(
      { error: "Failed to fetch campaigns" }, 
      { status: 500 }
    );
  }
}
