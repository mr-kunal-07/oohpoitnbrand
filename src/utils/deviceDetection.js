/**
 * Device Detection Utility
 * Detects device type, OS, and browser from user agent string
 */

export const detectDevice = (userAgent) => {
  if (!userAgent) {
    userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
  }

  const ua = userAgent.toLowerCase();

  // Detect OS
  let os = 'Unknown';
  if (/android/.test(ua)) {
    os = 'Android';
  } else if (/iphone|ipad|ipod/.test(ua)) {
    os = 'iOS';
  } else if (/windows phone/.test(ua)) {
    os = 'Windows Phone';
  } else if (/windows/.test(ua)) {
    os = 'Windows';
  } else if (/macintosh|mac os x/.test(ua)) {
    os = 'MacOS';
  } else if (/linux/.test(ua)) {
    os = 'Linux';
  }

  // Detect Device Type
  let deviceType = 'Desktop';
  if (/mobile/.test(ua) || /android/.test(ua) || /iphone/.test(ua)) {
    deviceType = 'Mobile';
  } else if (/tablet/.test(ua) || /ipad/.test(ua)) {
    deviceType = 'Tablet';
  }

  // Detect Browser
  let browser = 'Unknown';
  if (/edg/.test(ua)) {
    browser = 'Edge';
  } else if (/chrome/.test(ua) && !/edg/.test(ua)) {
    browser = 'Chrome';
  } else if (/safari/.test(ua) && !/chrome/.test(ua)) {
    browser = 'Safari';
  } else if (/firefox/.test(ua)) {
    browser = 'Firefox';
  } else if (/opera|opr/.test(ua)) {
    browser = 'Opera';
  }

  return {
    os,
    deviceType,
    browser,
    userAgent: userAgent,
  };
};

/**
 * Get current device info
 */
export const getCurrentDeviceInfo = () => {
  if (typeof window === 'undefined') {
    return {
      os: 'Unknown',
      deviceType: 'Unknown',
      browser: 'Unknown',
      userAgent: '',
    };
  }

  return detectDevice(window.navigator.userAgent);
};

/**
 * Format device info for display
 */
export const formatDeviceInfo = (deviceInfo) => {
  if (!deviceInfo) return 'Unknown Device';
  
  const { os, deviceType, browser } = deviceInfo;
  return `${os} (${deviceType}) - ${browser}`;
};
