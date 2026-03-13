/**
 * Domain Helper Utility
 * Developed by: Senior Core Team
 * Purpose: To parse the current hostname and extract subdomain information reliably.
 * Supports: Localhost, Staging, and Production environments.
 */

// Configuration for Main Domain
const MAIN_DOMAIN = "i-cpp.com"; 

/**
 * Extracts the subdomain from the current window location.
 * Returns null if it is the main domain.
 */
export const getSubdomain = () => {
  const hostname = window.location.hostname;

  // 1. Handle Localhost (Development Environment)
  // Developers can force a subdomain here for testing purposes if needed.
  if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
    // TIP: Uncomment the line below to test 'zinstitute' view on localhost
    // return "zinstitute"; 
    return null; // Default to main site on localhost
  }

  // 2. Handle Production Domain
  if (hostname === MAIN_DOMAIN || hostname === `www.${MAIN_DOMAIN}`) {
    return null;
  }

  // 3. Extract Subdomain
  const parts = hostname.split(".");
  
  // Logic: specific.alifestableacademy.com (3 parts)
  // If parts are more than 2, the first part is likely the subdomain.
  if (parts.length > 2) {
    return parts[0];
  }

  return null;
};

/**
 * Helper to build the full URL for a partner
 */
export const buildPartnerUrl = (subdomain) => {
  if (!subdomain) return `https://${MAIN_DOMAIN}`;
  return `https://${subdomain}.${MAIN_DOMAIN}`;
};