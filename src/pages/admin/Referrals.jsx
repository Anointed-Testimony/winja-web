import AdminLayout from "../../layouts/AdminLayout";
import theme from "../../theme";
import {
  FaUserFriends,
  FaGift,
  FaTrophy,
  FaMedal,
  FaShareAlt,
  FaCrown,
  FaPlus,
  FaCheckCircle,
  FaCog,
  FaMoneyBillWave,
  FaChartLine,
  FaCheck,
  FaTimes,
  FaEye,
  FaClock,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  getReferrals,
  createReferral,
  getReferralLeaderboard,
  getBadges,
  checkBadgeEligibility,
  getPointsSettings,
  updatePointsSettings,
  getPointsOverview,
  getWithdrawalRequests,
  getWithdrawalDetails,
  approveWithdrawal,
  rejectWithdrawal,
  getWithdrawalStats,
} from "../../api";

const COLORS = [
  "#5b2be7",
  "#a78bfa",
  "#22c55e",
  "#f59e42",
  "#f43f5e",
  "#fbbf24",
];

function BadgeCard({ badge, earned }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className={`flex flex-col items-center p-4 rounded-2xl shadow-xl border-2 m-2 min-w-[120px] ${
        earned
          ? "bg-gradient-to-br from-[#a78bfa]/80 to-[#5b2be7]/80 border-[#5b2be7]"
          : "bg-white/80 border-gray-200"
      }`}
    >
      <span className="text-4xl mb-2 drop-shadow-lg">
        <img
          src={badge.icon}
          alt={badge.name}
          className="w-10 h-10"
          onError={(e) => (e.target.style.display = "none")}
        />
        {!badge.icon && <FaMedal />}
      </span>
      <span className="font-bold text-lg mb-1" style={{ color: theme.primary }}>
        {badge.name}
      </span>
      <span className="text-xs text-gray-700 text-center mb-1">
        {badge.description}
      </span>
      {earned && (
        <span className="text-green-500 flex items-center gap-1 text-xs font-bold">
          <FaCheckCircle /> Earned
        </span>
      )}
    </motion.div>
  );
}

