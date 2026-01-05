// "use client"
import React, { useState } from "react";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase";

const AddBrand = () => { 
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [subscription, setSubscription] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [brandName, setBrandName] = useState("");
  const [logo, setLogo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const uploadImage = async (e) => {
    try {
      // Prepare to upload the logo
      const logoRef = ref(storage, `logos/${logo.name}`);

      // Upload the file
      await uploadBytes(logoRef, logo);

      // Get the download URL for the uploaded logo
      const logoUrl = await getDownloadURL(logoRef);
      return logoUrl;
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    const logoUrl = await uploadImage();
    console.log(logoUrl);
    try {
      const response = await fetch("/api/createBrand", {
        method: "POST",
        headers: {
          "Content-Type": "application/json", // Set content type to JSON
        },
        body: JSON.stringify({
          // Stringify the body object
          email,
          password,
          name,
          businessName,
          brandName,
          logo: logo,
          subscription,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        console.log(data);
        throw new Error(data.message || "Something went wrong.");
      }

      setSuccess(data.message); // Show success message
    } catch (err) {
      setError(err.message); // Show error message
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  return (
    <div className="bg-white h-full overflow-y-scroll p-6 rounded-lg w-full">
      <h2 className="text-xl text-center font-semibold">Add Brand</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-500 text-center">{success}</p>}

      <div className="mb-4">
        <label className="block text-gray-800">Name of POC:</label>
        <input
          type="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Enter name of POC"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-800">Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Enter client's email"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-800">Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="Enter password"
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-800">Subscription</label>
        <select
          value={subscription}
          onChange={(e) => setSubscription(e.target.value)}
          className="mt-1 block w-full bg-gray-50 rounded-md p-2"
          required
        >
          <option value="" disabled>
            Select A Subscription
          </option>
          <option value="basic">Basic</option>
          <option value="standard">Standard</option>
          <option value="enterprise">Enterprise</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-800">Business Name:</label>
        <input
          type="text"
          value={businessName}
          onChange={(e) => setBusinessName(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Enter business name"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-800">Brand name:</label>
        <input
          type="text"
          value={brandName}
          onChange={(e) => setBrandName(e.target.value)}
          required
          className="mt-1 block w-full border border-gray-300 rounded-md p-2"
          placeholder="Enter brand name"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-800 font-medium">Brand logo</label>
        <div className="flex gap-1 items-center">
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setLogo(e.target.files[0])}
            required
            className="mt-1 block w-full border bg-white border-gray-300 rounded-lg p-2 shadow-md"
          />
          {logo && (
            <img
              className="size-11 hover:scale-[5] hover:rounded-sm transition-all duration-300 mt-1 shadow-md rounded-lg"
              src={URL.createObjectURL(logo)}
              alt="Logo Preview"
            />
          )}
        </div>
      </div>
      <div className="flex justify-end flex-col gap-3">
        <button
          onClick={handleCreateUser}
          className="bg-oohpoint-primary-1 text-white font-semibold px-5 py-2 rounded-lg mt-2 hover:scale-90 transition-all"
          type="submit"
          disabled={loading}
        >
          {loading ? "Adding Brand..." : "Add Brand"}
        </button>
      </div>
    </div>
  );
};

export default AddBrand;
