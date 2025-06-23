import React, { useState, useEffect } from 'react';
import AdminLayout from "../../layouts/AdminLayout";
import theme from "../../theme";
import { 
  FaDollarSign, 
  FaEye, 
  FaHandPointer, 
  FaBullseye,
  FaCheckCircle,
  FaTimesCircle,
  FaCog,
  FaChartBar,
  FaAd
} from "react-icons/fa";
import {
  getAdCampaigns,
  approveAdCampaign,
  rejectAdCampaign,
  getAdSettings,
  updateAdSettings,
  getAdAnalytics,
  getAdRevenue
} from '../../api';

const AdManagement = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [pricing, setPricing] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [revenue, setRevenue] = useState({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('campaigns');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [campaignsRes, pricingRes, analyticsRes, revenueRes] = await Promise.all([
        getAdCampaigns(),
        getAdSettings(),
        getAdAnalytics(),
        getAdRevenue()
      ]);
      setCampaigns(campaignsRes.data.data || []);
      setPricing(pricingRes.data.data || []);
      setAnalytics(analyticsRes.data.data || {});
      setRevenue(revenueRes.data.data || {});
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveCampaign = async (campaignId) => {
    try {
      await approveAdCampaign(campaignId);
      fetchData();
    } catch (error) {
      console.error('Error approving campaign:', error);
    }
  };

  const rejectCampaign = async (campaignId) => {
    try {
      await rejectAdCampaign(campaignId);
      fetchData();
    } catch (error) {
      console.error('Error rejecting campaign:', error);
    }
  };

  const updatePricing = async (id, data) => {
    try {
      await updateAdSettings(id, data);
      fetchData();
    } catch (error) {
      console.error('Error updating pricing:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Pending' },
      approved: { color: 'bg-green-100 text-green-800', text: 'Approved' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Rejected' },
      active: { color: 'bg-blue-100 text-blue-800', text: 'Active' },
      completed: { color: 'bg-gray-100 text-gray-800', text: 'Completed' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>{config.text}</span>;
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64 text-gray-700">Loading...</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">Ad Management Dashboard</h1>
        </div>

        {/* Analytics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">₦{revenue.total?.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-500">+{revenue.growth || 0}% from last month</p>
              </div>
              <div className="p-2 bg-green-100 rounded-full">
                <FaDollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.activeCampaigns || 0}</p>
                <p className="text-xs text-gray-500">{analytics.pendingCampaigns || 0} pending approval</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-full">
                <FaBullseye className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Impressions</p>
                <p className="text-2xl font-bold text-gray-900">{analytics.totalImpressions?.toLocaleString() || '0'}</p>
                <p className="text-xs text-gray-500">+{analytics.impressionGrowth || 0}% from last month</p>
              </div>
              <div className="p-2 bg-purple-100 rounded-full">
                <FaEye className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Click Rate</p>
                <p className="text-2xl font-bold text-gray-900">{(analytics.clickRate || 0).toFixed(2)}%</p>
                <p className="text-xs text-gray-500">{analytics.totalClicks?.toLocaleString() || '0'} total clicks</p>
              </div>
              <div className="p-2 bg-orange-100 rounded-full">
                <FaHandPointer className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6">
              <button 
                onClick={() => setActiveTab('campaigns')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'campaigns' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Campaign Approval
              </button>
              <button 
                onClick={() => setActiveTab('pricing')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'pricing' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Pricing Management
              </button>
              <button 
                onClick={() => setActiveTab('analytics')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'analytics' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Performance Analytics
              </button>
              <button 
                onClick={() => setActiveTab('revenue')}
                className={`py-4 px-1 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'revenue' 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Revenue Tracking
              </button>
            </nav>
          </div>

          <div className="p-6">
            {/* Campaign Approval Tab */}
            {activeTab === 'campaigns' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Pending Campaign Approvals</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partner</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opportunity</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ad Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaigns.filter(c => c.status === 'pending').map((campaign) => (
                        <tr key={campaign.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {campaign.partner?.name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {campaign.opportunity?.title || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {campaign.ad_type === 'featured' ? 'Featured' : 'Inline'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            {campaign.duration_value} {campaign.duration_type}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                            ₦{campaign.amount_paid?.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(campaign.status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => approveCampaign(campaign.id)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                              >
                                <FaCheckCircle className="w-3 h-3" />
                                Approve
                              </button>
                              <button
                                onClick={() => rejectCampaign(campaign.id)}
                                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs flex items-center gap-1"
                              >
                                <FaTimesCircle className="w-3 h-3" />
                                Reject
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Pricing Management Tab */}
            {activeTab === 'pricing' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Ad Pricing Configuration</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Featured Ads</h4>
                    {['daily', 'weekly'].map(duration => {
                      const setting = pricing.find(p => p.ad_type === 'featured' && p.duration_type === duration);
                      if (!setting) return null;
                      return (
                        <div className="space-y-2" key={`featured-${duration}`}> 
                          <label className="block text-sm font-medium text-gray-700">{duration.charAt(0).toUpperCase() + duration.slice(1)} Rate (₦)</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                              value={setting.price}
                              onChange={e => setPricing(pricing.map(p => p.id === setting.id ? { ...p, price: e.target.value } : p))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                        <button 
                              onClick={() => updatePricing(setting.id, { price: Number(setting.price) })}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                      );
                    })}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-gray-800">Inline Ads</h4>
                    {['daily', 'weekly'].map(duration => {
                      const setting = pricing.find(p => p.ad_type === 'inline' && p.duration_type === duration);
                      if (!setting) return null;
                      return (
                        <div className="space-y-2" key={`inline-${duration}`}> 
                          <label className="block text-sm font-medium text-gray-700">{duration.charAt(0).toUpperCase() + duration.slice(1)} Rate (₦)</label>
                      <div className="flex space-x-2">
                        <input
                          type="number"
                              value={setting.price}
                              onChange={e => setPricing(pricing.map(p => p.id === setting.id ? { ...p, price: e.target.value } : p))}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                        />
                        <button 
                              onClick={() => updatePricing(setting.id, { price: Number(setting.price) })}
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Performance Analytics Tab */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-800">Performance Analytics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800">Campaign Performance</h4>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Campaign</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Impressions</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">CTR</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {analytics.campaignPerformance?.map((campaign) => (
                            <tr key={campaign.id}>
                              <td className="px-4 py-2 text-sm text-gray-900">{campaign.title}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{campaign.impressions?.toLocaleString()}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{campaign.clicks?.toLocaleString()}</td>
                              <td className="px-4 py-2 text-sm text-gray-700">{campaign.ctr}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-lg shadow">
                    <h4 className="text-lg font-semibold mb-4 text-gray-800">Ad Type Performance</h4>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Featured Ads</span>
                        <span className="font-semibold text-gray-900">{(analytics.featuredCTR || 0).toFixed(2)}% CTR</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">Inline Ads</span>
                        <span className="font-semibold text-gray-900">{(analytics.inlineCTR || 0).toFixed(2)}% CTR</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Revenue Tracking Tab */}
            {activeTab === 'revenue' && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Revenue Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Period</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inline Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Revenue</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Growth</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {revenue.breakdown?.map((period) => (
                        <tr key={period.period}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{period.period}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₦{period.featured?.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₦{period.inline?.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">₦{period.total?.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={period.growth >= 0 ? 'text-green-600' : 'text-red-600'}>
                              {period.growth >= 0 ? '+' : ''}{period.growth}%
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdManagement; 