"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/context/MyContext";
import { db, storage } from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Camera, Save, Loader2, Building2, Mail, Phone, Globe, MapPin, DollarSign, Target, FileText, User, Edit3, X } from "lucide-react";
import toast from "react-hot-toast";

const INDUSTRY_TYPES = [
    "Finance & FinTech", "Technology", "Healthcare", "Retail", "E-commerce",
    "Food & Beverage", "Real Estate", "Education", "Entertainment", "Automotive"
];

const CAMPAIGN_OBJECTIVES = [
    "Brand Awareness", "Lead Generation", "Sales", "Market Research", "Product Launch"
];

const BILLING_PREFERENCES = ["Advance", "Post-Campaign", "Monthly"];

const ProfilePage = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        brandName: user?.brandName || "",
        businessName: user?.businessName || "",
        email: user?.email || "",
        phoneNumber: user?.phoneNumber || "",
        websiteUrl: user?.websiteUrl || "",
        businessAddress: user?.businessAddress || "",
        gstNumber: user?.gstNumber || "",
        industryType: user?.industryType || "",
        campaignObjective: user?.campaignObjective || "",
        targetLocation: user?.targetLocation || "",
        adBudget: user?.adBudget || "",
        billingPreferences: user?.billingPreferences || "",
        imageUrl: user?.imageUrl || "",
        pocName: user?.pocs?.[0]?.name || "",
        pocEmail: user?.pocs?.[0]?.email || "",
        pocPhone: user?.pocs?.[0]?.phone || "",
    });

    const handleChange = (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleCancel = () => {
        setFormData({
            brandName: user?.brandName || "",
            businessName: user?.businessName || "",
            email: user?.email || "",
            phoneNumber: user?.phoneNumber || "",
            websiteUrl: user?.websiteUrl || "",
            businessAddress: user?.businessAddress || "",
            gstNumber: user?.gstNumber || "",
            industryType: user?.industryType || "",
            campaignObjective: user?.campaignObjective || "",
            targetLocation: user?.targetLocation || "",
            adBudget: user?.adBudget || "",
            billingPreferences: user?.billingPreferences || "",
            imageUrl: user?.imageUrl || "",
            pocName: user?.pocs?.[0]?.name || "",
            pocEmail: user?.pocs?.[0]?.email || "",
            pocPhone: user?.pocs?.[0]?.phone || "",
        });
        setIsEditMode(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("Image size should be less than 2MB");
            return;
        }

        try {
            setUploading(true);
            const storageRef = ref(storage, `logos/${Date.now()}_${file.name}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            handleChange("imageUrl", url);
            toast.success("Logo uploaded successfully");
        } catch (error) {
            console.error("Upload error:", error);
            toast.error("Failed to upload logo");
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.brandName || !formData.email || !formData.phoneNumber) {
            toast.error("Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);
            const brandRef = doc(db, "brands", user.uid);

            await updateDoc(brandRef, {
                brandName: formData.brandName,
                businessName: formData.businessName,
                phoneNumber: formData.phoneNumber,
                websiteUrl: formData.websiteUrl,
                businessAddress: formData.businessAddress,
                gstNumber: formData.gstNumber,
                industryType: formData.industryType,
                campaignObjective: formData.campaignObjective,
                targetLocation: formData.targetLocation,
                adBudget: formData.adBudget,
                billingPreferences: formData.billingPreferences,
                imageUrl: formData.imageUrl,
                pocs: [{
                    name: formData.pocName,
                    email: formData.pocEmail,
                    phone: formData.pocPhone,
                }],
            });

            toast.success("Profile updated successfully");
            setIsEditMode(false);
        } catch (error) {
            console.error("Update error:", error);
            toast.error("Failed to update profile");
        } finally {
            setLoading(false);
        }
    };

    const InputField = ({ label, icon: Icon, required, disabled: fieldDisabled, ...props }) => {
        const isDisabled = !isEditMode || fieldDisabled;
        return (
            <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    {Icon && <Icon className="w-4 h-4 text-slate-400" />}
                    {label}
                    {required && <span className="text-red-500">*</span>}
                </label>
                <input
                    {...props}
                    disabled={isDisabled}
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition-all placeholder:text-slate-400 ${isDisabled
                        ? "bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed"
                        : "bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        }`}
                />
            </div>
        );
    };

    const SelectField = ({ label, icon: Icon, options, disabled: fieldDisabled, ...props }) => {
        const isDisabled = !isEditMode || fieldDisabled;
        return (
            <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    {Icon && <Icon className="w-4 h-4 text-slate-400" />}
                    {label}
                </label>
                <select
                    {...props}
                    disabled={isDisabled}
                    className={`w-full px-3.5 py-2.5 border rounded-lg text-sm transition-all ${isDisabled
                        ? "bg-slate-50 border-slate-200 text-slate-600 cursor-not-allowed"
                        : "bg-white border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        }`}
                >
                    <option value="">Select {label}</option>
                    {options.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-full overflow-hidden bg-slate-100 border-2 border-slate-200">
                                    {uploading ? (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
                                        </div>
                                    ) : (
                                        <img
                                            src={formData.imageUrl || "/images/default-avatar.png"}
                                            alt="Brand Logo"
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                {isEditMode && (
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={uploading}
                                        className="absolute -bottom-1 -right-1 w-8 h-8 bg-purple-600 hover:bg-purple-700 text-white rounded-full flex items-center justify-center shadow-lg transition-colors disabled:opacity-50"
                                    >
                                        <Camera className="w-4 h-4" />
                                    </button>
                                )}
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-2xl font-bold text-slate-900">{formData.brandName || "Brand Name"}</h1>
                                    {user?.isVerified && (
                                        <div className="px-2 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-md border border-green-200">
                                            ✓ Verified
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-slate-500 mt-0.5">Manage your business profile and preferences</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            {!isEditMode && (
                                <button
                                    onClick={() => setIsEditMode(true)}
                                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md font-medium text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2"
                                >
                                    <Edit3 className="w-4 h-4" />
                                    Edit Profile
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Business Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-purple-600" />
                            Business Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Brand Name"
                                icon={Building2}
                                required
                                value={formData.brandName}
                                onChange={(e) => handleChange("brandName", e.target.value)}
                                placeholder="Enter brand name"
                            />
                            <InputField
                                label="Business Name"
                                icon={Building2}
                                value={formData.businessName}
                                onChange={(e) => handleChange("businessName", e.target.value)}
                                placeholder="Enter business name"
                            />
                            <InputField
                                label="GST Number"
                                icon={FileText}
                                value={formData.gstNumber}
                                onChange={(e) => handleChange("gstNumber", e.target.value)}
                                placeholder="Enter GST number"
                            />
                            <SelectField
                                label="Industry Type"
                                icon={Target}
                                options={INDUSTRY_TYPES}
                                value={formData.industryType}
                                onChange={(e) => handleChange("industryType", e.target.value)}
                            />
                            <div className="md:col-span-2">
                                <InputField
                                    label="Business Address"
                                    icon={MapPin}
                                    value={formData.businessAddress}
                                    onChange={(e) => handleChange("businessAddress", e.target.value)}
                                    placeholder="Enter business address"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Contact Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <Mail className="w-5 h-5 text-purple-600" />
                            Contact Information
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField
                                label="Email"
                                icon={Mail}
                                required
                                type="email"
                                disabled={true}
                                value={formData.email}
                                onChange={(e) => handleChange("email", e.target.value)}
                                placeholder="Enter email"
                            />
                            <InputField
                                label="Phone Number"
                                icon={Phone}
                                required
                                type="tel"
                                value={formData.phoneNumber}
                                onChange={(e) => handleChange("phoneNumber", e.target.value)}
                                placeholder="Enter phone number"
                            />
                            <InputField
                                label="Website URL"
                                icon={Globe}
                                type="url"
                                value={formData.websiteUrl}
                                onChange={(e) => handleChange("websiteUrl", e.target.value)}
                                placeholder="https://example.com"
                            />
                            <InputField
                                label="Target Location"
                                icon={MapPin}
                                value={formData.targetLocation}
                                onChange={(e) => handleChange("targetLocation", e.target.value)}
                                placeholder="Enter target location"
                            />
                        </div>
                    </div>

                    {/* POC Information */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <User className="w-5 h-5 text-purple-600" />
                            Point of Contact
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField
                                label="POC Name"
                                icon={User}
                                value={formData.pocName}
                                onChange={(e) => handleChange("pocName", e.target.value)}
                                placeholder="Enter POC name"
                            />
                            <InputField
                                label="POC Email"
                                icon={Mail}
                                type="email"
                                value={formData.pocEmail}
                                onChange={(e) => handleChange("pocEmail", e.target.value)}
                                placeholder="Enter POC email"
                            />
                            <InputField
                                label="POC Phone"
                                icon={Phone}
                                type="tel"
                                value={formData.pocPhone}
                                onChange={(e) => handleChange("pocPhone", e.target.value)}
                                placeholder="Enter POC phone"
                            />
                        </div>
                    </div>

                    {/* Campaign & Billing */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                            <DollarSign className="w-5 h-5 text-purple-600" />
                            Campaign & Billing Preferences
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SelectField
                                label="Campaign Objective"
                                icon={Target}
                                options={CAMPAIGN_OBJECTIVES}
                                value={formData.campaignObjective}
                                onChange={(e) => handleChange("campaignObjective", e.target.value)}
                            />
                            <InputField
                                label="Ad Budget"
                                icon={DollarSign}
                                type="number"
                                value={formData.adBudget}
                                onChange={(e) => handleChange("adBudget", e.target.value)}
                                placeholder="Enter budget amount"
                            />
                            <SelectField
                                label="Billing Preference"
                                icon={FileText}
                                options={BILLING_PREFERENCES}
                                value={formData.billingPreferences}
                                onChange={(e) => handleChange("billingPreferences", e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Action Buttons - Only show in edit mode */}
                    {isEditMode && (
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-6 py-2.5 border border-slate-200 text-slate-700 rounded-lg font-medium text-sm hover:bg-slate-50 transition-colors flex items-center gap-2"
                            >
                                <X className="w-4 h-4" />
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium text-sm shadow-sm hover:shadow-md transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        Save Changes
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default ProfilePage;