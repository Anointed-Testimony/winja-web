import AdminLayout from "../../layouts/AdminLayout";
import theme from "../../theme";
import {
  FaFlag,
  FaUserShield,
  FaTrashAlt,
  FaBan,
  FaExclamationTriangle,
  FaCheck,
  FaCommentDots,
  FaRobot,
  FaUserTimes,
  FaUser,
  FaListAlt,
  FaEye,
  FaHistory,
  FaUserFriends,
  FaChartLine,
  FaClock,
  FaCalendarAlt,
  FaLink,
  FaImage,
  FaFileAlt,
  FaTimes,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import {
  getModerationReports,
  getModerationReportDetails,
  takeModerationAction,
  getModerationStats,
  getAutoFlaggedContent,
  getUserModerationHistory,
} from "../../api";

const mockReportedListings = [
  {
    id: 1,
    title: "Fake Scholarship Opportunity",
    reporter: "Jane Doe",
    reason: "Scam / Fraudulent",
    date: "2024-06-01",
    status: "pending",
  },
  {
    id: 2,
    title: "Offensive Job Posting",
    reporter: "John Smith",
    reason: "Offensive Content",
    date: "2024-06-02",
    status: "pending",
  },
];
const mockReportedUsers = [
  {
    id: 1,
    name: "TrollUser99",
    reporter: "Alice",
    reason: "Harassment",
    date: "2024-06-01",
    status: "pending",
  },
  {
    id: 2,
    name: "SpamBot",
    reporter: "Bob",
    reason: "Spam",
    date: "2024-06-02",
    status: "pending",
  },
];
const mockAutoFlagged = [
  {
    id: 1,
    title: "Suspicious Grant Listing",
    flaggedBy: "AI System",
    reason: "Unusual activity detected",
    date: "2024-06-03",
    status: "pending",
  },
];
const mockFeedback = [
  {
    id: 1,
    user: "Grace",
    message: "The reporting system is easy to use!",
    date: "2024-06-01",
  },
  {
    id: 2,
    user: "Sam",
    message: "Please add more moderation options.",
    date: "2024-06-02",
  },
];

function DetailModal({ isOpen, onClose, data, type }) {
  if (!isOpen) return null;

  const renderContent = () => {
    switch (type) {
      case "listing":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FaListAlt className="text-2xl text-purple-500" />
              <h3 className="text-xl font-bold text-gray-800">{data.title}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-700 mb-2">
                  Report Details
                </h4>
                <p className="text-gray-600">Reason: {data.reason}</p>
                <p className="text-gray-600">Reported by: {data.reporter}</p>
                <p className="text-gray-600">Date: {data.date}</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-700 mb-2">
                  Listing Stats
                </h4>
                <p className="text-gray-600">Views: 1,234</p>
                <p className="text-gray-600">Applications: 56</p>
                <p className="text-gray-600">Created: 2024-05-15</p>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-700 mb-2">
                Content Preview
              </h4>
              <p className="text-gray-600">
                This is a preview of the reported content...
              </p>
            </div>
          </div>
        );
      case "user":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FaUser className="text-2xl text-purple-500" />
              <h3 className="text-xl font-bold text-gray-800">{data.name}</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-700 mb-2">
                  User Details
                </h4>
                <p className="text-gray-600">Member since: 2024-01-15</p>
                <p className="text-gray-600">Reports: 3</p>
                <p className="text-gray-600">Status: Active</p>
              </div>
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-700 mb-2">Activity</h4>
                <p className="text-gray-600">Listings: 12</p>
                <p className="text-gray-600">Applications: 45</p>
                <p className="text-gray-600">Last active: Today</p>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg">
              <h4 className="font-semibold text-red-700 mb-2">
                Report History
              </h4>
              <div className="space-y-2">
                <p className="text-gray-600">
                  • Reported for harassment (2024-06-01)
                </p>
                <p className="text-gray-600">
                  • Reported for spam (2024-05-15)
                </p>
              </div>
            </div>
          </div>
        );
      case "feedback":
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FaCommentDots className="text-2xl text-purple-500" />
              <h3 className="text-xl font-bold text-gray-800">
                Feedback from {data.user}
              </h3>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h4 className="font-semibold text-purple-700 mb-2">Message</h4>
              <p className="text-gray-600 italic">"{data.message}"</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-amber-50 p-4 rounded-lg">
                <h4 className="font-semibold text-amber-700 mb-2">User Info</h4>
                <p className="text-gray-600">Member since: 2024-03-01</p>
                <p className="text-gray-600">Feedback count: 5</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-700 mb-2">Response</h4>
                <textarea
                  className="w-full p-2 rounded border border-gray-200"
                  placeholder="Type your response..."
                  rows="3"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-purple-700">
              {type === "listing"
                ? "Listing Details"
                : type === "user"
                ? "User Profile"
                : "Feedback Details"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="text-xl" />
            </button>
          </div>
          {renderContent()}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function ModerationActionButtons({
  onWarn,
  onRemove,
  onBan,
  status,
  onViewDetails,
}) {
  return (
    <div className="flex gap-2">
      <button
        className="px-3 py-1 rounded-lg bg-blue-50 text-blue-600 font-medium hover:bg-blue-100 transition flex items-center gap-1 text-sm"
        onClick={onViewDetails}
      >
        <FaEye className="text-xs" /> View
      </button>
      <button
        className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1 text-sm ${
          status !== "pending"
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-amber-50 text-amber-700 hover:bg-amber-100"
        }`}
        onClick={onWarn}
        disabled={status !== "pending"}
      >
        <FaExclamationTriangle className="text-xs" /> Warn
      </button>
      <button
        className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1 text-sm ${
          status !== "pending"
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-red-50 text-red-600 hover:bg-red-100"
        }`}
        onClick={onRemove}
        disabled={status !== "pending"}
      >
        <FaTrashAlt className="text-xs" /> Remove
      </button>
      <button
        className={`px-3 py-1 rounded-lg font-medium transition flex items-center gap-1 text-sm ${
          status !== "pending"
            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
            : "bg-purple-50 text-purple-600 hover:bg-purple-100"
        }`}
        onClick={onBan}
        disabled={status !== "pending"}
      >
        <FaBan className="text-xs" /> Ban
      </button>
    </div>
  );
}

export default function Moderation() {
  const [reportedListings, setReportedListings] = useState([]);
  const [reportedUsers, setReportedUsers] = useState([]);
  const [autoFlagged, setAutoFlagged] = useState([]);
  const [feedback, setFeedback] = useState(mockFeedback);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ listings: 0, users: 0, auto: 0 });

  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      getModerationReports(),
      getAutoFlaggedContent(),
      getModerationStats(),
    ])
      .then(([reportsRes, autoFlaggedRes, statsRes]) => {
        // Separate listings and users
        const listings = reportsRes.data.reports.data.filter(
          (r) => r.reportable_type && r.reportable_type.includes("Opportunity")
        );
        const users = reportsRes.data.reports.data.filter(
          (r) => r.reportable_type && r.reportable_type.includes("User")
        );
        setReportedListings(listings);
        setReportedUsers(users);
        setAutoFlagged(autoFlaggedRes.data.data || []);
        setStats({
          listings: listings.length,
          users: users.length,
          auto: (autoFlaggedRes.data.data || []).length,
        });
      })
      .catch((err) => setError("Failed to load moderation data."))
      .finally(() => setLoading(false));
  }, []);

  // Action handler
  const handleAction = async (type, id, actionType) => {
    try {
      setLoading(true);
      await takeModerationAction(id, {
        action_type: actionType,
        reason: `Admin ${actionType}`,
      });
      // Refresh reports after action
      const reportsRes = await getModerationReports();
      const listings = reportsRes.data.reports.data.filter(
        (r) => r.reportable_type && r.reportable_type.includes("Opportunity")
      );
      const users = reportsRes.data.reports.data.filter(
        (r) => r.reportable_type && r.reportable_type.includes("User")
      );
      setReportedListings(listings);
      setReportedUsers(users);
    } catch (err) {
      setError("Failed to take action.");
    } finally {
      setLoading(false);
    }
  };

  // View details handler
  const handleViewDetails = async (item, type) => {
    setLoading(true);
    setError(null);
    try {
      if (type === "listing" || type === "user") {
        const res = await getModerationReportDetails(item.id);
        setSelectedItem(res.data);
      } else {
        setSelectedItem(item);
      }
      setModalType(type);
    } catch (err) {
      setError("Failed to load details.");
    } finally {
      setLoading(false);
    }
  };

  // Subtle fade-in for sections
  const sectionAnim = {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4 },
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-10">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="rounded-2xl shadow-lg p-8 flex flex-col md:flex-row justify-between items-center min-h-[120px] bg-gradient-to-r from-purple-500 via-purple-400 to-purple-300"
        >
          <div className="flex-1 flex flex-col justify-between">
            <h2 className="text-2xl font-bold mb-2 text-white">
              Content & Community Moderation
            </h2>
            <p className="text-white/90 text-base font-medium mb-2">
              Review reports, auto-flagged content, and feedback. Take action to
              keep the community safe and positive.
            </p>
          </div>
          <div className="flex-1 flex justify-end items-center">
            <FaUserShield className="text-[60px] text-white/80" />
          </div>
        </motion.div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white"
          >
            <div className="flex items-center gap-3">
              <FaFlag className="text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">Reported Listings</h3>
                <p className="text-2xl font-bold">{reportedListings.length}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white"
          >
            <div className="flex items-center gap-3">
              <FaUserTimes className="text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">Reported Users</h3>
                <p className="text-2xl font-bold">{reportedUsers.length}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white"
          >
            <div className="flex items-center gap-3">
              <FaRobot className="text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">Auto-Flagged</h3>
                <p className="text-2xl font-bold">{autoFlagged.length}</p>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white"
          >
            <div className="flex items-center gap-3">
              <FaCommentDots className="text-2xl" />
              <div>
                <h3 className="text-lg font-semibold">Feedback</h3>
                <p className="text-2xl font-bold">{feedback.length}</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Reported Listings */}
        <motion.section {...sectionAnim}>
          <h3 className="text-lg font-semibold mb-3 text-purple-700">
            Reported Listings
          </h3>
          <div className="rounded-xl shadow-lg p-5 bg-white border border-purple-100 flex flex-col gap-2">
            {reportedListings.length === 0 && (
              <span className="text-gray-400">No reported listings.</span>
            )}
            {reportedListings.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  item.status !== "pending"
                    ? "bg-green-50"
                    : "hover:bg-purple-50"
                } transition`}
              >
                <FaListAlt className="text-base text-purple-500" />
                <span className="font-medium text-base text-gray-800">
                  {item.title}
                </span>
                <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">
                  {item.reason}
                </span>
                <span className="ml-4 text-xs text-gray-500">
                  by {item.reporter}
                </span>
                <span className="ml-4 text-xs text-gray-400">{item.date}</span>
                <ModerationActionButtons
                  onWarn={() => handleAction("listing", item.id, "warned")}
                  onRemove={() => handleAction("listing", item.id, "removed")}
                  onBan={() => handleAction("listing", item.id, "banned")}
                  status={item.status}
                  onViewDetails={() => handleViewDetails(item, "listing")}
                />
                {item.status !== "pending" && (
                  <span className="ml-4 text-xs font-semibold text-green-600 flex items-center gap-1">
                    <FaCheck className="text-xs" /> {item.status}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Reported Users */}
        <motion.section {...sectionAnim}>
          <h3 className="text-lg font-semibold mb-3 text-purple-700">
            Reported Users
          </h3>
          <div className="rounded-xl shadow-lg p-5 bg-white border border-purple-100 flex flex-col gap-2">
            {reportedUsers.length === 0 && (
              <span className="text-gray-400">No reported users.</span>
            )}
            {reportedUsers.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  item.status !== "pending"
                    ? "bg-green-50"
                    : "hover:bg-purple-50"
                } transition`}
              >
                <FaUser className="text-base text-purple-500" />
                <span className="font-medium text-base text-gray-800">
                  {item.name}
                </span>
                <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-600">
                  {item.reason}
                </span>
                <span className="ml-4 text-xs text-gray-500">
                  by {item.reporter}
                </span>
                <span className="ml-4 text-xs text-gray-400">{item.date}</span>
                <ModerationActionButtons
                  onWarn={() => handleAction("user", item.id, "warned")}
                  onRemove={() => handleAction("user", item.id, "removed")}
                  onBan={() => handleAction("user", item.id, "banned")}
                  status={item.status}
                  onViewDetails={() => handleViewDetails(item, "user")}
                />
                {item.status !== "pending" && (
                  <span className="ml-4 text-xs font-semibold text-green-600 flex items-center gap-1">
                    <FaCheck className="text-xs" /> {item.status}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Auto-Flagged Content */}
        <motion.section {...sectionAnim}>
          <h3 className="text-lg font-semibold mb-3 text-purple-700">
            Auto-Flagged Content
          </h3>
          <div className="rounded-xl shadow-lg p-5 bg-white border border-purple-100 flex flex-col gap-2">
            {autoFlagged.length === 0 && (
              <span className="text-gray-400">No auto-flagged content.</span>
            )}
            {autoFlagged.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className={`flex items-center gap-4 p-3 rounded-lg ${
                  item.status !== "pending"
                    ? "bg-green-50"
                    : "hover:bg-purple-50"
                } transition`}
              >
                <FaRobot className="text-base text-purple-500" />
                <span className="font-medium text-base text-gray-800">
                  {item.title}
                </span>
                <span className="ml-auto text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-600">
                  {item.reason}
                </span>
                <span className="ml-4 text-xs text-gray-500">
                  {item.flaggedBy}
                </span>
                <span className="ml-4 text-xs text-gray-400">{item.date}</span>
                <ModerationActionButtons
                  onWarn={() => handleAction("auto", item.id, "warned")}
                  onRemove={() => handleAction("auto", item.id, "removed")}
                  onBan={() => handleAction("auto", item.id, "banned")}
                  status={item.status}
                  onViewDetails={() => handleViewDetails(item, "auto")}
                />
                {item.status !== "pending" && (
                  <span className="ml-4 text-xs font-semibold text-green-600 flex items-center gap-1">
                    <FaCheck className="text-xs" /> {item.status}
                  </span>
                )}
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Feedback Management */}
        <motion.section {...sectionAnim}>
          <h3 className="text-lg font-semibold mb-3 text-purple-700">
            Feedback Management
          </h3>
          <div className="rounded-xl shadow-lg p-5 bg-white border border-purple-100 flex flex-col gap-2">
            {feedback.length === 0 && (
              <span className="text-gray-400">No feedback yet.</span>
            )}
            {feedback.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.3 }}
                className="flex items-center gap-4 p-3 rounded-lg hover:bg-purple-50 transition"
              >
                <FaCommentDots className="text-base text-purple-500" />
                <span className="font-medium text-base text-gray-800">
                  {item.user}
                </span>
                <span className="ml-auto text-gray-600 italic text-sm">
                  "{item.message}"
                </span>
                <span className="ml-4 text-xs text-gray-400">{item.date}</span>
                <ModerationActionButtons
                  onWarn={() => handleAction("feedback", item.id, "warned")}
                  onRemove={() => handleAction("feedback", item.id, "removed")}
                  onBan={() => handleAction("feedback", item.id, "banned")}
                  status={item.status}
                  onViewDetails={() => handleViewDetails(item, "feedback")}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Add DetailModal */}
        <DetailModal
          isOpen={!!selectedItem}
          onClose={() => {
            setSelectedItem(null);
            setModalType(null);
          }}
          data={selectedItem}
          type={modalType}
        />
      </div>
    </AdminLayout>
  );
}
