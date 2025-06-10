import { FaLock } from "react-icons/fa";
import { motion } from "framer-motion";
import winjaIcon from "/winja-icon.png";
import theme from "../theme";
import { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { loginApi } from "../api";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginApi({ email, password });
      if (res.data.user.user_type !== "admin") {
        toast.error("You are not authorized as admin.");
        setLoading(false);
        return;
      }
      toast.success("Login successful! Welcome, Admin.");
      localStorage.setItem("admin_token", res.data.token);
      localStorage.setItem("admin_user", JSON.stringify(res.data.user));
      setTimeout(() => {
        window.location.href = "/admin/dashboard";
      }, 1200);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${theme.accent}, ${theme.primaryLight}, ${theme.primary})`,
      }}
    >
      <ToastContainer position="top-center" />
      {/* Animated Gradient BG */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 z-0 overflow-hidden"
      >
        <div
          className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-40 blur-3xl animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.primaryLight}, #f8fafc)`,
          }}
        />
        <div
          className="absolute top-1/2 right-0 w-[400px] h-[400px] rounded-full opacity-30 blur-2xl animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, ${theme.primaryLight}, ${theme.primary})`,
          }}
        />
        <div
          className="absolute bottom-0 left-1/2 w-[300px] h-[300px] rounded-full opacity-20 blur-2xl animate-pulse"
          style={{
            background: `linear-gradient(135deg, ${theme.primary}, ${theme.accent}, ${theme.primaryLight})`,
          }}
        />
      </motion.div>
      <motion.div
        initial={{ y: 40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1 }}
        className="relative z-10 w-full max-w-md p-8 rounded-3xl shadow-2xl backdrop-blur-lg border flex flex-col items-center"
        style={{ background: theme.surfaceGlass, borderColor: theme.border }}
      >
        <img src={winjaIcon} alt="Winja Logo" className="h-12 w-auto mb-4" />
        <h2
          className="text-2xl font-bold mb-2"
          style={{ color: theme.primary }}
        >
          Admin Login
        </h2>
        <p className="mb-6 text-center" style={{ color: theme.textLight }}>
          Welcome back, Admin! Please sign in to manage Winja opportunities.
        </p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <div>
            <label
              className="block font-semibold mb-1"
              style={{ color: theme.text }}
            >
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 bg-white/80 text-gray-900 shadow"
              style={{
                borderColor: theme.border,
                color: theme.text,
                background: theme.surfaceGlass,
              }}
              placeholder="admin@winja.com"
              disabled={loading}
            />
          </div>
          <div>
            <label
              className="block font-semibold mb-1"
              style={{ color: theme.text }}
            >
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 bg-white/80 text-gray-900 shadow"
              style={{
                borderColor: theme.border,
                color: theme.text,
                background: theme.surfaceGlass,
              }}
              placeholder="••••••••"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            className="mt-4 w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-lg shadow-xl transition"
            style={{ background: theme.primary, color: theme.surface }}
            disabled={loading}
          >
            <FaLock className="w-5 h-5" />
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
