"use client";
import React, { useState } from "react";
import RevButton from "../RevButton";
import toast from "react-hot-toast";

const CreateVendor = () => {
  const [businessName, setBusinessName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [businessCategory, setBusinessCategory] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [googleMapLink, setGoogleMapLink] = useState("");
  const [openingHours, setOpeningHours] = useState("");
  const [closingHours, setClosingHours] = useState("");
  const [operatingDays, setOperatingDays] = useState("");
  const [kycId, setKycId] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upiId, setUpiId] = useState("");
  const [keyProducts, setKeyProducts] = useState("");
  const [termsAgreement, setTermsAgreement] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      email,
      password,
      businessName,
      ownerName,
      businessCategory,
      phoneNumber,
      whatsapp,
      address: fullAddress,
      googleMapLink,
      openingHours,
      closingHours,
      operatingDays,
      kycId,
      gstNumber,
      registrationNumber,
      accountNumber,
      ifsc,
      upiId,
      keyProducts,
      termsAgreement,
    };

    try {
      const response = await fetch("/api/createVendor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        toast.success(result.message);
      } else {
        toast.error(result.message || "Something went wrong");
      }
    } catch (error) {
      console.error("Error creating vendor:", error);
      toast.error("Error creating vendor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container mx-auto py-4 w-[100%] h-screen px-4 pb-32">
        <form onSubmit={handleSubmit} className=" pb-8">
          <div className="grid grid-cols-4 gap-6 pb-8">
            {/* Business Information */}
            <div className="col-span-4">
              <h2 className="text-lg font-bold">Business Information</h2>
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                Business Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter business name"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                Owner's Name
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter owner's name"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                Business Category
              </label>
              <input
                type="text"
                value={businessCategory}
                onChange={(e) => setBusinessCategory(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="e.g., Grocery, Medical"
              />
            </div>

            {/* Contact Information */}
            <div className="col-span-4">
              <h2 className="text-lg font-bold">Contact Information</h2>
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                Phone Number
              </label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter phone number"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter email address"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter password"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                WhatsApp (Optional)
              </label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter WhatsApp number"
              />
            </div>

            {/* Address Information */}
            <div className="col-span-4">
              <h2 className="text-lg font-bold">Address Information</h2>
            </div>
            <div className="col-span-2">
              <label className="block text-gray-800 font-medium">
                Full Address
              </label>
              <input
                type="text"
                value={fullAddress}
                onChange={(e) => setFullAddress(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter full address"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-gray-800 font-medium">
                Google Map Link (Optional)
              </label>
              <input
                type="text"
                value={googleMapLink}
                onChange={(e) => setGoogleMapLink(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter Google map link"
              />
            </div>

            {/* Additional Information */}
            <div className="col-span-4">
              <h2 className="text-lg font-bold">Additional Information</h2>
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                Opening Hours
              </label>
              <input
                type="time"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                Closing Hours
              </label>
              <input
                type="time"
                value={closingHours}
                onChange={(e) => setClosingHours(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                Operating Days
              </label>
              <input
                type="text"
                value={operatingDays}
                onChange={(e) => setOperatingDays(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="e.g., Mon-Fri"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium">Aadhar/Pan/Voter ID Number</label>
              <input
                type="text"
                value={kycId}
                onChange={(e) => setKycId(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter KYC ID"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                GST Number
              </label>
              <input
                type="text"
                value={gstNumber}
                onChange={(e) => setGstNumber(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter GST number"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                Bank Account Number
              </label>
              <input
                type="text"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter account number"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                IFSC Code
              </label>
              <input
                type="text"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter IFSC code"
              />
            </div>
            <div>
              <label className="block text-gray-800 font-medium">
                UPI ID (Optional)
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter UPI ID"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-gray-800 font-medium">
                Registration Number (if applicable)
              </label>
              <input
                type="text"
                value={registrationNumber}
                onChange={(e) => setRegistrationNumber(e.target.value)}
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter Registration Number"
              />
            </div>

            <div className="col-span-4">
              <h2 className="text-lg font-bold">Services Offered</h2>
            </div>
            <div className="col-span-2">
              <label className="block text-gray-800 font-medium">
                Key Products/Services
              </label>
              <textarea
                value={keyProducts}
                onChange={(e) => setKeyProducts(e.target.value)}
                required
                className="mt-1 block w-full border border-gray-300 rounded-lg p-2 shadow-md"
                placeholder="Enter a brief list of products or services"
              />
            </div>

            {/* Terms Agreement */}
            <div className="col-span-4 flex items-center">
              <input
                type="checkbox"
                id="termsAgreement"
                checked={termsAgreement}
                onChange={(e) => setTermsAgreement(e.target.checked)}
                required
              />
              <label htmlFor="termsAgreement" className="ml-2 text-gray-800">
                I agree to the terms and conditions.
              </label>
            </div>
          </div>

          <button
            className="bg-oohpoint-primary-1 text-white font-semibold px-5 py-2 rounded-lg mt-2 hover:scale-90 transition-all"
            type="submit"
            disabled={loading}
          >
            {loading ? "Loading..." : "Register"}
          </button>
        </form>
      </div>
    </>
  );
};

export default CreateVendor;
