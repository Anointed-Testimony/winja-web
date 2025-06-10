import axios from "axios";

// Set your API base URL here
const BASE_URL = "http://127.0.0.1:8000/api";

export const api = axios.create({
  baseURL: BASE_URL,
  // Remove default Content-Type so browser sets it for FormData
});

// Attach token to all requests if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const loginApi = (data) => api.post("/login", data);
export const registerApi = (data) => api.post("/register", data);

// Opportunity Type APIs
export const getOpportunityTypes = () => api.get("/opportunity-types");
export const createOpportunityType = (data) =>
  api.post("/opportunity-types", data);
export const updateOpportunityType = (id, data) =>
  api.put(`/opportunity-types/${id}`, data);
export const deleteOpportunityType = (id) =>
  api.delete(`/opportunity-types/${id}`);

// Opportunity APIs
export const getOpportunities = () => api.get("/opportunities");
export const createOpportunity = (data) => {
  console.log('Raw form data before processing:', data);
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      if (key === "verified") {
        // Always send as 1 or 0
        formData.append(key, data[key] ? 1 : 0);
      } else if (key === "image") {
        console.log('Image file:', data[key]);
        if (data[key] instanceof File) {
          console.log('Appending image file to FormData');
          formData.append(key, data[key]);
        } else {
          console.log('Image is not a File instance:', data[key]);
        }
      } else {
        formData.append(key, data[key]);
      }
    }
  }
  
  // Debug FormData contents
  console.log('FormData contents:');
  for (let pair of formData.entries()) {
    console.log(pair[0] + ': ' + pair[1]);
  }
  
  return api.post("/opportunities", formData);
};
export const updateOpportunity = (id, data) => {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      if (key === "verified") {
        formData.append(key, data[key] ? 1 : 0);
      } else if (key === "image") {
        if (data[key] instanceof File) {
          formData.append(key, data[key]);
        }
      } else {
        formData.append(key, data[key]);
      }
    }
  }
  return api.post(`/opportunities/${id}?_method=PUT`, formData);
};
export const deleteOpportunity = (id) => api.delete(`/opportunities/${id}`);

// Sponsored Opportunity APIs
export const getSponsoredOpportunities = () =>
  api.get("/sponsored-opportunities");
export const createSponsoredOpportunity = (data) =>
  api.post("/sponsored-opportunities", data);
export const updateSponsoredOpportunity = (id, data) =>
  api.put(`/sponsored-opportunities/${id}`, data);
export const deleteSponsoredOpportunity = (id) =>
  api.delete(`/sponsored-opportunities/${id}`);

// User Management APIs
export const getUsers = (params) => api.get("/users", { params });
export const getUser = (id) => api.get(`/users/${id}`);
export const updateUser = (id, data) => api.put(`/users/${id}`, data);
export const banUser = (id) => api.post(`/users/${id}/ban`);
export const deactivateUser = (id) => api.post(`/users/${id}/deactivate`);
export const activateUser = (id) => api.post(`/users/${id}/activate`);

// Partner Management APIs
export const getPartners = (params) => api.get("/partners", { params });
export const getPartner = (id) => api.get(`/partners/${id}`);
export const updatePartner = (id, data) => {
  const formData = new FormData();
  for (const key in data) {
    if (data[key] !== undefined && data[key] !== null) {
      if (key === "company_logo") {
        if (data[key] instanceof File) {
          formData.append(key, data[key]);
        }
      } else {
        formData.append(key, data[key]);
      }
    }
  }
  return api.post(`/partners/${id}?_method=PUT`, formData);
};
export const getPartnerSponsoredOpportunities = (id, params) =>
  api.get(`/partners/${id}/sponsored-opportunities`, { params });
export const getPartnerMetrics = (id) => api.get(`/partners/${id}/metrics`);

// Get all partners for dropdowns
export const getAllPartners = () => api.get("/partners/all");

// Analytics APIs
export const getOpportunityAnalytics = () =>
  api.get("/opportunities/analytics");
export const getUserEngagementAnalytics = () =>
  api.get("/analytics/user-engagement");
export const getRevenueAnalytics = () => api.get("/analytics/revenue");
export const getTrendsAnalytics = () => api.get("/analytics/trends");
export const exportOpportunityAnalyticsCsv = () =>
  api.get("/opportunities/export/csv", { responseType: "blob" });
export const exportOpportunityAnalyticsPdf = () =>
  api.get("/opportunities/export/pdf", { responseType: "blob" });
export const incrementOpportunityCounter = (id, type) =>
  api.post(`/opportunities/${id}/increment/${type}`);

// Referral & Rewards APIs
export const getReferrals = () => api.get("/referrals");
export const createReferral = (data) => api.post("/referrals", data);
export const completeReferral = (id) => api.post(`/referrals/${id}/complete`);
export const getReferralLeaderboard = () => api.get("/referrals/leaderboard");
export const getBadges = () => api.get("/badges");
export const checkBadgeEligibility = () =>
  api.post("/badges/check-eligibility");

// Moderation APIs
export const getModerationReports = (params) =>
  api.get("/moderation/reports", { params });
export const getModerationReportDetails = (id) =>
  api.get(`/moderation/reports/${id}`);
export const takeModerationAction = (id, data) =>
  api.post(`/moderation/reports/${id}/action`, data);
export const getModerationStats = () => api.get("/moderation/stats");
export const getAutoFlaggedContent = () => api.get("/moderation/auto-flagged");
export const getUserModerationHistory = (userId) =>
  api.get(`/moderation/users/${userId}/history`);

// Settings & Config APIs
export const getSettings = () => api.get("/settings");
export const updateSettings = (data) => api.put("/settings", data);

// Push Notifications APIs
export const getPushNotifications = (params) =>
  api.get("/push-notifications", { params });
export const createPushNotification = (data) =>
  api.post("/push-notifications", data);
export const updatePushNotification = (id, data) =>
  api.put(`/push-notifications/${id}`, data);
export const deletePushNotification = (id) =>
  api.delete(`/push-notifications/${id}`);

// Add more API endpoints as needed, e.g.:
// export const getOpportunities = () => api.get("/opportunities");
// export const getUserProfile = () => api.get("/user/profile");
export const getSavedOpportunities = () => api.get("/saved-opportunities");

export const getActivityLogs = () => api.get("/activity-logs");
