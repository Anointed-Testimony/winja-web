import axios from "axios";

// Set your API base URL here
const BASE_URL = "https://apiwinjav1.digitalentshub.net/api";

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
export const getSponsoredOpportunity = (id) =>
  api.get(`/sponsored-opportunities/${id}`);
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

// Subscription Plans APIs
export const getSubscriptionPlans = () => api.get("/admin/subscription-plans");
export const createSubscriptionPlan = (data) => api.post("/admin/subscription-plans", data);
export const updateSubscriptionPlan = (id, data) => api.put(`/admin/subscription-plans/${id}`, data);
export const deleteSubscriptionPlan = (id) => api.delete(`/admin/subscription-plans/${id}`);

// User Subscriptions APIs
export const getUserSubscriptionStatus = () => api.get("/subscriptions/user-status");
export const createSubscription = (data) => api.post("/subscriptions/create", data);
export const cancelSubscription = () => api.post("/subscriptions/cancel");

// User Settings APIs
export const getUserSettings = () => api.get("/user/settings");
export const updateUserSettings = (data) => api.put("/user/settings", data);

// Ad Management APIs
export const getAdCampaigns = () => api.get("/admin/ad-campaigns");
export const approveAdCampaign = (campaignId) => api.post(`/admin/ad-campaigns/${campaignId}/approve`);
export const rejectAdCampaign = (campaignId) => api.post(`/admin/ad-campaigns/${campaignId}/reject`);
export const getAdCampaignStats = (campaignId) => api.get(`/admin/ad-campaigns/${campaignId}/stats`);

// Ad Settings APIs
export const getAdSettings = () => api.get("/admin/ad-settings");
export const updateAdSettings = (id, data) => api.post(`/admin/ad-settings/${id}`, data);
export const getAdAnalytics = () => api.get("/admin/ad-analytics");
export const getAdRevenue = () => api.get("/admin/ad-revenue");

// Admin Wallet APIs
export const getWalletBalance = () => api.get("/admin/wallet/balance");
export const getWalletTransactions = (params) => api.get("/admin/wallet/transactions", { params });
export const getWalletStats = () => api.get("/admin/wallet/stats");
export const getWalletAdRevenueAnalytics = () => api.get("/admin/wallet/ad-revenue-analytics");
export const getWalletRevenueSummary = (params) => api.get("/admin/wallet/revenue-summary", { params });

// Points Management APIs
export const getPointsSettings = () => api.get("/admin/points/settings");
export const updatePointsSettings = (data) => api.post("/admin/points/settings", data);
export const getPointsOverview = () => api.get("/admin/points/overview");

// Withdrawal Management APIs
export const getWithdrawalRequests = (params) => api.get("/admin/withdrawals/requests", { params });
export const getWithdrawalDetails = (id) => api.get(`/admin/withdrawals/requests/${id}`);
export const approveWithdrawal = (id, data) => api.post(`/admin/withdrawals/requests/${id}/approve`, data);
export const rejectWithdrawal = (id, data) => api.post(`/admin/withdrawals/requests/${id}/reject`, data);
export const getWithdrawalStats = () => api.get("/admin/withdrawals/requests/stats");
