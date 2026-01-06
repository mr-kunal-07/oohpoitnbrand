import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const brandsSnapshot = await getDocs(collection(db, "brands"));
    
    const brands = [];
    brandsSnapshot.forEach((doc) => {
      brands.push({ id: doc.id, ...doc.data() });
    });

    return NextResponse.json(brands, { status: 200 });
  } catch (error) {
    console.error("Error fetching brands:", error);
    return NextResponse.json(
      { error: "Failed to fetch brands" }, 
      { status: 500 }
    );
  }
}