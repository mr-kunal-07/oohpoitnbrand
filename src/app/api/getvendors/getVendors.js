import { db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  try {
    const vendorSnapshot = await getDocs(collection(db, "vendors"));

    if (vendorSnapshot.empty) {
      return res.status(200).json([]);
    }

    const vendors = vendorSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');

    return res.status(200).json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);

    return res.status(500).json({
      error: "Failed to fetch vendors",
      message: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}