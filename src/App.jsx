import {
  FaGooglePlay,
  FaAppStoreIos,
  FaEnvelope,
  FaTwitter,
  FaInstagram,
  FaFacebookF,
} from "react-icons/fa";
import { motion } from "framer-motion";
import winjaIcon from "/winja-icon.png";
import {
  FaGraduationCap,
  FaBriefcase,
  FaMoneyBillWave,
  FaTrophy,
  FaTools,
  FaBook,
  FaHandshake,
  FaUserGraduate,
  FaShoppingCart,
} from "react-icons/fa";
import { useState } from "react";
import theme from "./theme";
import { Routes, Route, Navigate } from "react-router-dom";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/admin/Dashboard";
import Opportunities from "./pages/admin/Opportunities";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./AuthContext.jsx";
import Users from "./pages/admin/Users";
import Partners from "./pages/admin/Partners";
import Analytics from "./pages/admin/Analytics";
import Referrals from "./pages/admin/Referrals";
import Moderation from "./pages/admin/Moderation";
import Settings from "./pages/admin/Settings";

function AnimatedGradientBG() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-[#5b2be7] via-[#a78bfa] to-[#f8fafc] opacity-40 blur-3xl animate-pulse" />
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-[#ede9fe] via-[#c7d2fe] to-[#5b2be7] opacity-30 blur-2xl animate-pulse" />
      <div className="absolute bottom-0 left-1/2 w-[300px] h-[300px] rounded-full bg-gradient-to-tl from-[#5b2be7] via-[#ede9fe] to-[#a78bfa] opacity-20 blur-2xl animate-pulse" />
    </motion.div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/opportunities"
          element={
            <ProtectedRoute>
              <Opportunities />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute>
              <Users />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/partners"
          element={
            <ProtectedRoute>
              <Partners />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute>
              <Analytics />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/referrals"
          element={
            <ProtectedRoute>
              <Referrals />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/moderation"
          element={
            <ProtectedRoute>
              <Moderation />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        {/* Add other admin routes here */}
      </Routes>
    </AuthProvider>
  );
}

export default App;

// TestimonialCarousel component (must be after App)
const testimonials = [
  {
    icon: "🌟",
    text: "Winja helped me land a scholarship I never knew existed. The alerts are always on point!",
    name: "Ada, Student",
  },
  {
    icon: "🚀",
    text: "I got my first freelance gig through Winja. The platform is a game changer for hustlers!",
    name: "Tunde, Freelancer",
  },
  {
    icon: "💡",
    text: "The real-time alerts are so helpful. I never miss out on opportunities anymore.",
    name: "Chiamaka, Graduate",
  },
  {
    icon: "🎯",
    text: "I found a grant for my startup through Winja. The process was seamless!",
    name: "Emeka, Entrepreneur",
  },
];
function TestimonialCarousel() {
  const [idx, setIdx] = useState(0);
  return (
    <div className="relative w-full flex flex-col items-center">
      <div
        key={idx}
        className="bg-white/90 rounded-2xl shadow-2xl p-10 flex flex-col items-center text-center max-w-xl mx-auto border border-white/40 backdrop-blur-lg"
      >
        <div className="text-5xl mb-4 animate-bounce">
          {testimonials[idx].icon}
        </div>
        <p className="text-gray-700 mb-4 text-lg font-medium">
          “{testimonials[idx].text}”
        </p>
        <span className="font-semibold text-[#5b2be7]">
          - {testimonials[idx].name}
        </span>
      </div>
      <div className="flex gap-2 mt-6">
        {testimonials.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              i === idx ? "bg-[#5b2be7] scale-125" : "bg-gray-300"
            }`}
            aria-label={`Go to testimonial ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}
