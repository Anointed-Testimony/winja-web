import AdminLayout from "../../layouts/AdminLayout";
import theme from "../../theme";
import { useState, useEffect } from "react";
import {
  FaCog,
  FaBell,
  FaBullhorn,
  FaFileAlt,
  FaDollarSign,
  FaTrash,
  FaCheckCircle,
} from "react-icons/fa";
import {
  getSettings,
  updateSettings,
  getPushNotifications,
  createPushNotification,
  deletePushNotification,
} from "../../api";
import { toast } from "react-toastify";

const TABS = [
  { key: "app", label: "App Config", icon: <FaCog /> },
  { key: "notifications", label: "Notification Defaults", icon: <FaBell /> },
  { key: "push", label: "Push Notifications", icon: <FaBullhorn /> },
  { key: "logs", label: "System Logs", icon: <FaFileAlt /> },
  { key: "pricing", label: "Pricing", icon: <FaDollarSign /> },
];

export default function Settings() {
  const [tab, setTab] = useState("app");
  const [settings, setSettings] = useState(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState(null);
  const [saving, setSaving] = useState(false);

  // Push notifications
  const [notifications, setNotifications] = useState([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState(null);
  const [notifForm, setNotifForm] = useState({ message: "", scheduled_at: "" });
  const [notifSaving, setNotifSaving] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    setSettingsLoading(true);
    getSettings()
      .then((res) => setSettings(res.data))
      .catch(() => setSettingsError("Failed to load settings."))
      .finally(() => setSettingsLoading(false));
  }, []);

  // Fetch notifications on mount/tab change
  useEffect(() => {
    if (tab === "push") {
      setNotifLoading(true);
      getPushNotifications()
        .then((res) => setNotifications(res.data))
        .catch(() => setNotifError("Failed to load notifications."))
        .finally(() => setNotifLoading(false));
    }
  }, [tab]);

  // Save settings handler
  const handleSaveSettings = async (fields) => {
    setSaving(true);
    try {
      await updateSettings(fields);
      toast.success("Settings saved!");
      // Refresh settings
      const res = await getSettings();
      setSettings(res.data);
    } catch (e) {
      toast.error("Failed to save settings.");
    } finally {
      setSaving(false);
    }
  };

  // Push notification handlers
  const handleNotifChange = (e) => {
    setNotifForm({ ...notifForm, [e.target.name]: e.target.value });
  };
  const handleNotifSubmit = async (e) => {
    e.preventDefault();
    setNotifSaving(true);
    try {
      await createPushNotification({
        message: notifForm.message,
        scheduled_at: notifForm.scheduled_at || null,
      });
      toast.success("Notification scheduled!");
      setNotifForm({ message: "", scheduled_at: "" });
      // Refresh notifications
      const res = await getPushNotifications();
      setNotifications(res.data);
    } catch (e) {
      toast.error("Failed to schedule notification.");
    } finally {
      setNotifSaving(false);
    }
  };
  const handleNotifDelete = async (id) => {
    if (!window.confirm("Delete this notification?")) return;
    try {
      await deletePushNotification(id);
      toast.success("Notification deleted.");
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch (e) {
      toast.error("Failed to delete notification.");
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row gap-8 max-w-6xl mx-auto py-8">
        {/* Sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <nav className="bg-white rounded-2xl shadow p-4 flex md:flex-col flex-row gap-2 md:gap-4 border border-gray-100">
            {TABS.map((t) => (
              <button
                key={t.key}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition text-base w-full md:justify-start justify-center ${
                  tab === t.key
                    ? "bg-purple-600 text-white shadow"
                    : "bg-gray-50 text-gray-700 hover:bg-purple-50"
                }`}
                onClick={() => setTab(t.key)}
              >
                <span className="text-lg">{t.icon}</span>
                <span className="hidden md:inline">{t.label}</span>
              </button>
            ))}
          </nav>
        </aside>
        {/* Main Content */}
        <section className="flex-1 min-w-0">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {settingsLoading ? (
              <div className="text-center text-gray-400">
                Loading settings...
              </div>
            ) : settingsError ? (
              <div className="text-center text-red-500">{settingsError}</div>
            ) : (
              <>
                {tab === "app" && (
                  <AppConfigSection
                    settings={settings}
                    onSave={handleSaveSettings}
                    saving={saving}
                  />
                )}
                {tab === "notifications" && (
                  <NotificationDefaultsSection
                    settings={settings}
                    onSave={handleSaveSettings}
                    saving={saving}
                  />
                )}
                {tab === "push" && (
                  <PushNotificationsSection
                    notifications={notifications}
                    notifLoading={notifLoading}
                    notifError={notifError}
                    notifForm={notifForm}
                    notifSaving={notifSaving}
                    onNotifChange={handleNotifChange}
                    onNotifSubmit={handleNotifSubmit}
                    onNotifDelete={handleNotifDelete}
                  />
                )}
                {tab === "logs" && <SystemLogsSection />}
                {tab === "pricing" && (
                  <PricingSection
                    settings={settings}
                    onSave={handleSaveSettings}
                    saving={saving}
                  />
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </AdminLayout>
  );
}

function SectionHeader({ icon, title, desc }) {
  return (
    <div className="mb-6 flex items-center gap-4">
      <span className="bg-purple-100 text-purple-600 rounded-xl p-3 text-2xl shadow-sm">
        {icon}
      </span>
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-1">{title}</h2>
        {desc && <p className="text-gray-500 text-sm">{desc}</p>}
      </div>
    </div>
  );
}

function AppConfigSection({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    app_name: settings?.app_name || "",
    theme_color: settings?.theme_color || "#7c3aed",
    app_logo: settings?.app_logo || "",
  });
  useEffect(() => {
    setForm({
      app_name: settings?.app_name || "",
      theme_color: settings?.theme_color || "#7c3aed",
      app_logo: settings?.app_logo || "",
    });
  }, [settings]);
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "app_logo" && files && files[0]) {
      // For now, just store file name (real upload needs backend support)
      setForm((f) => ({ ...f, app_logo: files[0].name }));
    } else {
      setForm((f) => ({ ...f, [name]: value }));
    }
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      app_name: form.app_name,
      theme_color: form.theme_color,
      app_logo: form.app_logo,
    });
  };
  return (
    <div>
      <SectionHeader
        icon={<FaCog />}
        title="App Configuration"
        desc="General app settings and branding."
      />
      <form className="space-y-6 max-w-lg" onSubmit={handleSubmit}>
        <div>
          <label className="block font-medium mb-1">App Name</label>
          <input
            name="app_name"
            className="w-full border rounded-lg p-3 bg-gray-50"
            value={form.app_name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Theme Color</label>
          <input
            name="theme_color"
            type="color"
            className="w-12 h-8 p-0 border rounded-lg"
            value={form.theme_color}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Logo</label>
          <input
            name="app_logo"
            type="file"
            className="w-full"
            onChange={handleChange}
          />
          {form.app_logo && (
            <div className="text-xs text-gray-500 mt-1">
              Current: {form.app_logo}
            </div>
          )}
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function NotificationDefaultsSection({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    notification_delay: settings?.notification_delay || 10,
    max_notifications_per_hour: settings?.max_notifications_per_hour || 5,
  });
  useEffect(() => {
    setForm({
      notification_delay: settings?.notification_delay || 10,
      max_notifications_per_hour: settings?.max_notifications_per_hour || 5,
    });
  }, [settings]);
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      notification_delay: form.notification_delay,
      max_notifications_per_hour: form.max_notifications_per_hour,
    });
  };
  return (
    <div>
      <SectionHeader
        icon={<FaBell />}
        title="Notification Timing Defaults"
        desc="Set default timing and limits for notifications."
      />
      <form className="space-y-6 max-w-lg" onSubmit={handleSubmit}>
        <div>
          <label className="block font-medium mb-1">
            Default Notification Delay (minutes)
          </label>
          <input
            name="notification_delay"
            className="w-full border rounded-lg p-3 bg-gray-50"
            type="number"
            value={form.notification_delay}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
            Max Notifications Per Hour
          </label>
          <input
            name="max_notifications_per_hour"
            className="w-full border rounded-lg p-3 bg-gray-50"
            type="number"
            value={form.max_notifications_per_hour}
            onChange={handleChange}
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

function PushNotificationsSection({
  notifications,
  notifLoading,
  notifError,
  notifForm,
  notifSaving,
  onNotifChange,
  onNotifSubmit,
  onNotifDelete,
}) {
  return (
    <div>
      <SectionHeader
        icon={<FaBullhorn />}
        title="Push Notification Management"
        desc="Create and schedule system-wide alerts or emergency messages."
      />
      <form className="space-y-6 max-w-lg mb-8" onSubmit={onNotifSubmit}>
        <div>
          <label className="block font-medium mb-1">Message</label>
          <textarea
            name="message"
            className="w-full border rounded-lg p-3 bg-gray-50"
            rows={3}
            placeholder="Type your alert or emergency message..."
            value={notifForm.message}
            onChange={onNotifChange}
            required
          />
        </div>
        <div>
          <label className="block font-medium mb-1">Schedule Time</label>
          <input
            name="scheduled_at"
            className="w-full border rounded-lg p-3 bg-gray-50"
            type="datetime-local"
            value={notifForm.scheduled_at}
            onChange={onNotifChange}
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
            disabled={notifSaving}
          >
            {notifSaving ? "Sending..." : "Send / Schedule"}
          </button>
        </div>
      </form>
      <h3 className="font-semibold mb-3 text-purple-700">
        Sent & Scheduled Notifications
      </h3>
      {notifLoading ? (
        <div className="text-gray-400">Loading notifications...</div>
      ) : notifError ? (
        <div className="text-red-500">{notifError}</div>
      ) : notifications.length === 0 ? (
        <div className="text-gray-400">No notifications yet.</div>
      ) : (
        <ul className="divide-y bg-gray-50 rounded-lg p-4">
          {notifications.map((n) => (
            <li key={n.id} className="py-2 flex items-center gap-2">
              <FaBullhorn className="text-purple-500" />
              <span>{n.message}</span>
              <span className="ml-auto text-xs text-gray-400">
                {n.scheduled_at
                  ? `Scheduled: ${new Date(n.scheduled_at).toLocaleString()}`
                  : n.sent_at
                  ? `Sent: ${new Date(n.sent_at).toLocaleString()}`
                  : n.status}
              </span>
              <button
                className="ml-4 text-red-500 hover:text-red-700"
                title="Delete"
                onClick={() => onNotifDelete(n.id)}
              >
                <FaTrash />
              </button>
              {n.status === "sent" && (
                <FaCheckCircle className="text-green-500 ml-2" title="Sent" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function SystemLogsSection() {
  return (
    <div>
      <SectionHeader
        icon={<FaFileAlt />}
        title="System Logs"
        desc="Audit logs for admin activities."
      />
      <div className="mb-4 flex gap-2">
        <input
          className="border rounded-lg p-3 flex-1 bg-gray-50"
          placeholder="Search by user, action, or date..."
        />
        <button className="bg-purple-50 text-purple-700 px-4 py-2 rounded-lg font-semibold">
          Search
        </button>
      </div>
      <div className="overflow-x-auto bg-gray-50 rounded-lg p-2">
        <table className="min-w-full border rounded-lg">
          <thead className="bg-purple-50">
            <tr>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Action</th>
              <th className="p-2 text-left">Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="p-2">2024-06-10 12:00</td>
              <td className="p-2">admin</td>
              <td className="p-2">Updated pricing</td>
              <td className="p-2">Set sponsor price to $20</td>
            </tr>
            <tr>
              <td className="p-2">2024-06-09 15:30</td>
              <td className="p-2">moderator</td>
              <td className="p-2">Sent notification</td>
              <td className="p-2">System maintenance alert</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PricingSection({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    sponsor_price: settings?.sponsor_price || 20,
    premium_price: settings?.premium_price || 10,
  });
  useEffect(() => {
    setForm({
      sponsor_price: settings?.sponsor_price || 20,
      premium_price: settings?.premium_price || 10,
    });
  }, [settings]);
  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      sponsor_price: form.sponsor_price,
      premium_price: form.premium_price,
    });
  };
  return (
    <div>
      <SectionHeader
        icon={<FaDollarSign />}
        title="Pricing"
        desc="Set prices for sponsoring and premium features."
      />
      <form className="space-y-6 max-w-lg" onSubmit={handleSubmit}>
        <div>
          <label className="block font-medium mb-1">Sponsor Price ($)</label>
          <input
            name="sponsor_price"
            className="w-full border rounded-lg p-3 bg-gray-50"
            type="number"
            value={form.sponsor_price}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-medium mb-1">
            Premium Feature Price ($)
          </label>
          <input
            name="premium_price"
            className="w-full border rounded-lg p-3 bg-gray-50"
            type="number"
            value={form.premium_price}
            onChange={handleChange}
          />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold shadow transition"
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}
