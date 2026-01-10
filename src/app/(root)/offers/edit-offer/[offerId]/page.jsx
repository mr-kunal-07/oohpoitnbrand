"use client";
import { use, useContext, useEffect, useState } from "react";
import { collection, addDoc, setDoc, doc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "@/firebase";
import toast from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { MyContext } from "@/context/MyContext";
import { z } from "zod";
import Modal from "@/components/Modal";
import { FaShare } from "react-icons/fa";

// Zod validation schema
const formDataSchema = z.object({
  offerTitle: z.string().nonempty("Offer title is required"),
  offerDescription: z.string().nonempty("Offer description is required"),
  offerType: z.string().nonempty("Offer type is required"),
  offerCategory: z.string().nonempty("Offer category is required"),
  startDate: z
    .union([z.string().nonempty("Start date is required."), z.object({})])
    .optional(),
  endDate: z
    .union([z.string().nonempty("End date is required."), z.object({})])
    .optional(),
  termsConditions: z.string().nonempty("Terms and conditions are required"),
  discount: z.string().nonempty("Discount is required"),
  itemsIncluded: z.string().nonempty("Items included is required"),
  contactNumber: z
    .string()
    .regex(/^\d{10}$/, "Contact number must be a valid 10-digit number"), // Example validation for contact number
  supportEmail: z.string().email("Invalid email address"),
  offerImage: z.nullable(z.any()),
});

const offerTypes = [
  "Discount Percentage",
  "Discount Amount",
  "Buy One Get One Free",
  "Combo Offer",
  "Limited Time Offer",
  "Cashback Offer",
  "Seasonal Offer",
  "Loyalty Reward",
  "Free Gift with Purchase",
  "Referral Bonus",
  "Flash Sale",
  "Special Membership Offer",
  "Early Bird Discount",
  "Festival Special Offer",
  "Exclusive VIP Offer",
  "Student Discount",
  "New Customer Discount",
  "Happy Hour Offer",
  "Birthday Special Offer",
  "Anniversary Celebration Offer",
];

const categories = [
  "Pharmacies/Chemists",
  "Cafes & Bakeries",
  "Bookstores",
  "Barbershops & Salons",
  "Local Restaurants",
  "Stationery & Office Supplies",
  "Gyms & Fitness Centers",
  "Internet Cafes",
  "Florists",
  "Pet Shops",
  "Food & Beverage Vendors",
  "Grocery Stores",
  "Medical Services",
  "Education & Institutions",
  "Household Vendors",
  "Personal Services",
  "Entertainment & Recreation",
  "Electronic & Mobile Stores",
  "Clothing & Fashion Retailers",
];

const VendorOfferForm = () => {
  const router = useRouter();
  const { user } = useContext(MyContext);
  const { offerId } = useParams();

  const [formData, setFormData] = useState({
    offerTitle: "",
    offerDescription: "",
    offerType: "",
    offerCategory: "",
    startDate: "",
    endDate: "",
    termsConditions: "",
    discount: "",
    minimumSpend: "",
    itemsIncluded: "",
    contactNumber: "",
    supportEmail: "",
    offerImage: null,
    offerImageUrl: "", // New state to handle image URL from Firestore
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (offerId) {
      const fetchOffer = async () => {
        const offerRef = doc(db, "offers", offerId);
        const offerSnap = await getDoc(offerRef);

        if (offerSnap.exists()) {
          const offerData = offerSnap.data();
          setFormData({
            offerTitle: offerData.offerTitle,
            offerDescription: offerData.offerDescription,
            offerType: offerData.offerType,
            offerCategory: offerData.offerCategory,
            startDate: offerData.startDate,
            endDate: offerData.endDate,
            termsConditions: offerData.termsConditions,
            discount: offerData.discount,
            minimumSpend: offerData.minimumSpend || "",
            itemsIncluded: offerData.itemsIncluded,
            contactNumber: offerData.contactNumber,
            supportEmail: offerData.supportEmail,
            offerImage: null, // Set to null since we have the URL
            offerImageUrl: offerData.offerImage, // Set the image URL
          });
          setPreviewImage(offerData.offerImage);
        } else {
          toast.error("Offer not found");
          router.push("/offers");
        }
      };

      fetchOffer();
    }
  }, [offerId, router]);

  const inputClassName = "block w-full p-2 border rounded-md";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setFormData((prev) => ({ ...prev, offerImage: e.target.files[0] }));

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const uploadImage = async (file) => {
    const storageRef = ref(storage, `offers/${file.name}`);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handlePreview = () => {
    try {
      formDataSchema.parse(formData);
      setShowPreview(true);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      formDataSchema.parse(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        error.errors.forEach((err) => {
          toast.error(err.message);
        });
      }
      setIsSubmitting(false);
      return;
    }

    try {
      let imageUrl = formData.offerImageUrl; // Use existing image URL by default

      if (formData.offerImage) {
        imageUrl = await uploadImage(formData.offerImage); // Upload new image if provided
      }

      const offerData = {
        ...formData,
        offerImage: imageUrl,
        createdAt: new Date(),
        status: "pending",
        brandId: user.id,
        offerId: offerId || `OID${Date.now()}`, // Use existing offerId or generate a new one
      };

      await setDoc(doc(db, "offers", offerData.offerId), offerData);

      toast.success(
        offerId
          ? "Offer updated successfully!"
          : "Offer submitted successfully!"
      );
      router.push("/offers");
    } catch (error) {
      console.error("Error submitting offer: ", error);
      toast.error("Failed to submit offer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const PreviewContent = () => (
    <div className="bg-white p-4 rounded-lg max-w-xs mx-auto">
      <h2 className="text-xl font-bold mb-4 text-center">Offer Preview</h2>
      <div className="bg-white shadow-md rounded-lg max-w-[187px] min-h-[217px] flex-shrink-0 mx-auto">
        {previewImage ? (
          <img
            src={previewImage}
            alt="Offer Preview"
            className="w-48 h-32 object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-48 h-32 bg-gray-200 rounded-t-lg flex items-center justify-center">
            <span className="text-gray-500">No image selected</span>
          </div>
        )}
        <div className="p-2">
          <p className="text-[#341266] text-sm font-bold">
            {formData.offerTitle || "Offer Title"}
          </p>
          <p className="text-[#341266] text-sm font-bold">
            {formData.discount ? `Upto ${formData.discount} Off` : "Discount"}
          </p>
          <p className="text-gray-600 text-xs">
            {formData.offerDescription || "Offer description will appear here"}
          </p>
        </div>
        <div className="px-3 pb-2 flex gap-4">
          <button className="bg-[#341266] text-white font-medium text-sm px-2 py-2 w-full rounded-xl hover:bg-purple-900">
            View Offer
          </button>
          <button className="rounded-full bg-oohpoint-primary-3 text-white p-2 px-3">
            <FaShare />
          </button>
        </div>
      </div>
      <div className="mt-4">
        <h3 className="font-semibold">Offer Details:</h3>
        <ul className="text-sm space-y-1 mt-2">
          <li>
            <strong>Type:</strong> {formData.offerType || "Not specified"}
          </li>
          <li>
            <strong>Category:</strong>{" "}
            {formData.offerCategory || "Not specified"}
          </li>
          <li>
            <strong>Valid:</strong> {formData.startDate || "Not specified"} to{" "}
            {formData.endDate || "Not specified"}
          </li>
          <li>
            <strong>Items Included:</strong>{" "}
            {formData.itemsIncluded || "Not specified"}
          </li>
        </ul>
      </div>
      <div className="mt-4 flex justify-center">
        <button
          onClick={() => setShowPreview(false)}
          className="bg-oohpoint-primary-3 text-white px-4 py-2 rounded-md"
        >
          Close Preview
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 ">
      {/* Header Section */}
      <section className="mb-8">
        <h1 className="text-2xl font-bold mb-2">
          {offerId ? "Edit Your Offer" : "Create Your Offer"}
        </h1>
        <p className="text-gray-600">
          Attract more customers to your café by offering exclusive deals
          directly in the Oohpoint app. Fill out the form below to create an
          irresistible offer that drives traffic to your location.
        </p>
      </section>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Offer Details */}
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <legend className="text-lg font-semibold col-span-full mb-4">
            Offer Details
          </legend>
          <div>
            <label className="block text-gray-700 mb-1">Offer Title</label>
            <input
              type="text"
              name="offerTitle"
              value={formData.offerTitle}
              onChange={handleChange}
              required
              className={inputClassName}
              placeholder="Enter offer title"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">
              Offer Description
            </label>
            <textarea
              name="offerDescription"
              value={formData.offerDescription}
              onChange={handleChange}
              required
              rows={1}
              className={inputClassName}
              placeholder="Enter offer description"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Offer Type</label>
            <select
              name="offerType"
              value={formData.offerType}
              onChange={handleChange}
              required
              className={inputClassName}
            >
              <option value="">Select Offer Type</option>
              {offerTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Offer Category</label>
            <select
              name="offerCategory"
              value={formData.offerCategory}
              onChange={handleChange}
              required
              className={inputClassName}
            >
              <option value="">Select Offer Category</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </fieldset>

        {/* Offer Validity */}
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <legend className="text-lg font-semibold col-span-full mb-4">
            Offer Validity
          </legend>
          <div>
            <label className="block text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              required
              className={inputClassName}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              required
              className={inputClassName}
            />
          </div>
        </fieldset>

        {/* Discount & Pricing Details */}
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <legend className="text-lg font-semibold col-span-full mb-4">
            Discount & Pricing Details
          </legend>
          <div>
            <label className="block text-gray-700 mb-1">
              Discount Percentage or Amount
            </label>
            <input
              type="text"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              required
              className={inputClassName}
              placeholder="Enter discount percentage or amount"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">
              Minimum Spend (if applicable)
            </label>
            <input
              type="text"
              name="minimumSpend"
              value={formData.minimumSpend}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Enter minimum spend"
            />
          </div>
          <div className="col-span-full">
            <label className="block text-gray-700 mb-1">
              Items Included in the Offer
            </label>
            <textarea
              name="itemsIncluded"
              value={formData.itemsIncluded}
              onChange={handleChange}
              className={inputClassName}
              placeholder="Enter items included in the offer"
            />
          </div>
        </fieldset>

        {/* Image Upload */}
        <fieldset>
          <legend className="text-lg font-semibold mb-4">Image Upload</legend>
          <div>
            <label className="block text-gray-700 mb-1">
              Upload Offer Image
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={inputClassName}
            />
            {formData.offerImageUrl && (
              <div className="mt-4">
                <img
                  src={formData.offerImageUrl}
                  alt="Offer"
                  className="w-32 h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>
        </fieldset>

        {/* Contact & Support */}
        <fieldset className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <legend className="text-lg font-semibold col-span-full mb-4">
            Contact & Support
          </legend>
          <div>
            <label className="block text-gray-700 mb-1">Contact Number</label>
            <input
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              className={inputClassName}
              placeholder="Enter contact number"
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1">Support Email</label>
            <input
              type="email"
              name="supportEmail"
              value={formData.supportEmail}
              onChange={handleChange}
              required
              className={inputClassName}
              placeholder="Enter support email"
            />
          </div>
          <div className="col-span-full">
            <label className="block text-gray-700 mb-1">
              Terms & Conditions
            </label>
            <input
              type="text"
              name="termsConditions"
              value={formData.termsConditions}
              onChange={handleChange}
              required
              className={inputClassName}
              placeholder="Enter Terms & Conditions for this Offer"
            />
          </div>
        </fieldset>
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={handlePreview}
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md hover:bg-gray-300 transition-all"
            disabled={isSubmitting}
          >
            Preview Offer
          </button>
          <button
            type="submit"
            className="bg-oohpoint-primary-3 text-white px-6 py-2 rounded-md hover:bg-opacity-90 transition-all"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update"}
          </button>
        </div>
      </form>
      {/* Preview Modal */}
      <Modal open={showPreview} close={() => setShowPreview(false)}>
        <PreviewContent />
      </Modal>
    </div>
  );
};

export default VendorOfferForm;
