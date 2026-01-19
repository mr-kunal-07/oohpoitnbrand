"use client";
import { useState, useEffect } from "react";
import { db } from "@/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  BarChart3,
  Users,
  MousePointerClick,
  TrendingUp,
  Globe,
  Clock,
  X,
  Copy,
  CheckCircle,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import toast from "react-hot-toast";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
const SDK_SCRIPT_URL = process.env.NEXT_PUBLIC_SDK_URL || "http://localhost:3001/public/sdk.js";

const AdvancedAttribution = ({ campaignId, isOpen, onClose }) => {
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(true);
  const [attributionData, setAttributionData] = useState(null);
  const [websiteId, setWebsiteId] = useState(null);
  const [apiKey, setApiKey] = useState(null);
  const [partnerKey, setPartnerKey] = useState(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check Firebase for websiteId/apiKey
  useEffect(() => {
    if (!isOpen || !campaignId) return;

    const checkFirebase = async () => {
      try {
        setChecking(true);
        const campaignRef = doc(db, "campaigns", campaignId);
        const campaignDoc = await getDoc(campaignRef);

        if (campaignDoc.exists()) {
          const data = campaignDoc.data();
          const foundWebsiteId = data.websiteId || data.ooohpointWebsiteId;
          const foundApiKey = data.apiKey || data.ooohpointApiKey;
          const foundPartnerKey = data.partnerKey || data.ooohpointPartnerKey;

          if (foundWebsiteId || foundApiKey) {
            setWebsiteId(foundWebsiteId);
            setApiKey(foundApiKey);
            setPartnerKey(foundPartnerKey);
            // Fetch attribution data
            await fetchAttributionData(foundWebsiteId, foundPartnerKey, campaignId);
          } else {
            setShowInstallModal(true);
          }
        } else {
          setShowInstallModal(true);
        }
      } catch (error) {
        console.error("Error checking Firebase:", error);
        toast.error("Failed to check attribution setup");
        setShowInstallModal(true);
      } finally {
        setChecking(false);
        setLoading(false);
      }
    };

    checkFirebase();
  }, [isOpen, campaignId]);

  const fetchAttributionData = async (wId, pKey, cId) => {
    try {
      setLoading(true);
      const response = await fetch(
        `${BACKEND_URL}/api/tracking/public/campaign/${wId}/${cId}?timeRange=90d&partnerKey=${pKey}`
      );

      if (!response.ok) {
        if (response.status === 404) {
          toast.error("No attribution data found. Make sure the SDK is installed and tracking data.");
          return;
        }
        throw new Error("Failed to fetch attribution data");
      }

      const result = await response.json();
      if (result.success && result.data) {
        setAttributionData(result.data);
      }
    } catch (error) {
      console.error("Error fetching attribution:", error);
      toast.error("Failed to load attribution data");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyScript = () => {
    const script = `<script src="${SDK_SCRIPT_URL}?apiKey=${apiKey || "YOUR_API_KEY"}" defer></script>`;
    navigator.clipboard.writeText(script);
    setCopied(true);
    toast.success("Script copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveWebsiteId = async () => {
    if (!websiteId || !partnerKey) {
      toast.error("Please generate API key first");
      return;
    }

    try {
      const campaignRef = doc(db, "campaigns", campaignId);
      await updateDoc(campaignRef, {
        websiteId: websiteId,
        partnerKey: partnerKey,
        apiKey: apiKey,
        ooohpointWebsiteId: websiteId,
        ooohpointPartnerKey: partnerKey,
        ooohpointApiKey: apiKey,
      });
      toast.success("Website ID saved!");
      setShowInstallModal(false);
      await fetchAttributionData(websiteId, partnerKey, campaignId);
    } catch (error) {
      console.error("Error saving:", error);
      toast.error("Failed to save website ID");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Advanced Attribution</h2>
              <p className="text-sm text-slate-500">Detailed tracking and analytics</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {checking ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
              <p className="text-slate-600">Checking attribution setup...</p>
            </div>
          ) : showInstallModal ? (
            <InstallInstructions
              campaignId={campaignId}
              onGenerateApiKey={async () => {
                // Generate API key via backend
                try {
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
                  
                  // Step 2: Generate API key for website
                  const websiteName = `Campaign ${campaignId}`;
                  const websiteDomain = typeof window !== 'undefined' ? window.location.hostname : 'example.com';
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
                    toast.success("API key generated successfully!");
                  } else {
                    throw new Error(apiResult.error || "Failed to generate API key");
                  }
                } catch (error) {
                  console.error("Error generating API key:", error);
                  toast.error(error.message || "Failed to generate API key");
                }
              }}
              apiKey={apiKey}
              websiteId={websiteId}
              onCopyScript={handleCopyScript}
              copied={copied}
              onSave={handleSaveWebsiteId}
            />
          ) : loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-purple-600 animate-spin mb-4" />
              <p className="text-slate-600">Loading attribution data...</p>
            </div>
          ) : attributionData ? (
            <AttributionDashboard data={attributionData} />
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Data Available</h3>
              <p className="text-slate-600 text-center max-w-md">
                No attribution data found for this campaign. Make sure the SDK is installed and tracking data has been sent.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const InstallInstructions = ({
  campaignId,
  onGenerateApiKey,
  apiKey,
  websiteId,
  onCopyScript,
  copied,
  onSave,
}) => {
  const [step, setStep] = useState(1);

  return (
    <div className="space-y-6">
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
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
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-900">Step 1: Generate API Key</h3>
          <button
            onClick={onGenerateApiKey}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Generate API Key
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">API Key Generated</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-slate-700">Website ID:</span>
                <span className="ml-2 font-mono text-xs bg-white px-2 py-1 rounded border">{websiteId}</span>
              </div>
              <div>
                <span className="font-medium text-slate-700">API Key:</span>
                <span className="ml-2 font-mono text-xs bg-white px-2 py-1 rounded border">
                  {apiKey.substring(0, 30)}...
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-slate-900 mb-3">Step 2: Install SDK Script</h3>
            <p className="text-sm text-slate-600 mb-4">
              Add this script to your website&apos;s <code className="bg-slate-100 px-1 rounded">&lt;head&gt;</code> section:
            </p>
            <div className="bg-slate-900 rounded-lg p-4 relative">
              <pre className="text-green-400 text-xs overflow-x-auto">
                <code>{`<script src="${SDK_SCRIPT_URL}?apiKey=${apiKey}" defer></script>`}</code>
              </pre>
              <button
                onClick={onCopyScript}
                className="absolute top-2 right-2 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
              >
                {copied ? (
                  <CheckCircle className="w-4 h-4 text-green-400" />
                ) : (
                  <Copy className="w-4 h-4 text-slate-400" />
                )}
              </button>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Campaign Tracking</h4>
            <p className="text-sm text-blue-700 mb-3">
              To track this specific campaign, add the campaignId parameter to your URLs:
            </p>
            <div className="bg-white rounded p-3 font-mono text-xs">
              {`https://yourwebsite.com?campaignId=${campaignId}`}
            </div>
          </div>

          <button
            onClick={onSave}
            className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
          >
            Save & Continue
          </button>
        </div>
      )}
    </div>
  );
};

const AttributionDashboard = ({ data }) => {
  if (!data) return null;

  const {
    summary,
    campaign,
    actions,
    pages,
    users,
    sessions,
    customEvents,
  } = data;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Sessions"
          value={summary.totalSessions}
          icon={Globe}
          color="purple"
        />
        <MetricCard
          title="Unique Users"
          value={summary.uniqueUsers}
          icon={Users}
          color="blue"
        />
        <MetricCard
          title="Total Events"
          value={summary.totalEvents}
          icon={MousePointerClick}
          color="green"
        />
        <MetricCard
          title="Important Actions"
          value={summary.totalImportantActions}
          icon={TrendingUp}
          color="orange"
        />
      </div>

      {/* Campaign Overview */}
      <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
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

      {/* Recent Sessions */}
      {sessions.length > 0 && (
        <div className="bg-white rounded-lg p-6 border border-slate-200">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Recent Sessions</h3>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((session, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-mono text-slate-600">{session.sessionId.substring(0, 20)}...</span>
                  <span className="text-xs text-slate-500">
                    {new Date(session.startedAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-slate-600">
                  <span>Events: {session.eventsCount}</span>
                  <span>Pages: {session.pageViewsCount}</span>
                  <span>Actions: {session.importantActionsCount}</span>
                </div>
              </div>
            ))}
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

export default AdvancedAttribution;
