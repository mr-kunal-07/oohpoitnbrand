import { detectDevice } from './deviceDetection';

/**
 * Calculate device distribution from user data
 * @param {Array} users - Array of user objects
 * @param {Array} campaigns - Array of campaign objects (optional, for filtering)
 * @param {String} brandId - Brand ID to filter campaigns (optional)
 * @returns {Object} Device distribution stats
 */
export const calculateDeviceDistribution = (users, campaigns = null, brandId = null) => {
  const deviceCounts = {
    Android: 0,
    iOS: 0,
    Windows: 0,
    MacOS: 0,
    Linux: 0,
    Other: 0,
  };

  let totalUsers = 0;
  const userIdsProcessed = new Set();

  // If campaigns are provided, filter users who scanned campaigns
  if (campaigns && brandId) {
    campaigns.forEach((campaign) => {
      if (campaign.client === brandId && campaign.ipAddress) {
        campaign.ipAddress.forEach(({ userId }) => {
          if (!userIdsProcessed.has(userId)) {
            userIdsProcessed.add(userId);
            const user = users.find((u) => u.id === userId);
            
            if (user) {
              totalUsers++;
              const deviceInfo = detectDevice(user.userAgent || user.device || '');
              const os = deviceInfo.os;

              if (deviceCounts.hasOwnProperty(os)) {
                deviceCounts[os]++;
              } else {
                deviceCounts.Other++;
              }
            }
          }
        });
      }
    });
  } else {
    // Process all users
    users.forEach((user) => {
      if (user.userAgent || user.device) {
        totalUsers++;
        const deviceInfo = detectDevice(user.userAgent || user.device || '');
        const os = deviceInfo.os;

        if (deviceCounts.hasOwnProperty(os)) {
          deviceCounts[os]++;
        } else {
          deviceCounts.Other++;
        }
      }
    });
  }

  // Convert to array format for charts
  const deviceData = Object.entries(deviceCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    deviceData,
    totalUsers,
    deviceCounts,
  };
};

/**
 * Calculate device type distribution (Mobile, Desktop, Tablet)
 * @param {Array} users - Array of user objects
 * @param {Array} campaigns - Array of campaign objects (optional)
 * @param {String} brandId - Brand ID to filter campaigns (optional)
 * @returns {Object} Device type distribution stats
 */
export const calculateDeviceTypeDistribution = (users, campaigns = null, brandId = null) => {
  const deviceTypeCounts = {
    Mobile: 0,
    Desktop: 0,
    Tablet: 0,
    Unknown: 0,
  };

  let totalUsers = 0;
  const userIdsProcessed = new Set();

  if (campaigns && brandId) {
    campaigns.forEach((campaign) => {
      if (campaign.client === brandId && campaign.ipAddress) {
        campaign.ipAddress.forEach(({ userId }) => {
          if (!userIdsProcessed.has(userId)) {
            userIdsProcessed.add(userId);
            const user = users.find((u) => u.id === userId);
            
            if (user) {
              totalUsers++;
              const deviceInfo = detectDevice(user.userAgent || user.device || '');
              const deviceType = deviceInfo.deviceType;

              if (deviceTypeCounts.hasOwnProperty(deviceType)) {
                deviceTypeCounts[deviceType]++;
              } else {
                deviceTypeCounts.Unknown++;
              }
            }
          }
        });
      }
    });
  } else {
    users.forEach((user) => {
      if (user.userAgent || user.device) {
        totalUsers++;
        const deviceInfo = detectDevice(user.userAgent || user.device || '');
        const deviceType = deviceInfo.deviceType;

        if (deviceTypeCounts.hasOwnProperty(deviceType)) {
          deviceTypeCounts[deviceType]++;
        } else {
          deviceTypeCounts.Unknown++;
        }
      }
    });
  }

  const deviceTypeData = Object.entries(deviceTypeCounts).map(([name, value]) => ({
    name,
    value,
  }));

  return {
    deviceTypeData,
    totalUsers,
    deviceTypeCounts,
  };
};