export default function Referrals() {
  const [referrals, setReferrals] = useState([]);
  const [stats, setStats] = useState({});
  const [leaderboard, setLeaderboard] = useState([]);
  const [badges, setBadges] = useState([]);
  const [earnedBadges, setEarnedBadges] = useState([]);
  const [invite, setInvite] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Points Settings State
  const [pointsSettings, setPointsSettings] = useState({
    signup_points: 100,
    referral_points: 50,
    point_value_in_naira: 1.00,
    minimum_withdrawal: 10.00,
    maximum_withdrawal: 1000.00,
    daily_withdrawal_limit: 100.00,
    is_active: true,
  });
  const [pointsOverview, setPointsOverview] = useState({});
  const [showPointsSettings, setShowPointsSettings] = useState(false);
  const [updatingSettings, setUpdatingSettings] = useState(false);

  // Withdrawal Management State
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [withdrawalStats, setWithdrawalStats] = useState({});
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [processingWithdrawal, setProcessingWithdrawal] = useState(false);
  const [withdrawalFilters, setWithdrawalFilters] = useState({
    status: 'all',
    payment_method: 'all',
  });

  // Active Tab State
  const [activeTab, setActiveTab] = useState('referrals'); // referrals, points, withdrawals

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getReferrals(), 
      getReferralLeaderboard(), 
      getBadges(),
      getPointsSettings(),
      getPointsOverview(),
      getWithdrawalRequests(),
      getWithdrawalStats(),
    ])
      .then(([refRes, lbRes, badgeRes, pointsSettingsRes, pointsOverviewRes, withdrawalsRes, withdrawalStatsRes]) => {
        setReferrals(refRes.data.referrals || []);
        setStats(refRes.data.stats || {});
        setLeaderboard(lbRes.data.leaderboard || []);
        setBadges(badgeRes.data.badges || []);
        setEarnedBadges(badgeRes.data.earned_badges || []);
        
        // Points data
        setPointsSettings(pointsSettingsRes.data || pointsSettings);
        setPointsOverview(pointsOverviewRes.data || {});
        
        // Withdrawal data
        setWithdrawalRequests(withdrawalsRes.data.data || []);
        setWithdrawalStats(withdrawalStatsRes.data || {});
      })
      .catch(err => {
        console.error('Error loading data:', err);
        setError('Failed to load data');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleInvite = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      await createReferral(invite);
      setInvite({ name: "", email: "" });
      // Refresh referrals and stats
      const refRes = await getReferrals();
      setReferrals(refRes.data.referrals || []);
      setStats(refRes.data.stats || {});
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to invite");
    }
    setSubmitting(false);
  };

  // Points Settings Handlers
  const handleUpdatePointsSettings = async (e) => {
    e.preventDefault();
    setUpdatingSettings(true);
    setError("");
    try {
      await updatePointsSettings(pointsSettings);
      setShowPointsSettings(false);
      // Refresh points overview
      const overviewRes = await getPointsOverview();
      setPointsOverview(overviewRes.data || {});
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to update settings");
    }
    setUpdatingSettings(false);
  };

  // Withdrawal Management Handlers
  const handleViewWithdrawal = async (id) => {
    try {
      const response = await getWithdrawalDetails(id);
      setSelectedWithdrawal(response.data);
      setShowWithdrawalModal(true);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load withdrawal details");
    }
  };

  const handleApproveWithdrawal = async (id, notes = '') => {
    setProcessingWithdrawal(true);
    setError("");
    try {
      await approveWithdrawal(id, { admin_notes: notes });
      setShowWithdrawalModal(false);
      // Refresh withdrawal data
      const [withdrawalsRes, statsRes] = await Promise.all([
        getWithdrawalRequests(withdrawalFilters),
        getWithdrawalStats(),
      ]);
      setWithdrawalRequests(withdrawalsRes.data.data || []);
      setWithdrawalStats(statsRes.data || {});
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to approve withdrawal");
    }
    setProcessingWithdrawal(false);
  };

  const handleRejectWithdrawal = async (id, notes = '') => {
    setProcessingWithdrawal(true);
    setError("");
    try {
      await rejectWithdrawal(id, { admin_notes: notes });
      setShowWithdrawalModal(false);
      // Refresh withdrawal data
      const [withdrawalsRes, statsRes] = await Promise.all([
        getWithdrawalRequests(withdrawalFilters),
        getWithdrawalStats(),
      ]);
      setWithdrawalRequests(withdrawalsRes.data.data || []);
      setWithdrawalStats(statsRes.data || {});
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to reject withdrawal");
    }
    setProcessingWithdrawal(false);
  };

  const handleFilterWithdrawals = async () => {
    try {
      const response = await getWithdrawalRequests(withdrawalFilters);
      setWithdrawalRequests(response.data.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to filter withdrawals");
    }
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

  return (
    <AdminLayout>
      <div className="flex flex-col gap-12">
        {/* Tab Navigation */}
        <div className="flex gap-4 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('referrals')}
            className={`px-6 py-3 font-semibold rounded-t-lg transition ${
              activeTab === 'referrals'
                ? 'bg-[#5b2be7] text-white'
                : 'text-gray-600 hover:text-[#5b2be7]'
            }`}
          >
            <FaUserFriends className="inline mr-2" />
            Referrals & Rewards
          </button>
          <button
            onClick={() => setActiveTab('points')}
            className={`px-6 py-3 font-semibold rounded-t-lg transition ${
              activeTab === 'points'
                ? 'bg-[#5b2be7] text-white'
                : 'text-gray-600 hover:text-[#5b2be7]'
            }`}
          >
            <FaCog className="inline mr-2" />
            Points Settings
          </button>
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-6 py-3 font-semibold rounded-t-lg transition ${
              activeTab === 'withdrawals'
                ? 'bg-[#5b2be7] text-white'
                : 'text-gray-600 hover:text-[#5b2be7]'
            }`}
          >
            <FaMoneyBillWave className="inline mr-2" />
            Withdrawals
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Referrals & Rewards Tab */}
        {activeTab === 'referrals' && (
          <>
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="rounded-3xl overflow-hidden shadow-2xl border-0 p-8 flex flex-col md:flex-row justify-between items-center min-h-[200px] relative bg-gradient-to-tr from-[#a78bfa] via-[#5b2be7] to-[#f8fafc]"
        >
          <div className="flex-1 flex flex-col justify-between">
            <h2 className="text-3xl font-extrabold mb-2 drop-shadow-lg text-white">
              Invite Friends & Earn Rewards!
            </h2>
            <p className="text-white/90 text-base font-medium mb-6 drop-shadow">
              Share your unique referral link, climb the leaderboard, and unlock
              exclusive badges and rewards. The more you share, the more you
              earn!
            </p>
            <form
              className="flex flex-col md:flex-row gap-4"
              onSubmit={handleInvite}
            >
              <input
                type="text"
                placeholder="Friend's Name"
                className="rounded-xl px-4 py-3 text-base shadow focus:outline-none"
                style={{ background: theme.surface, color: theme.primary }}
                value={invite.name}
                onChange={(e) => setInvite({ ...invite, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Friend's Email"
                className="rounded-xl px-4 py-3 text-base shadow focus:outline-none"
                style={{ background: theme.surface, color: theme.primary }}
                value={invite.email}
                onChange={(e) =>
                  setInvite({ ...invite, email: e.target.value })
                }
                required
              />
              <button
                type="submit"
                className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold shadow-lg bg-[#22c55e] text-white hover:bg-[#5b2be7] transition"
                disabled={submitting}
              >
                <FaPlus /> Invite
              </button>
            </form>
          </div>
          <motion.div
            initial={{ scale: 0.8, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex-1 flex justify-center items-center"
          >
            <FaGift className="text-[120px] text-[#fbbf24] drop-shadow-2xl animate-bounce" />
          </motion.div>
        </motion.div>

        {/* Stats & Progress */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="rounded-3xl shadow-xl p-8 flex flex-col items-center bg-gradient-to-br from-[#ede9fe] to-[#a78bfa]/60 border-0"
          >
            <FaUserFriends className="text-4xl mb-2 text-[#5b2be7] animate-pulse" />
            <span
                  className="text-3xl font-bold mb-1 text-[#5b2be7]"
            >
              {stats.total_referrals ?? 0}
            </span>
                <span className="text-base font-semibold mb-1 text-gray-800">
              Total Referrals
            </span>
            <span className="text-xs text-gray-500">
              Completed: {stats.completed_referrals ?? 0}
            </span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="rounded-3xl shadow-xl p-8 flex flex-col items-center bg-gradient-to-br from-[#fbbf24]/30 to-[#5b2be7]/10 border-0"
          >
            <FaTrophy className="text-4xl mb-2 text-[#fbbf24] animate-bounce" />
            <span
                  className="text-3xl font-bold mb-1 text-[#5b2be7]"
            >
              {stats.total_points ?? 0}
            </span>
                <span className="text-base font-semibold mb-1 text-gray-800">Total Points</span>
            <span className="text-xs text-gray-500">Earn badges for more!</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="rounded-3xl shadow-xl p-8 flex flex-col items-center bg-gradient-to-br from-[#22c55e]/20 to-[#5b2be7]/10 border-0"
          >
            <FaCrown className="text-4xl mb-2 text-[#22c55e] animate-pulse" />
            <span
                  className="text-3xl font-bold mb-1 text-[#5b2be7]"
            >
              {leaderboard[0]?.name || "-"}
            </span>
                <span className="text-base font-semibold mb-1 text-gray-800">Top Referrer</span>
            <span className="text-xs text-gray-500">
              {leaderboard[0]?.referrals_count || 0} referrals
            </span>
          </motion.div>
        </section>

        {/* Leaderboard */}
        <section>
              <h3 className="text-xl font-bold mb-4 text-[#5b2be7]">
            Leaderboard
          </h3>
          <div className="rounded-3xl shadow-xl p-6 bg-white/80 flex flex-col gap-2">
            {leaderboard.map((user, idx) => (
              <motion.div
                key={user.id}
                initial={{ x: 40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.07 }}
                className={`flex items-center gap-4 p-3 rounded-xl ${
                  idx === 0
                    ? "bg-gradient-to-r from-[#fbbf24]/40 to-[#5b2be7]/10"
                    : ""
                }`}
              >
                <span
                  className="text-2xl font-bold"
                  style={{ color: COLORS[idx % COLORS.length] }}
                >
                  #{idx + 1}
                </span>
                <FaUserFriends
                  className="text-xl"
                  style={{ color: COLORS[idx % COLORS.length] }}
                />
                    <span className="font-semibold text-lg text-[#5b2be7]">
                  {user.name}
                </span>
                <span className="ml-auto font-bold text-[#5b2be7]">
                  {user.referrals_count} referrals
                </span>
                <span className="ml-4 font-bold text-[#22c55e]">
                  {user.total_points} pts
                </span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Earned Badges */}
        <section>
              <h3 className="text-xl font-bold mb-4 text-[#5b2be7]">
            Your Badges
          </h3>
          <div className="flex flex-wrap gap-4">
            {badges.map((badge) => (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={!!earnedBadges.find((b) => b.id === badge.id)}
              />
            ))}
          </div>
        </section>

        {/* Referral History */}
        <section>
              <h3 className="text-xl font-bold mb-4 text-[#5b2be7]">
            Referral History
          </h3>
          <div className="rounded-3xl shadow-xl p-6 bg-white/80 flex flex-col gap-2">
            {referrals.length === 0 && (
              <span className="text-gray-500">
                No referrals yet. Start inviting!
              </span>
            )}
            {referrals.map((ref, idx) => (
              <motion.div
                key={ref.id}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-center gap-4 p-3 rounded-xl hover:bg-[#a78bfa]/10 transition"
              >
                <FaShareAlt className="text-xl text-[#5b2be7]" />
                    <span className="font-semibold text-lg text-[#5b2be7]">
                  {ref.referred?.name || ref.referred_id}
                </span>
                <span
                  className="ml-auto text-xs font-bold px-3 py-1 rounded-full"
                  style={{
                    background:
                      ref.status === "completed" ? "#22c55e22" : "#fbbf2422",
                    color: ref.status === "completed" ? "#22c55e" : "#fbbf24",
                  }}
                >
                  {ref.status}
                </span>
                {ref.status === "completed" && (
                  <FaCheckCircle className="text-green-500 ml-2" />
                )}
              </motion.div>
            ))}
          </div>
        </section>
          </>
        )}

        {/* Points Settings Tab */}
        {activeTab === 'points' && (
          <div className="space-y-8">
            {/* Points Analytics */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Users with Points</p>
                    <p className="text-2xl font-bold text-[#5b2be7]">
                      {pointsOverview.total_users_with_points || 0}
                    </p>
                  </div>
                  <FaUserFriends className="text-3xl text-[#5b2be7]" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Points Awarded</p>
                    <p className="text-2xl font-bold text-green-600">
                      {pointsOverview.total_points_awarded || 0}
                    </p>
                  </div>
                  <FaGift className="text-3xl text-green-600" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Points Redeemed</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {pointsOverview.total_points_redeemed || 0}
                    </p>
                  </div>
                  <FaMoneyBillWave className="text-3xl text-orange-600" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Current Balance</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {pointsOverview.total_points_balance || 0}
                    </p>
                  </div>
                  <FaChartLine className="text-3xl text-purple-600" />
                </div>
              </motion.div>
            </section>

            {/* Points Settings Form */}
            <section className="bg-white rounded-2xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#5b2be7]">Points Settings</h3>
                <button
                  onClick={() => setShowPointsSettings(!showPointsSettings)}
                  className="bg-[#5b2be7] text-white px-4 py-2 rounded-lg hover:bg-[#4c1d95] transition"
                >
                  {showPointsSettings ? 'Cancel' : 'Edit Settings'}
                </button>
              </div>
              
              {showPointsSettings ? (
                <form onSubmit={handleUpdatePointsSettings} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Signup Points
                      </label>
                      <input
                        type="number"
                        value={pointsSettings.signup_points}
                        onChange={(e) => setPointsSettings({
                          ...pointsSettings,
                          signup_points: parseInt(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b2be7] focus:border-transparent text-gray-900"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Referral Points
                      </label>
                      <input
                        type="number"
                        value={pointsSettings.referral_points}
                        onChange={(e) => setPointsSettings({
                          ...pointsSettings,
                          referral_points: parseInt(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b2be7] focus:border-transparent text-gray-900"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Point Value in Naira (₦)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pointsSettings.point_value_in_naira}
                        onChange={(e) => setPointsSettings({
                          ...pointsSettings,
                          point_value_in_naira: parseFloat(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b2be7] focus:border-transparent text-gray-900"
                        min="0"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Minimum Withdrawal (₦)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={pointsSettings.minimum_withdrawal}
                        onChange={(e) => setPointsSettings({
                          ...pointsSettings,
                          minimum_withdrawal: parseFloat(e.target.value)
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b2be7] focus:border-transparent text-gray-900"
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-4">
                    <button
                      type="submit"
                      disabled={updatingSettings}
                      className="bg-[#5b2be7] text-white px-6 py-2 rounded-lg hover:bg-[#4c1d95] transition disabled:opacity-50"
                    >
                      {updatingSettings ? 'Updating...' : 'Save Settings'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowPointsSettings(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-gray-600">Signup Points</p>
                    <p className="text-lg font-semibold text-gray-900">{pointsSettings.signup_points}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Referral Points</p>
                    <p className="text-lg font-semibold text-gray-900">{pointsSettings.referral_points}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Point Value in Naira</p>
                    <p className="text-lg font-semibold text-gray-900">₦{pointsSettings.point_value_in_naira}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Minimum Withdrawal</p>
                    <p className="text-lg font-semibold text-gray-900">₦{pointsSettings.minimum_withdrawal}</p>
                  </div>
                </div>
              )}
            </section>
          </div>
        )}

        {/* Withdrawals Tab */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-8">
            {/* Withdrawal Stats */}
            <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Pending</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {withdrawalStats.total_pending || 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      ₦{(withdrawalStats.total_amount_pending || 0).toFixed(2)}
                    </p>
                  </div>
                  <FaClock className="text-3xl text-orange-600" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Approved</p>
                    <p className="text-2xl font-bold text-green-600">
                      {withdrawalStats.total_approved || 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      ₦{(withdrawalStats.total_amount_approved || 0).toFixed(2)}
                    </p>
                  </div>
                  <FaCheck className="text-3xl text-green-600" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Rejected</p>
                    <p className="text-2xl font-bold text-red-600">
                      {withdrawalStats.total_rejected || 0}
                    </p>
                    <p className="text-sm text-gray-500">
                      ₦{(withdrawalStats.total_amount_rejected || 0).toFixed(2)}
                    </p>
                  </div>
                  <FaTimes className="text-3xl text-red-600" />
                </div>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl p-6 shadow-lg"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Points</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {withdrawalStats.total_points_pending || 0}
                    </p>
                    <p className="text-sm text-gray-500">Pending</p>
                  </div>
                  <FaTrophy className="text-3xl text-purple-600" />
                </div>
              </motion.div>
            </section>

            {/* Withdrawal Filters */}
            <section className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4 text-[#5b2be7]">Withdrawal Requests</h3>
              
              <div className="flex gap-4 mb-6">
                <select
                  value={withdrawalFilters.status}
                  onChange={(e) => setWithdrawalFilters({
                    ...withdrawalFilters,
                    status: e.target.value
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b2be7] focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                
                <select
                  value={withdrawalFilters.payment_method}
                  onChange={(e) => setWithdrawalFilters({
                    ...withdrawalFilters,
                    payment_method: e.target.value
                  })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5b2be7] focus:border-transparent text-gray-900 bg-white"
                >
                  <option value="all">All Methods</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="paypal">PayPal</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
                
                <button
                  onClick={handleFilterWithdrawals}
                  className="bg-[#5b2be7] text-white px-4 py-2 rounded-lg hover:bg-[#4c1d95] transition"
                >
                  Filter
                </button>
              </div>

              {/* Withdrawal Requests List */}
              <div className="space-y-4">
                {withdrawalRequests.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No withdrawal requests found</p>
                ) : (
                  withdrawalRequests.map((withdrawal) => (
                    <motion.div
                      key={withdrawal.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                    >
                      <div className="flex items-center gap-4">
                        <div>
                          <p className="font-semibold text-lg text-gray-900">
                            ₦{parseFloat(withdrawal.amount).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {withdrawal.user?.name || 'Unknown User'}
                          </p>
                          <p className="text-xs text-gray-500">
                            {withdrawal.payment_method.replace('_', ' ').toUpperCase()} • {withdrawal.created_at}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          withdrawal.status === 'pending' 
                            ? 'bg-orange-100 text-orange-800'
                            : withdrawal.status === 'approved'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {withdrawal.status.toUpperCase()}
                        </span>
                        
                        <button
                          onClick={() => handleViewWithdrawal(withdrawal.id)}
                          className="bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
                        >
                          <FaEye />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* Withdrawal Details Modal */}
        {showWithdrawalModal && selectedWithdrawal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-[#5b2be7]">Withdrawal Details</h3>
                <button
                  onClick={() => setShowWithdrawalModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FaTimes />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Amount</p>
                    <p className="text-xl font-bold text-gray-900">₦{parseFloat(selectedWithdrawal.amount).toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Points Used</p>
                    <p className="text-xl font-bold text-gray-900">{selectedWithdrawal.points_used}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Payment Method</p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedWithdrawal.payment_method.replace('_', ' ').toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      selectedWithdrawal.status === 'pending' 
                        ? 'bg-orange-100 text-orange-800'
                        : selectedWithdrawal.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {selectedWithdrawal.status.toUpperCase()}
                    </span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">User Details</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900"><strong>Name:</strong> {selectedWithdrawal.user?.name}</p>
                    <p className="text-gray-900"><strong>Email:</strong> {selectedWithdrawal.user?.email}</p>
                    <p className="text-gray-900"><strong>Phone:</strong> {selectedWithdrawal.user?.phone || 'N/A'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Payment Details</p>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {Object.entries(selectedWithdrawal.payment_details || {}).map(([key, value]) => (
                      <p key={key} className="text-gray-900">
                        <strong>{key.replace('_', ' ').toUpperCase()}:</strong> {value}
                      </p>
                    ))}
                  </div>
                </div>
                
                {selectedWithdrawal.admin_notes && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Admin Notes</p>
                    <p className="bg-yellow-50 p-4 rounded-lg text-gray-900">{selectedWithdrawal.admin_notes}</p>
                  </div>
                )}
                
                {selectedWithdrawal.status === 'pending' && (
                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => handleApproveWithdrawal(selectedWithdrawal.id)}
                      disabled={processingWithdrawal}
                      className="flex-1 bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition disabled:opacity-50"
                    >
                      {processingWithdrawal ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleRejectWithdrawal(selectedWithdrawal.id)}
                      disabled={processingWithdrawal}
                      className="flex-1 bg-red-500 text-white py-3 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                    >
                      {processingWithdrawal ? 'Processing...' : 'Reject'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
