import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        // Reference to the offers collection
        const offersCollection = collection(db, "offers");

        // Fetch all offer documents
        const snapshot = await getDocs(offersCollection);

        const offers = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }));

        return NextResponse.json(offers, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
