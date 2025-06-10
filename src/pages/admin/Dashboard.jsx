import AdminLayout from "../../layouts/AdminLayout";
import theme from "../../theme";
import {
  FaUsers,
  FaGift,
  FaCheckCircle,
  FaUserShield,
  FaBookmark,
  FaShareAlt,
  FaDollarSign,
  FaExclamationCircle,
} from "react-icons/fa";
import { motion } from "framer-motion";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getOpportunities,
  getOpportunityAnalytics,
  getUsers,
  getUserEngagementAnalytics,
  getSavedOpportunities,
  getReferrals,
  getRevenueAnalytics,
  getTrendsAnalytics,
  getActivityLogs,
  getPushNotifications,
} from "../../api";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [kpi, setKpi] = useState({
    totalOpportunities: 0,
    activeOpportunities: 0,
    pendingOpportunities: 0,
    totalUsers: 0,
    activeUsers: 0,
    savedOpportunities: 0,
    referrals: 0,
    revenue: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(true);
  const [notifError, setNotifError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getOpportunities(),
      getOpportunityAnalytics(),
      getUsers(),
      getUserEngagementAnalytics(),
      getSavedOpportunities(),
      getReferrals(),
      getRevenueAnalytics(),
      getTrendsAnalytics(),
    ])
      .then(
        ([
          oppRes,
          oppAnalyticsRes,
          usersRes,
          userEngageRes,
          savedOppRes,
          referralsRes,
          revenueRes,
          trendsRes,
        ]) => {
          // Opportunities
          const allOpps = oppRes.data;
          setKpi((k) => ({
            ...k,
            totalOpportunities: allOpps.length,
            activeOpportunities: allOpps.filter((o) => o.status === "active")
              .length,
            pendingOpportunities: allOpps.filter((o) => o.status === "pending")
              .length,
          }));
          // Users
          setKpi((k) => ({
            ...k,
            totalUsers: usersRes.data.length,
            activeUsers: userEngageRes.data.active || 0,
          }));
          // Saved Opportunities
          setKpi((k) => ({
            ...k,
            savedOpportunities: savedOppRes.data.length,
          }));
          // Referrals
          setKpi((k) => ({ ...k, referrals: referralsRes.data.length }));
          // Revenue
          setKpi((k) => ({ ...k, revenue: revenueRes.data.total || 0 }));
          // Chart Data
          setChartData(trendsRes.data.data || []);
        }
      )
      .catch(() => setError("Failed to load dashboard data."))
      .finally(() => setLoading(false));
  }, []);

  // Fetch activity logs
  useEffect(() => {
    setActivityLoading(true);
    getActivityLogs()
      .then((res) => setActivity(res.data))
      .catch(() => setActivityError("Failed to load activity feed."))
      .finally(() => setActivityLoading(false));
  }, []);

  // Fetch notifications
  useEffect(() => {
    setNotifLoading(true);
    getPushNotifications()
      .then((res) => setNotifications(res.data))
      .catch(() => setNotifError("Failed to load notifications."))
      .finally(() => setNotifLoading(false));
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column Skeletons */}
          <div className="flex flex-col gap-8 col-span-1">
            <SkeletonCard className="h-[260px]" />
            <SkeletonCard className="h-[180px]" />
            <SkeletonCard className="h-[140px]" />
          </div>
          {/* Center Column Skeletons */}
          <div className="flex flex-col gap-8 col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={i} className="h-28" />
              ))}
            </div>
            <SkeletonCard className="h-56 mt-8" />
          </div>
        </div>
      </AdminLayout>
    );
  }
  if (error) {
    return (
      <AdminLayout>
        <div className="text-center text-red-500 py-20">{error}</div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: AI Assistant/Welcome, Activity Feed, Notifications */}
        <div className="flex flex-col gap-8 col-span-1">
          {/* AI Assistant/Welcome Card */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="rounded-3xl overflow-hidden shadow-2xl border-0 p-8 flex flex-col justify-between min-h-[260px] relative"
            style={{
              background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryLight}, ${theme.accent})`,
            }}
          >
            <div className="flex-1 flex flex-col justify-between">
              <h2
                className="text-2xl font-extrabold mb-2 drop-shadow-lg"
                style={{ color: theme.surface }}
              >
                Winja AI Assistant
              </h2>
              <p className="text-white/90 text-base font-medium mb-6 drop-shadow">
                Analyze platform activity, user growth, and opportunity trends.
                Get actionable insights and boost engagement.
              </p>
              <button
                className="mt-auto px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-[#f8f8ff] transition flex items-center gap-2 w-max"
                style={{ background: theme.surface, color: theme.primary }}
              >
                Analyze now <span className="text-lg">→</span>
              </button>
            </div>
            <div
              className="absolute right-4 bottom-4 w-24 h-24 rounded-full blur-2xl"
              style={{ background: theme.surface + "1A" }}
            />
          </motion.div>

          {/* Recent Activity Feed (live) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-3xl shadow-xl p-6 backdrop-blur-lg border flex-1"
            style={{
              background: theme.surfaceGlass,
              borderColor: theme.border,
            }}
          >
            <h4
              className="font-bold mb-4 text-lg"
              style={{ color: theme.primary }}
            >
              Recent Activity
            </h4>
            {activityLoading ? (
              <div className="text-gray-400">Loading activity...</div>
            ) : activityError ? (
              <div className="text-red-500">{activityError}</div>
            ) : activity.length === 0 ? (
              <div className="text-gray-400">No recent activity.</div>
            ) : (
              <ul className="space-y-4">
                {activity.map((log) => (
                  <li key={log.id} className="flex items-center gap-3">
                    <ActivityIcon type={log.type} />
                    <span className="font-semibold text-gray-800">
                      {log.description}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {log.user?.name ? log.user.name + " • " : ""}
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>

          {/* Notifications (live) */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="rounded-3xl shadow-xl p-6 backdrop-blur-lg border flex-1"
            style={{
              background: theme.surfaceGlass,
              borderColor: theme.border,
            }}
          >
            <h4
              className="font-bold mb-4 text-lg"
              style={{ color: theme.primary }}
            >
              Notifications
            </h4>
            {notifLoading ? (
              <div className="text-gray-400">Loading notifications...</div>
            ) : notifError ? (
              <div className="text-red-500">{notifError}</div>
            ) : notifications.length === 0 ? (
              <div className="text-gray-400">No notifications.</div>
            ) : (
              <ul className="space-y-4">
                {notifications.slice(0, 5).map((n) => (
                  <li key={n.id} className="flex items-center gap-3">
                    <FaExclamationCircle className="text-[#ef4444] text-xl" />
                    <span className="font-semibold text-gray-800">
                      {n.message}
                    </span>
                    <span className="text-xs text-gray-400 ml-auto">
                      {n.scheduled_at
                        ? `Scheduled: ${new Date(
                            n.scheduled_at
                          ).toLocaleString()}`
                        : n.sent_at
                        ? `Sent: ${new Date(n.sent_at).toLocaleString()}`
                        : n.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </motion.div>
        </div>

        {/* Center Column: KPI Cards, Chart */}
        <div className="flex flex-col gap-8 col-span-2">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            <KpiCard
              icon={<FaGift />}
              label="Total Opportunities"
              value={kpi.totalOpportunities}
              desc="All time"
              color={theme.primary}
            />
            <KpiCard
              icon={<FaGift />}
              label="Active Opportunities"
              value={kpi.activeOpportunities}
              desc="Live now"
              color={theme.success}
            />
            <KpiCard
              icon={<FaGift />}
              label="Pending Approval"
              value={kpi.pendingOpportunities}
              desc="Needs review"
              color={theme.error}
            />
            <KpiCard
              icon={<FaUsers />}
              label="Total Users"
              value={kpi.totalUsers}
              desc="All time"
              color={theme.info}
            />
            <KpiCard
              icon={<FaUsers />}
              label="Active Users"
              value={kpi.activeUsers}
              desc="Daily / Weekly / Monthly"
              color={theme.primaryLight}
            />
            <KpiCard
              icon={<FaBookmark />}
              label="Saved Opportunities"
              value={kpi.savedOpportunities}
              desc="Bookmarks"
              color={theme.accent}
            />
            <KpiCard
              icon={<FaShareAlt />}
              label="Referrals"
              value={kpi.referrals}
              desc="This month"
              color={theme.primaryDark}
            />
            <KpiCard
              icon={<FaDollarSign />}
              label="Revenue"
              value={`$${kpi.revenue}`}
              desc="Sponsored, Affiliate, Premium"
              color={theme.success}
            />
          </div>

          {/* Modern Chart */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="rounded-3xl shadow-2xl p-10 flex flex-col items-center border-0 relative overflow-hidden mt-8"
            style={{ background: theme.surfaceGlass }}
          >
            <h3
              className="text-xl font-bold mb-4 drop-shadow"
              style={{ color: theme.primary }}
            >
              Growth & Revenue Trends
            </h3>
            <div className="h-56 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={chartData}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#5b2be7" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#5b2be7" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient
                      id="colorOpportunities"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#a78bfa" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#b4aee8" fontSize={12} />
                  <YAxis stroke="#b4aee8" fontSize={12} />
                  <CartesianGrid strokeDasharray="3 3" stroke="#ede9fe" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="users"
                    stroke="#5b2be7"
                    fillOpacity={1}
                    fill="url(#colorUsers)"
                  />
                  <Area
                    type="monotone"
                    dataKey="opportunities"
                    stroke="#a78bfa"
                    fillOpacity={1}
                    fill="url(#colorOpportunities)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute right-0 top-0 w-32 h-32 bg-[#5b2be7] opacity-10 rounded-full blur-2xl" />
            <div className="absolute left-0 bottom-0 w-24 h-24 bg-[#a78bfa] opacity-10 rounded-full blur-2xl" />
          </motion.div>
        </div>
      </div>
    </AdminLayout>
  );
}

function KpiCard({ icon, label, value, desc, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7 }}
      className="flex flex-col gap-2 rounded-2xl shadow-xl p-7 backdrop-blur-2xl border-2 relative overflow-hidden"
      style={{
        background: theme.surfaceGlass,
        borderColor: theme.border,
        boxShadow: `0 4px 32px 0 ${color}22`,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-12 h-12 flex items-center justify-center rounded-xl shadow-lg text-2xl"
          style={{ background: color + "22", color }}
        >
          {icon}
        </div>
        <div className="flex flex-col">
          <span
            className="text-2xl font-extrabold drop-shadow"
            style={{ color: theme.text }}
          >
            {value}
          </span>
          <span
            className="text-base font-semibold"
            style={{ color: theme.textLight }}
          >
            {label}
          </span>
        </div>
      </div>
      <span className="text-xs mt-2" style={{ color: theme.textLight }}>
        {desc}
      </span>
      <div className="absolute right-2 bottom-2 w-8 h-8 bg-gradient-to-br from-white/60 to-transparent rounded-full blur-xl opacity-60" />
    </motion.div>
  );
}

function SkeletonCard({ className = "" }) {
  return (
    <div
      className={`bg-white/80 rounded-3xl shadow-xl p-6 ${className} animate-pulse flex items-center gap-4`}
    >
      <div className="w-12 h-12 bg-[#ede9fe] rounded-xl" />
      <div className="flex-1 space-y-3">
        <div className="h-4 bg-[#ede9fe] rounded w-1/2" />
        <div className="h-3 bg-[#ede9fe] rounded w-1/3" />
        <div className="h-3 bg-[#ede9fe] rounded w-1/4" />
      </div>
    </div>
  );
}

function ActivityIcon({ type }) {
  switch (type) {
    case "opportunity_created":
      return <FaGift className="text-[#5b2be7] text-xl" />;
    case "user_signup":
      return <FaUsers className="text-[#a78bfa] text-xl" />;
    case "user_verified":
      return <FaCheckCircle className="text-[#22c55e] text-xl" />;
    case "admin_added":
      return <FaUserShield className="text-[#3b82f6] text-xl" />;
    default:
      return <FaExclamationCircle className="text-[#f59e42] text-xl" />;
  }
}
