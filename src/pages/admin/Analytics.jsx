import AdminLayout from "../../layouts/AdminLayout";
import theme from "../../theme";
import {
  FaEye,
  FaBookmark,
  FaMousePointer,
  FaClipboardList,
  FaUsers,
  FaShareAlt,
  FaBell,
  FaDollarSign,
  FaChartLine,
  FaMapMarkerAlt,
  FaFileCsv,
  FaFilePdf,
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
  BarChart,
  Bar,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useState, useEffect } from "react";
import {
  getOpportunityAnalytics,
  getUserEngagementAnalytics,
  getRevenueAnalytics,
  getTrendsAnalytics,
  exportOpportunityAnalyticsCsv,
  exportOpportunityAnalyticsPdf,
} from "../../api";

const COLORS = ["#5b2be7", "#a78bfa", "#22c55e", "#f59e42"];

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

export default function Analytics() {
  const [loading, setLoading] = useState(true);
  const [opportunity, setOpportunity] = useState(null);
  const [userEngagement, setUserEngagement] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const [trends, setTrends] = useState(null);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getOpportunityAnalytics(),
      getUserEngagementAnalytics(),
      getRevenueAnalytics(),
      getTrendsAnalytics(),
    ])
      .then(([oppRes, userRes, revRes, trendRes]) => {
        setOpportunity(oppRes.data);
        setUserEngagement(userRes.data);
        setRevenue(revRes.data);
        setTrends(trendRes.data);
      })
      .finally(() => setLoading(false));
  }, []);

  // Export handlers
  const handleExport = async (type) => {
    setExporting(true);
    try {
      if (type === "csv") {
        const res = await exportOpportunityAnalyticsCsv();
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "opportunity_analytics.csv");
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else if (type === "pdf") {
        const res = await exportOpportunityAnalyticsPdf();
        // Placeholder: handle PDF download if implemented
        alert("PDF export not implemented yet.");
      }
    } catch (e) {
      alert("Export failed");
    }
    setExporting(false);
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col gap-12">
          <div className="h-32 bg-white/60 rounded-3xl animate-pulse" />
          <div className="h-32 bg-white/60 rounded-3xl animate-pulse" />
          <div className="h-32 bg-white/60 rounded-3xl animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  // Fallbacks for empty data
  const oppData = opportunity?.opportunities || [];
  const userData = userEngagement || {
    active_users: 0,
    referrals: 0,
    notifications_opened: 0,
  };
  const revenueData = revenue || {
    sponsored: 0,
    affiliate: 0,
    premium: 0,
    total: 0,
  };
  const trendData = trends || { categories: [], locations: [], seasonal: [] };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-12">
        {/* Opportunity Performance */}
        <section>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
            Opportunity Performance
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            <KpiCard
              icon={<FaEye />}
              label="Views"
              value={opportunity?.total_views ?? 0}
              desc="All listings"
              color={theme.primary}
            />
            <KpiCard
              icon={<FaBookmark />}
              label="Saves"
              value={opportunity?.total_saves ?? 0}
              desc="All listings"
              color={theme.accent}
            />
            <KpiCard
              icon={<FaMousePointer />}
              label="Clicks"
              value={opportunity?.total_clicks ?? 0}
              desc="All listings"
              color={theme.info}
            />
            <KpiCard
              icon={<FaClipboardList />}
              label="Applications"
              value={opportunity?.total_applications ?? 0}
              desc="All listings"
              color={theme.success}
            />
          </div>
          <div className="rounded-3xl shadow-xl p-8 bg-white/80 mb-8">
            <h4
              className="font-semibold mb-4"
              style={{ color: theme.primaryLight }}
            >
              Per Opportunity
            </h4>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={oppData.map((o) => ({
                  name: o.title,
                  views: o.view_count,
                  saves: o.save_count,
                  clicks: o.click_count,
                  applications: o.application_count,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="views" fill="#5b2be7" />
                <Bar dataKey="saves" fill="#a78bfa" />
                <Bar dataKey="clicks" fill="#22c55e" />
                <Bar dataKey="applications" fill="#f59e42" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* User Engagement */}
        <section>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
            User Engagement
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <KpiCard
              icon={<FaUsers />}
              label="Active Users"
              value={userData.active_users}
              desc="This month"
              color={theme.primaryLight}
            />
            <KpiCard
              icon={<FaShareAlt />}
              label="Referrals"
              value={userData.referrals}
              desc="This month"
              color={theme.primaryDark}
            />
            <KpiCard
              icon={<FaBell />}
              label="Notifications Opened"
              value={userData.notifications_opened}
              desc="All time"
              color={theme.info}
            />
          </div>
        </section>

        {/* Revenue Reports */}
        <section>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
            Revenue Reports
          </h2>
          <div className="flex flex-col md:flex-row gap-8">
            <div className="flex-1 rounded-3xl shadow-xl p-8 bg-white/80">
              <h4
                className="font-semibold mb-4"
                style={{ color: theme.success }}
              >
                By Stream
              </h4>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Sponsored", value: revenueData.sponsored },
                      { name: "Affiliate", value: revenueData.affiliate },
                      { name: "Premium", value: revenueData.premium },
                    ]}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {[
                      { name: "Sponsored", value: revenueData.sponsored },
                      { name: "Affiliate", value: revenueData.affiliate },
                      { name: "Premium", value: revenueData.premium },
                    ].map((entry, idx) => (
                      <Cell
                        key={`cell-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex-1 rounded-3xl shadow-xl p-8 bg-white/80 flex flex-col justify-center items-center">
              <FaDollarSign
                className="text-5xl mb-4"
                style={{ color: theme.success }}
              />
              <span className="text-3xl font-bold mb-2">
                ${revenueData.total}
              </span>
              <span className="text-lg text-gray-500">Total Revenue</span>
            </div>
          </div>
        </section>

        {/* Trend Analysis */}
        <section>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
            Trend Analysis
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-3xl shadow-xl p-8 bg-white/80">
              <h4
                className="font-semibold mb-4"
                style={{ color: theme.primary }}
              >
                Popular Categories
              </h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={trendData.categories}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {trendData.categories.map((entry, idx) => (
                      <Cell
                        key={`cat-cell-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="rounded-3xl shadow-xl p-8 bg-white/80">
              <h4
                className="font-semibold mb-4"
                style={{ color: theme.primary }}
              >
                Top Locations
              </h4>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={trendData.locations}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={70}
                    label
                  >
                    {trendData.locations.map((entry, idx) => (
                      <Cell
                        key={`loc-cell-${idx}`}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* Exportable Reports */}
        <section>
          <h2
            className="text-2xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
            Exportable Reports
          </h2>
          <div className="flex gap-6">
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg bg-[#5b2be7] text-white hover:bg-[#a78bfa] transition"
              onClick={() => handleExport("csv")}
              disabled={exporting}
            >
              <FaFileCsv /> Export CSV
            </button>
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg bg-[#22c55e] text-white hover:bg-[#a78bfa] transition"
              onClick={() => handleExport("pdf")}
              disabled={exporting}
            >
              <FaFilePdf /> Export PDF
            </button>
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}
