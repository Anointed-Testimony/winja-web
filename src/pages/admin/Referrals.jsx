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
} from "react-icons/fa";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  getReferrals,
  createReferral,
  getReferralLeaderboard,
  getBadges,
  checkBadgeEligibility,
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

  useEffect(() => {
    setLoading(true);
    Promise.all([getReferrals(), getReferralLeaderboard(), getBadges()])
      .then(([refRes, lbRes, badgeRes]) => {
        setReferrals(refRes.data.referrals || []);
        setStats(refRes.data.stats || {});
        setLeaderboard(lbRes.data.leaderboard || []);
        setBadges(badgeRes.data.badges || []);
        setEarnedBadges(badgeRes.data.earned_badges || []);
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
            {error && (
              <span className="text-red-500 mt-2 font-semibold">{error}</span>
            )}
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
              className="text-3xl font-bold mb-1"
              style={{ color: theme.primary }}
            >
              {stats.total_referrals ?? 0}
            </span>
            <span className="text-base font-semibold mb-1">
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
              className="text-3xl font-bold mb-1"
              style={{ color: theme.primary }}
            >
              {stats.total_points ?? 0}
            </span>
            <span className="text-base font-semibold mb-1">Total Points</span>
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
              className="text-3xl font-bold mb-1"
              style={{ color: theme.primary }}
            >
              {leaderboard[0]?.name || "-"}
            </span>
            <span className="text-base font-semibold mb-1">Top Referrer</span>
            <span className="text-xs text-gray-500">
              {leaderboard[0]?.referrals_count || 0} referrals
            </span>
          </motion.div>
        </section>

        {/* Leaderboard */}
        <section>
          <h3
            className="text-xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
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
                <span
                  className="font-semibold text-lg"
                  style={{ color: theme.primary }}
                >
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
          <h3
            className="text-xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
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
          <h3
            className="text-xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
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
                <span
                  className="font-semibold text-lg"
                  style={{ color: theme.primary }}
                >
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
      </div>
    </AdminLayout>
  );
}
