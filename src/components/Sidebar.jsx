import {
  FaTachometerAlt,
  FaUsers,
  FaGift,
  FaChartBar,
  FaShareAlt,
  FaGavel,
  FaCog,
  FaHeadset,
  FaHandshake,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";
import winjaIcon from "/winja-icon.png";
import theme from "../theme";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../AuthContext.jsx";

const navItems = [
  { label: "Dashboard", icon: <FaTachometerAlt />, path: "/admin/dashboard" },
  {
    label: "Opportunity Management",
    icon: <FaGift />,
    path: "/admin/opportunities",
  },
  { label: "User Management", icon: <FaUsers />, path: "/admin/users" },
  {
    label: "Partner Management",
    icon: <FaHandshake />,
    path: "/admin/partners",
  },
  {
    label: "Reports & Analytics",
    icon: <FaChartBar />,
    path: "/admin/analytics",
  },
  {
    label: "Referral & Rewards",
    icon: <FaShareAlt />,
    path: "/admin/referrals",
  },
  { label: "Moderation", icon: <FaGavel />, path: "/admin/moderation" },
  { label: "Settings & Config", icon: <FaCog />, path: "/admin/settings" },
  { label: "Support", icon: <FaHeadset />, path: "/admin/support" },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
    navigate("/admin/login", { replace: true });
  };

  return (
    <aside
      className={
        "sticky top-6 z-30 flex flex-col items-center rounded-3xl shadow-2xl border backdrop-blur-2xl transition-all duration-300 w-24 py-6 gap-4 h-[90vh] ml-6"
      }
      style={{ background: theme.surfaceGlass, borderColor: theme.border }}
    >
      <div className="mb-6 flex flex-col items-center gap-2">
        <img
          src={winjaIcon}
          alt="Winja Logo"
          className="h-10 w-auto rounded-full shadow-lg border-2"
          style={{ borderColor: theme.surface }}
        />
      </div>
      <nav className="flex flex-col gap-2 flex-1 items-center w-full">
        {navItems.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="group flex flex-col items-center justify-center w-11 h-11 rounded-2xl transition relative"
            style={{ color: theme.textLight, background: theme.surface }}
            title={item.label}
          >
            <span className="text-xl" style={{ color: theme.textLight }}>
              {item.icon}
            </span>
            <span
              className="absolute left-14 top-1/2 -translate-y-1/2 text-xs rounded-lg px-2 py-1 opacity-0 group-hover:opacity-100 shadow-lg pointer-events-none transition-all duration-200"
              style={{ background: theme.primary, color: theme.surface }}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </nav>
      <div className="flex flex-col gap-2 items-center mt-4">
        <button
          onClick={handleLogout}
          className="flex flex-col items-center justify-center w-11 h-11 rounded-2xl transition hover:bg-red-50"
          style={{ color: theme.textLight, background: theme.surface }}
          title="Logout"
        >
          <FaSignOutAlt className="text-xl" />
        </button>
      </div>
    </aside>
  );
}
