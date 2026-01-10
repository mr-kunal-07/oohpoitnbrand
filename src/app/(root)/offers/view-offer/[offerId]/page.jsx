"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import toast from "react-hot-toast";

const ViewOfferPage = () => {
  const { offerId } = useParams();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffer = async () => {
      try {
        const offerRef = doc(db, "offers", offerId);
        const offerSnap = await getDoc(offerRef);

        if (offerSnap.exists()) {
          setOffer(offerSnap.data());
        } else {
          toast.error("Offer not found");
        }
      } catch (error) {
        console.error("Error fetching offer: ", error);
        toast.error("Failed to fetch offer details.");
      } finally {
        setLoading(false);
      }
    };

    fetchOffer();
  }, [offerId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="flex justify-center items-center min-h-screen ">
        <p className="text-gray-700 text-lg">Offer not found.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen h-ful w-full py-8">
      <div className="w-full container mx-auto bg-white p-8 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">View Offer</h1>

        {/* Offer Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Offer Title */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Offer Title</h2>
            <p className="text-gray-600 bg-gray-100 p-3 rounded-md">{offer.offerTitle}</p>
          </div>

          {/* Offer Description */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Offer Description</h2>
            <p className="text-gray-600 bg-gray-100 p-3 rounded-md">{offer.offerDescription}</p>
          </div>

          {/* Offer Type */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Offer Type</h2>
            <p className="text-gray-600 bg-gray-100 p-3 rounded-md">{offer.offerType}</p>
          </div>

          {/* Offer Category */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Offer Category</h2>
            <p className="text-gray-600 bg-gray-100 p-3 rounded-md">{offer.offerCategory}</p>
          </div>

          {/* Start Date */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Start Date</h2>
            <p className="text-gray-600 bg-gray-100 p-3 rounded-md">{offer.startDate}</p>
          </div>

          {/* End Date */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">End Date</h2>
            <p className="text-gray-600 bg-gray-100 p-3 rounded-md">{offer.endDate}</p>
          </div>

          {/* Discount */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Discount</h2>
            <p className="text-gray-600 bg-gray-100 p-3 rounded-md">{offer.discount}</p>
          </div>

          {/* Items Included */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Items Included</h2>
            <p className="text-gray-600 bg-gray-100 p-3 rounded-md">{offer.itemsIncluded}</p>
          </div>

          {/* Contact Number */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Contact Number</h2>
            <p className="text-gray-600 bg-gray-100 p-3 rounded-md">{offer.contactNumber}</p>
          </div>

          {/* Support Email */}
          <div>
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Support Email</h2>
            <p className="text-gray-600 bg-gray-100 p-3 rounded-md">{offer.supportEmail}</p>
          </div>

          {/* Terms & Conditions */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Terms & Conditions</h2>
            <p className="text-gray-600 bg-gray-100 p-3 rounded-md">{offer.termsConditions}</p>
          </div>

          {/* Offer Image */}
          <div className="md:col-span-2">
            <h2 className="text-lg font-semibold text-gray-700 mb-2">Offer Image</h2>
            {offer.offerImage && (
              <img
                src={offer.offerImage}
                alt="Offer"
                className="w-full max-w-md h-auto object-cover rounded-md shadow-sm"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewOfferPage;