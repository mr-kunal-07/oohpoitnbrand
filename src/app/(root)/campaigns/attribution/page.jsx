"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  BarChart3,
  Users,
  MousePointerClick,
  TrendingUp,
  Globe,
  Clock,
  ArrowLeft,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  Code,
  Key,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronRight,
  FileText,
  Network,
  Activity,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const SDK_SCRIPT_URL = process.env.NEXT_PUBLIC_SDK_URL || "http://localhost:3001/public/sdk.js";

const AttributionPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const campaignId = searchParams.get("campaignId");

  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [attributionData, setAttributionData] = useState(null);
  const [websiteId, setWebsiteId] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [partnerKey, setPartnerKey] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [showInstallInstructions, setShowInstallInstructions] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copied, setCopied] = useState({});

  useEffect(() => {
    if (!campaignId) {
      toast.error("Campaign ID is required");
      router.push("/campaigns");
      return;
    }

    checkFirebase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const checkFirebase = async () => {
    try {
      setChecking(true);
      // First, get the campaign to find the brandId (client)
      const campaignRef = doc(db, "campaigns", campaignId);
      const campaignDoc = await getDoc(campaignRef);

      if (!campaignDoc.exists()) {
        setNeedsSetup(true);
        return;
      }

      const campaignData = campaignDoc.data();
      const brandId = campaignData.client || campaignData.brandId;

      if (!brandId) {
        toast.error("Campaign does not have a brand/client assigned");
        setNeedsSetup(true);
        return;
      }

      // Check the brand document for API key/website ID
      const brandRef = doc(db, "brands", brandId);
      const brandDoc = await getDoc(brandRef);

      if (brandDoc.exists()) {
        const brandData = brandDoc.data();
        const foundWebsiteId = brandData.websiteId || brandData.ooohpointWebsiteId;
        const foundApiKey = brandData.apiKey || brandData.ooohpointApiKey;
        const foundPartnerKey = brandData.partnerKey || brandData.ooohpointPartnerKey;

        if (foundWebsiteId && foundApiKey && foundPartnerKey) {
          setWebsiteId(foundWebsiteId);
          setApiKey(foundApiKey);
          setPartnerKey(foundPartnerKey);
          setNeedsSetup(false);
          await fetchAttributionData(foundWebsiteId, foundPartnerKey, campaignId);
        } else {
          setNeedsSetup(true);
        }
      } else {
        setNeedsSetup(true);
      }
    } catch (error) {
      console.error("Error checking Firebase:", error);
      toast.error("Failed to check attribution setup");
      setNeedsSetup(true);
    } finally {
      setChecking(false);
      setLoading(false);
    }
  };

  const fetchAttributionData = async (wId, pKey, cId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/tracking/public/campaign/${wId}/${cId}?timeRange=90d&partnerKey=${pKey}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          setNeedsSetup(true);
          return;
        }
        throw new Error("Failed to fetch attribution data");
      }

      const result = await response.json();
      if (result.success && result.data) {
        // Store partnerKey in metadata for AI insights
        result.data.metadata = result.data.metadata || {};
        result.data.metadata.partnerKey = pKey;
        setAttributionData(result.data);
        setNeedsSetup(false);
      }
    } catch (error) {
      console.error("Error fetching attribution:", error);
      toast.error("Failed to load attribution data");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateApiKey = async () => {
    try {
      setLoading(true);
      // Step 1: Create partner
      const partnerResponse = await fetch(`${BACKEND_URL}/api/api-keys/partner/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const partnerResult = await partnerResponse.json();

      if (!partnerResult.success || !partnerResult.partner?.partnerKey) {
        throw new Error(partnerResult.error || "Failed to create partner");
      }

      const newPartnerKey = partnerResult.partner.partnerKey;
      setPartnerKey(newPartnerKey);

      // Get brand info for website name and domain
      const campaignRef = doc(db, "campaigns", campaignId);
      const campaignDoc = await getDoc(campaignRef);
      let websiteName = `Brand Website`;
      let websiteDomain = typeof window !== "undefined" ? window.location.hostname : "example.com";

      if (campaignDoc.exists()) {
        const campaignData = campaignDoc.data();
        const brandId = campaignData.client || campaignData.brandId;
        
        if (brandId) {
          const brandRef = doc(db, "brands", brandId);
          const brandDoc = await getDoc(brandRef);
          
          if (brandDoc.exists()) {
            const brandData = brandDoc.data();
            websiteName = brandData.brandName || brandData.businessName || `Brand ${brandId}`;
            
            // Extract domain from websiteUrl if available
            if (brandData.websiteUrl) {
              try {
                const url = new URL(brandData.websiteUrl);
                websiteDomain = url.hostname;
              } catch (e) {
                // If URL parsing fails, use as is or extract domain manually
                websiteDomain = brandData.websiteUrl.replace(/^https?:\/\//, '').split('/')[0];
              }
            }
          }
        }
      }

      // Step 2: Generate API key for website
      const apiResponse = await fetch(`${BACKEND_URL}/api/api-keys/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          websiteName,
          domain: websiteDomain,
          partnerKey: newPartnerKey,
        }),
      });

      const apiResult = await apiResponse.json();
      
      if (apiResult.success && apiResult.apiKey && apiResult.website) {
        setApiKey(apiResult.apiKey.key);
        setWebsiteId(apiResult.website.id);
        const message = apiResult.message || "API key generated successfully!";
        toast.success(message);
        
        // Save to Firebase
        try {
          await saveToFirebase(apiResult.website.id, apiResult.apiKey.key, newPartnerKey);
        } catch (error) {
          console.error("Error saving to Firebase:", error);
          toast.error("API key generated but failed to save to brand. Please try again.");
          // Still update state so user can see the API key
        }
        
        // Update state
        setNeedsSetup(false);
        setShowInstallInstructions(false);
      } else {
        throw new Error(apiResult.error || "Failed to generate API key");
      }
    } catch (error) {
      console.error("Error generating API key:", error);
      toast.error(error.message || "Failed to generate API key");
    } finally {
      setLoading(false);
    }
  };

  const saveToFirebase = async (wId, aKey, pKey) => {
    try {
      // Get the campaign to find the brandId
      const campaignRef = doc(db, "campaigns", campaignId);
      const campaignDoc = await getDoc(campaignRef);

      if (!campaignDoc.exists()) {
        throw new Error("Campaign not found");
      }

      const campaignData = campaignDoc.data();
      const brandId = campaignData.client || campaignData.brandId;

      if (!brandId) {
        throw new Error("Campaign does not have a brand/client assigned");
      }

      // Save to brand document instead of campaign
      const brandRef = doc(db, "brands", brandId);
      await updateDoc(brandRef, {
        websiteId: wId,
        partnerKey: pKey,
        apiKey: aKey,
        ooohpointWebsiteId: wId,
        ooohpointPartnerKey: pKey,
        ooohpointApiKey: aKey,
      });
    } catch (error) {
      console.error("Error saving to Firebase:", error);
      throw error;
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    toast.success("Copied to clipboard!");
    setTimeout(() => {
      setCopied({ ...copied, [key]: false });
    }, 2000);
  };

  const getSdkScript = () => {
    if (!apiKey) return "";
    return `<script src="${SDK_SCRIPT_URL}?apiKey=${apiKey}" defer></script>`;
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-slate-600">Checking attribution setup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Advanced Attribution</h1>
                <p className="text-sm text-slate-500">Campaign ID: {campaignId}</p>
              </div>
            </div>
            {needsSetup && !showInstallInstructions && (
              <button
                onClick={() => setShowInstallInstructions(true)}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
              >
                <Key className="w-4 h-4" />
                Setup
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showInstallInstructions && (
          <div className="mb-6">
            <button
              onClick={() => setShowInstallInstructions(false)}
              className="mb-4 text-sm text-slate-600 hover:text-slate-900 flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Hide Setup Instructions
            </button>
            <InstallInstructions
              campaignId={campaignId}
              apiKey={apiKey}
              websiteId={websiteId}
              onGenerateApiKey={handleGenerateApiKey}
              loading={loading}
              onCopy={handleCopy}
              copied={copied}
              getSdkScript={getSdkScript}
              showApiKey={showApiKey}
              onToggleApiKey={() => setShowApiKey(!showApiKey)}
            />
          </div>
        )}
        
        {!showInstallInstructions && loading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
            <p className="text-slate-600">Loading attribution data...</p>
          </div>
        ) : attributionData ? (
          <div className="space-y-6">
            <AttributionDashboard data={attributionData} />
          </div>
        ) : needsSetup ? (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-slate-200">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Setup Required</h3>
            <p className="text-slate-600 text-center max-w-md mb-4">
              To view advanced attribution, you need to set up the OoohPoint SDK for this campaign.
            </p>
            <button
              onClick={() => setShowInstallInstructions(true)}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Key className="w-4 h-4" />
              Setup
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-xl border border-slate-200">
            <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No Data Available</h3>
            <p className="text-slate-600 text-center max-w-md mb-4">
              No attribution data found for this campaign. Make sure the SDK is installed and tracking data has been sent.
            </p>
            {websiteId && apiKey && (
              <div className="mt-4 w-full max-w-2xl">
                <div className="bg-white rounded-lg border border-slate-200 p-4">
                  <h4 className="text-sm font-semibold text-slate-900 mb-2">SDK Script</h4>
                  <div className="relative">
                    <pre className="bg-slate-900 text-green-400 p-3 rounded-lg overflow-x-auto text-xs">
                      <code>{getSdkScript()}</code>
                    </pre>
                    <button
                      onClick={() => handleCopy(getSdkScript(), "sdkScript")}
                      className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 rounded transition-colors"
                    >
                      {copied.sdkScript ? (
                        <CheckCircle className="w-3 h-3 text-green-400" />
                      ) : (
                        <Copy className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const InstallInstructions = ({
  campaignId,
  apiKey,
  websiteId,
  onGenerateApiKey,
  loading,
  onCopy,
  copied,
  getSdkScript,
  showApiKey,
  onToggleApiKey,
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-purple-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-purple-900 mb-1">Setup Required</h3>
            <p className="text-sm text-purple-700">
              To view advanced attribution, you need to install the OoohPoint SDK on your website.
            </p>
          </div>
        </div>
      </div>

      {!apiKey ? (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Step 1: Generate API Key</h3>
          <p className="text-sm text-slate-600 mb-4">
            Click the button below to generate an API key for this campaign. Each website domain can only have one API key.
          </p>
          <button
            onClick={onGenerateApiKey}
            disabled={loading}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Key className="w-5 h-5" />
                Generate API Key
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">API Key Generated</h3>
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Website ID</label>
                <div className="flex items-center gap-2">
                  <input
                    type={showApiKey ? "text" : "password"}
                    value={websiteId || ""}
                    readOnly
                    className="flex-1 px-4 py-2 bg-white border border-slate-200 rounded-lg font-mono text-sm"
                  />
                  <button
                    onClick={onToggleApiKey}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => onCopy(websiteId, "websiteId")}
                    className="p-2 hover:bg-slate-100 rounded-lg"
                  >
                    {copied.websiteId ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <Copy className="w-5 h-5 text-slate-600" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Step 2: Install SDK Script</h3>
            <p className="text-sm text-slate-600 mb-4">
              Add this script to your website&apos;s <code className="bg-slate-100 px-1 rounded">&lt;head&gt;</code> section:
            </p>
            <div className="relative mb-4">
              <pre className="bg-slate-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
                <code>{getSdkScript()}</code>
              </pre>
              <button
                onClick={() => onCopy(getSdkScript(), "sdkScript")}
                className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {copied.sdkScript ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Campaign Tracking</h4>
              <p className="text-sm text-blue-700 mb-3">
                To track this specific campaign, add the campaignId parameter to your URLs:
              </p>
              <div className="bg-white rounded p-3 font-mono text-xs mb-3">
                {`https://yourwebsite.com?campaignId=${campaignId}`}
              </div>
              <button
                onClick={() => onCopy(`?campaignId=${campaignId}`, "campaignId")}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {copied.campaignId ? "Copied!" : "Copy campaignId parameter"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const AttributionDashboard = ({ data }) => {
  const [expandedSessions, setExpandedSessions] = useState(new Set());
  const [expandedEvents, setExpandedEvents] = useState(new Set());
  const [aiInsights, setAiInsights] = useState(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  useEffect(() => {
    if (data?.metadata?.websiteId && data?.metadata?.partnerKey) {
      fetchAIInsights(data.metadata.websiteId, data.metadata.partnerKey);
    }
  }, [data?.metadata?.websiteId, data?.metadata?.partnerKey]);

  const fetchAIInsights = async (websiteId, partnerKey) => {
    try {
      setLoadingInsights(true);
      const response = await fetch(
        `${BACKEND_URL}/api/tracking/insights/${websiteId}?timeRange=90d`,
        {
          headers: {
            'X-Partner-Key': partnerKey,
          },
        }
      );
      if (response.ok) {
        const insights = await response.json();
        setAiInsights(insights);
      }
    } catch (error) {
      console.error("Error fetching AI insights:", error);
    } finally {
      setLoadingInsights(false);
    }
  };

  const toggleSession = (sessionId) => {
    const newExpanded = new Set(expandedSessions);
    if (newExpanded.has(sessionId)) {
      newExpanded.delete(sessionId);
    } else {
      newExpanded.add(sessionId);
    }
    setExpandedSessions(newExpanded);
  };

  const toggleEvent = (eventId) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId);
    } else {
      newExpanded.add(eventId);
    }
    setExpandedEvents(newExpanded);
  };

  if (!data) return null;

  const { summary, campaign, actions, pages, users, sessions, customEvents } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard title="Total Sessions" value={summary.totalSessions} icon={Globe} color="purple" />
        <MetricCard title="Unique Users" value={summary.uniqueUsers} icon={Users} color="blue" />
        <MetricCard title="Total Events" value={summary.totalEvents} icon={MousePointerClick} color="green" />
        <MetricCard
          title="Important Actions"
          value={summary.totalImportantActions}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Campaign Overview */}
      <div className="bg-white rounded-lg p-6 border border-slate-200">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Campaign Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-slate-600">Conversion Rate</p>
            <p className="text-2xl font-bold text-slate-900">{campaign.conversionRate}</p>
          </div>
          <div>
            <p className="text-sm text-slate-600">First Seen</p>
            <p className="text-sm font-medium text-slate-900">
              {campaign.firstSeen ? new Date(campaign.firstSeen).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Last Seen</p>
            <p className="text-sm font-medium text-slate-900">
              {campaign.lastSeen ? new Date(campaign.lastSeen).toLocaleDateString() : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-sm text-slate-600">Total Page Views</p>
            <p className="text-2xl font-bold text-slate-900">{summary.totalPageViews}</p>
          </div>
        </div>
      </div>

      {/* Action Breakdown */}
      {actions.breakdown.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Action Breakdown</h3>
          <div className="space-y-2">
            {actions.breakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="font-medium text-slate-700 capitalize">{item.action}</span>
                <span className="text-lg font-bold text-purple-600">{item.count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Pages */}
      {pages.mostVisited.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Most Visited Pages</h3>
          <div className="space-y-2">
            {pages.mostVisited.map((page, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                <span className="text-sm text-slate-700 truncate flex-1">{page.url}</span>
                <span className="text-lg font-bold text-blue-600 ml-4">{page.visits}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Breakdown */}
      {users.breakdown.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">User Activity</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-2 px-3 text-sm font-semibold text-slate-700">User ID</th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Sessions</th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Events</th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Page Views</th>
                  <th className="text-right py-2 px-3 text-sm font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.breakdown.slice(0, 10).map((user, idx) => (
                  <tr key={idx} className="border-b border-slate-100">
                    <td className="py-2 px-3 text-sm font-mono text-slate-600">{user.userId}</td>
                    <td className="py-2 px-3 text-sm text-right text-slate-700">{user.sessions}</td>
                    <td className="py-2 px-3 text-sm text-right text-slate-700">{user.events}</td>
                    <td className="py-2 px-3 text-sm text-right text-slate-700">{user.pageViews}</td>
                    <td className="py-2 px-3 text-sm text-right text-slate-700">{user.importantActions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Insights */}
      {aiInsights && (
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-slate-900">AI-Powered Insights</h3>
            {loadingInsights && <Loader2 className="w-4 h-4 animate-spin text-purple-600" />}
          </div>
          {aiInsights.executiveSummary && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Executive Summary</h4>
              <p className="text-sm text-slate-600">{aiInsights.executiveSummary}</p>
            </div>
          )}
          {aiInsights.businessInsights && aiInsights.businessInsights.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Business Insights</h4>
              <ul className="space-y-2">
                {aiInsights.businessInsights.slice(0, 3).map((insight, idx) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-purple-600 mt-1">•</span>
                    <span>{typeof insight === 'string' ? insight : insight.description || insight.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {aiInsights.actionableRecommendations && aiInsights.actionableRecommendations.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-slate-700 mb-2">Recommendations</h4>
              <ul className="space-y-2">
                {aiInsights.actionableRecommendations.slice(0, 3).map((rec, idx) => (
                  <li key={idx} className="text-sm text-slate-600 flex items-start gap-2">
                    <span className="text-blue-600 mt-1">→</span>
                    <span>{typeof rec === 'string' ? rec : rec.title || rec.description}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Detailed Sessions */}
      {sessions.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">All Sessions ({sessions.length})</h3>
          <div className="space-y-4">
            {sessions.map((session, idx) => {
              const isExpanded = expandedSessions.has(session.id || session.sessionId);
              return (
                <div key={session.id || session.sessionId || idx} className="border border-slate-200 rounded-lg overflow-hidden">
                  {/* Session Header */}
                  <div 
                    className="p-4 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
                    onClick={() => toggleSession(session.id || session.sessionId)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1">
                        {isExpanded ? (
                          <ChevronDown className="w-5 h-5 text-slate-600" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-slate-600" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="text-sm font-mono font-semibold text-slate-900">
                              {session.sessionId?.substring(0, 24)}...
                            </span>
                            {session.userId && (
                              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded">
                                User: {session.userId}
                              </span>
                            )}
                            {session.campaignId && (
                              <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded">
                                Campaign: {session.campaignId}
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-xs text-slate-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(session.startedAt).toLocaleString()}
                            </span>
                            {session.duration && (
                              <span>Duration: {Math.round(session.duration / 60)}m {session.duration % 60}s</span>
                            )}
                            {session.userAgent && (
                              <span className="truncate max-w-xs" title={session.userAgent}>
                                {session.userAgent.split(' ')[0]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-slate-600">
                          <Network className="w-4 h-4 inline mr-1" />
                          {session.eventsCount || session.events?.length || 0} events
                        </span>
                        <span className="text-slate-600">
                          <FileText className="w-4 h-4 inline mr-1" />
                          {session.pageViewsCount || session.pageViews?.length || 0} pages
                        </span>
                        <span className="text-purple-600 font-semibold">
                          <Activity className="w-4 h-4 inline mr-1" />
                          {session.importantActionsCount || session.events?.filter(e => e.isImportant).length || 0} actions
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Session Details */}
                  {isExpanded && (
                    <div className="p-4 space-y-4 border-t border-slate-200">
                      {/* Session Metadata */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-500 mb-1">Visitor ID</p>
                          <p className="font-mono text-xs text-slate-700">{session.visitorId}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">IP Address</p>
                          <p className="text-slate-700">{session.ipAddress || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Started</p>
                          <p className="text-slate-700">{new Date(session.startedAt).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-slate-500 mb-1">Ended</p>
                          <p className="text-slate-700">{session.endedAt ? new Date(session.endedAt).toLocaleString() : 'Active'}</p>
                        </div>
                      </div>

                      {/* Events */}
                      {session.events && session.events.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <Network className="w-4 h-4" />
                            Events ({session.events.length})
                          </h4>
                          <div className="space-y-2 max-h-96 overflow-y-auto">
                            {session.events.map((event, eventIdx) => {
                              const isEventExpanded = expandedEvents.has(event.id);
                              return (
                                <div key={event.id || eventIdx} className="border border-slate-200 rounded-lg overflow-hidden">
                                  <div 
                                    className="p-3 bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors flex items-center justify-between"
                                    onClick={() => toggleEvent(event.id)}
                                  >
                                    <div className="flex items-center gap-2 flex-1">
                                      {isEventExpanded ? (
                                        <ChevronDown className="w-4 h-4 text-slate-600" />
                                      ) : (
                                        <ChevronRight className="w-4 h-4 text-slate-600" />
                                      )}
                                      <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
                                        event.method === 'POST' ? 'bg-green-100 text-green-700' :
                                        event.method === 'GET' ? 'bg-blue-100 text-blue-700' :
                                        event.method === 'PUT' ? 'bg-yellow-100 text-yellow-700' :
                                        event.method === 'DELETE' ? 'bg-red-100 text-red-700' :
                                        'bg-slate-100 text-slate-700'
                                      }`}>
                                        {event.method || 'GET'}
                                      </span>
                                      <span className="text-sm text-slate-700 truncate flex-1">{event.url}</span>
                                      {event.isImportant && (
                                        <span className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded font-semibold">
                                          {event.actionType || 'Important'}
                                        </span>
                                      )}
                                      {event.statusCode && (
                                        <span className={`text-xs px-2 py-0.5 rounded ${
                                          event.statusCode >= 200 && event.statusCode < 300 ? 'bg-green-100 text-green-700' :
                                          event.statusCode >= 300 && event.statusCode < 400 ? 'bg-yellow-100 text-yellow-700' :
                                          event.statusCode >= 400 ? 'bg-red-100 text-red-700' :
                                          'bg-slate-100 text-slate-700'
                                        }`}>
                                          {event.statusCode}
                                        </span>
                                      )}
                                      {event.duration && (
                                        <span className="text-xs text-slate-500">{event.duration}ms</span>
                                      )}
                                    </div>
                                  </div>
                                  {isEventExpanded && (
                                    <div className="p-4 space-y-3 border-t border-slate-200 bg-white">
                                      <div className="grid grid-cols-2 gap-4 text-xs">
                                        <div>
                                          <p className="text-slate-500 mb-1">Event Type</p>
                                          <p className="text-slate-700 font-medium">{event.eventType}</p>
                                        </div>
                                        <div>
                                          <p className="text-slate-500 mb-1">Timestamp</p>
                                          <p className="text-slate-700">{new Date(event.timestamp).toLocaleString()}</p>
                                        </div>
                                        {event.actionType && (
                                          <div>
                                            <p className="text-slate-500 mb-1">Action Type</p>
                                            <p className="text-slate-700 font-medium capitalize">{event.actionType}</p>
                                          </div>
                                        )}
                                        {event.responseSize && (
                                          <div>
                                            <p className="text-slate-500 mb-1">Response Size</p>
                                            <p className="text-slate-700">{(event.responseSize / 1024).toFixed(2)} KB</p>
                                          </div>
                                        )}
                                      </div>
                                      {event.requestBody && (
                                        <div>
                                          <p className="text-xs font-semibold text-slate-700 mb-2">Request Body</p>
                                          <pre className="bg-slate-900 text-green-400 p-3 rounded-lg overflow-x-auto text-xs max-h-48 overflow-y-auto">
                                            {JSON.stringify(event.requestBody, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                      {event.responseBody && (
                                        <div>
                                          <p className="text-xs font-semibold text-slate-700 mb-2">Response Body</p>
                                          <pre className="bg-slate-900 text-blue-400 p-3 rounded-lg overflow-x-auto text-xs max-h-48 overflow-y-auto">
                                            {JSON.stringify(event.responseBody, null, 2)}
                                          </pre>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      {/* Page Views */}
                      {session.pageViews && session.pageViews.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            Page Views ({session.pageViews.length})
                          </h4>
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {session.pageViews.map((pv, pvIdx) => (
                              <div key={pv.id || pvIdx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex-1">
                                    <a 
                                      href={pv.url} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                                    >
                                      {pv.url}
                                      <ExternalLink className="w-3 h-3" />
                                    </a>
                                    {pv.title && (
                                      <p className="text-xs text-slate-600 mt-1">{pv.title}</p>
                                    )}
                                  </div>
                                  <span className="text-xs text-slate-500">
                                    {new Date(pv.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-slate-500">
                                  {pv.referrer && (
                                    <span>From: {pv.referrer}</span>
                                  )}
                                  {pv.duration && (
                                    <span>Duration: {Math.round(pv.duration / 1000)}s</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

const MetricCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    purple: "bg-purple-50 text-purple-600 border-purple-200",
    blue: "bg-blue-50 text-blue-600 border-blue-200",
    green: "bg-green-50 text-green-600 border-green-200",
    orange: "bg-orange-50 text-orange-600 border-orange-200",
  };

  return (
    <div className="bg-white rounded-lg p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm text-slate-600">{title}</p>
        <div className={`p-2 rounded-lg border ${colors[color]}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-2xl font-bold text-slate-900">{value.toLocaleString()}</p>
    </div>
  );
};

export default AttributionPage;
    