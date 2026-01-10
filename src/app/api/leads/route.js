import { NextResponse } from "next/server";
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";


function extractUserIdFromLeadId(leadId) {
    if (!leadId) return null;
    const parts = leadId.split('_');
    return parts[0] || null;
}

// Helper function to fetch user details
async function fetchUserDetails(userId) {
    if (!userId) return null;

    try {
        const userDocRef = doc(db, "users", userId);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
            return {
                id: userDoc.id,
                ...userDoc.data()
            };
        }
        return null;
    } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
        return null;
    }
}

// ===============================
//          GET /api/leads
// ===============================
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        const brandId = searchParams.get("brandId");
        const campaignId = searchParams.get("campaignId");
        const sortBy = searchParams.get("sortBy") || "recent";

        // Validation
        if (!brandId && !campaignId) {
            return NextResponse.json(
                { error: "brandId or campaignId is required" },
                { status: 400 }
            );
        }

        // Build Firestore query
        let colRef = collection(db, "leadResponses");
        let conditions = [];

        if (brandId) {
            conditions.push(where("brandId", "==", brandId));
        }
        if (campaignId) {
            conditions.push(where("campaignId", "==", campaignId));
        }

        // Note: orderBy with where clauses requires a composite index in Firestore
        // We'll sort on the client side instead to avoid index issues
        const q = conditions.length
            ? query(colRef, ...conditions)
            : colRef;

        const snapshot = await getDocs(q);

        // Map leads and extract user IDs
        let leads = snapshot.docs.map((doc) => {
            const data = doc.data();
            const userId = extractUserIdFromLeadId(doc.id);

            return {
                id: doc.id,
                ...data,
                userId: userId,
                createdAt: data.createdAt?.toDate?.()
                    ? data.createdAt.toDate().toISOString()
                    : data.createdAt || new Date().toISOString()
            };
        });

        // Get unique user IDs
        const userIds = [...new Set(leads.map(lead => lead.userId).filter(Boolean))];

        // Fetch all user details in parallel
        const userDetailsPromises = userIds.map(userId => fetchUserDetails(userId));
        const userDetailsArray = await Promise.all(userDetailsPromises);

        // Create a map of userId to user details
        const userDetailsMap = {};
        userDetailsArray.forEach((userDetail, index) => {
            if (userDetail) {
                userDetailsMap[userIds[index]] = userDetail;
            }
        });

        // Merge user details with leads
        leads = leads.map(lead => {
            const userDetails = userDetailsMap[lead.userId];

            return {
                ...lead,
                user: userDetails || null,
                // Add convenience fields at root level
                userName: lead.userName || userDetails?.name || userDetails?.displayName || null,
                userEmail: lead.userEmail || userDetails?.email || null,
                userPhone: lead.userPhone || userDetails?.phone || userDetails?.phoneNumber || null,
                userAvatar: userDetails?.photoURL || userDetails?.avatar || null
            };
        });

        // Sort on server side after fetching
        if (sortBy === "recent") {
            leads.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        }

        return NextResponse.json({
            success: true,
            total: leads.length,
            leads,
            metadata: {
                usersFound: Object.keys(userDetailsMap).length,
                totalUsers: userIds.length
            }
        });

    } catch (err) {
        console.error("Error fetching leads:", err);
        return NextResponse.json(
            { error: "Internal server error", message: err.message },
            { status: 500 }
        );
    }
}