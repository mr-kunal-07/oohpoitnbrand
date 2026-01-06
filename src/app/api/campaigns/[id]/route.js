import { db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    // Get campaign ID from params
    const { id } = await params;

    // Validate ID
    if (!id || typeof id !== 'string') {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid campaign ID" 
        }, 
        { status: 400 }
      );
    }

    console.log("📥 Fetching campaign:", id);

    // Fetch campaign from Firestore
    const campaignRef = doc(db, "campaigns", id);
    const campaignDoc = await getDoc(campaignRef);
    
    // Check if campaign exists
    if (!campaignDoc.exists()) {
      console.log("❌ Campaign not found:", id);
      return NextResponse.json(
        { 
          success: false, 
          error: "Campaign not found" 
        }, 
        { status: 404 }
      );
    }

    // Return campaign data
    const campaign = { 
      id: campaignDoc.id, 
      ...campaignDoc.data() 
    };

    console.log("✅ Campaign fetched successfully:", campaign.campaignName || campaign.name);

    return NextResponse.json(
      { 
        success: true, 
        data: campaign 
      }, 
      { status: 200 }
    );

  } catch (error) {
    console.error("❌ Error fetching campaign:", error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch campaign",
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      }, 
      { status: 500 }
    );
  }
}