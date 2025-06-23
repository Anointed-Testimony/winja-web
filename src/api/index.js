// Subscription Plans
export const getSubscriptionPlans = () => axios.get('/api/admin/subscription-plans');
export const createSubscriptionPlan = (data) => axios.post('/api/admin/subscription-plans', data);
export const updateSubscriptionPlan = (id, data) => axios.put(`/api/admin/subscription-plans/${id}`, data);
export const deleteSubscriptionPlan = (id) => axios.delete(`/api/admin/subscription-plans/${id}`);

// User Subscriptions
export const getUserSubscriptionStatus = () => axios.get('/api/subscriptions/user-status');
export const createSubscription = (data) => axios.post('/api/subscriptions/create', data);
export const cancelSubscription = () => axios.post('/api/subscriptions/cancel');

// User Settings
export const getUserSettings = () => axios.get('/api/user/settings');
export const updateUserSettings = (data) => axios.put('/api/user/settings', data); 