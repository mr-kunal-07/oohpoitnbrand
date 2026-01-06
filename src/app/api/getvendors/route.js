import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const vendorSnapshot = await getDocs(collection(db, "vendors"));

    if (vendorSnapshot.empty) {
      return NextResponse.json([], { status: 200 });
    }

    const vendors = vendorSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json(vendors, {
      status: 200,
      headers: {
        'Cache-Control': 's-maxage=60, stale-while-revalidate'
      }
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);

    return NextResponse.json(
      {
        error: "Failed to fetch vendors",
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    );
  }
}