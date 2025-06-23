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
  FaPlus,
  FaEdit,
  FaWhatsapp,
  FaEnvelope,
} from "react-icons/fa";
import {
  getSettings,
  updateSettings,
  getPushNotifications,
  createPushNotification,
  deletePushNotification,
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
} from "../../api";
import { toast } from "react-toastify";

const TABS = [
  { key: "app", label: "App Config", icon: <FaCog /> },
  { key: "notifications", label: "Notification Defaults", icon: <FaBell /> },
  { key: "push", label: "Push Notifications", icon: <FaBullhorn /> },
  { key: "subscriptions", label: "Subscription Plans", icon: <FaDollarSign /> },
  { key: "integrations", label: "Integrations", icon: <FaWhatsapp /> },
  { key: "logs", label: "System Logs", icon: <FaFileAlt /> },
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

  // Subscription plans
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({
    name: "",
    description: "",
    price: "",
    duration_months: "",
    features: [],
    status: "active"
  });

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

  // Fetch subscription plans on mount/tab change
  useEffect(() => {
    if (tab === "subscriptions") {
      loadPlans();
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

  // Subscription plan handlers
  const loadPlans = async () => {
    try {
      const res = await getSubscriptionPlans();
      setPlans(res.data.plans);
    } catch (err) {
      setError("Failed to load subscription plans");
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSubmit = async (e) => {
    e.preventDefault();
    try {
      if (planForm.id) {
        await updateSubscriptionPlan(planForm.id, planForm);
        toast.success("Plan updated successfully");
      } else {
        await createSubscriptionPlan(planForm);
        toast.success("Plan created successfully");
      }
      setShowPlanModal(false);
      loadPlans();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save plan");
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Are you sure you want to delete this plan?")) return;
    try {
      await deleteSubscriptionPlan(id);
      toast.success("Plan deleted successfully");
      loadPlans();
    } catch (err) {
      toast.error("Failed to delete plan");
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
                {tab === "subscriptions" && (
                  <SubscriptionPlansSection
                    plans={plans}
                    loading={loading}
                    error={error}
                    showPlanModal={showPlanModal}
                    setShowPlanModal={setShowPlanModal}
                    planForm={planForm}
                    setPlanForm={setPlanForm}
                    onPlanSubmit={handlePlanSubmit}
                    onDeletePlan={handleDeletePlan}
                  />
                )}
                {tab === "integrations" && (
                  <IntegrationsSection
                    settings={settings}
                    onSave={handleSaveSettings}
                    saving={saving}
                  />
                )}
                {tab === "logs" && <SystemLogsSection />}
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

function SubscriptionPlansSection({
  plans = [],
  loading,
  error,
  showPlanModal,
  setShowPlanModal,
  planForm,
  setPlanForm,
  onPlanSubmit,
  onDeletePlan,
}) {
  if (loading) return <div>Loading plans...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  
  // Ensure plans is an array
  const plansList = Array.isArray(plans) ? plans : [];

  const durationOptions = [
    { value: 1, label: 'Monthly' },
    { value: 3, label: 'Quarterly' },
    { value: 12, label: 'Yearly' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-bold text-gray-800">
          Subscription Plans
        </h3>
        <button
          onClick={() => {
            setPlanForm({
              name: "",
              price: "",
              duration_months: 1,
              features: [],
              status: "active"
            });
            setShowPlanModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition"
        >
          <FaPlus /> Add Plan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plansList.map((plan) => (
          <div
            key={plan.id}
            className="rounded-2xl shadow-lg p-6 border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-lg font-bold text-gray-800">{plan.name}</h4>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setPlanForm(plan);
                    setShowPlanModal(true);
                  }}
                  className="p-2 text-gray-600 hover:text-purple-600"
                >
                  <FaEdit />
                </button>
                <button
                  onClick={() => onDeletePlan(plan.id)}
                  className="p-2 text-gray-600 hover:text-red-600"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-gray-800">₦{plan.price}</span>
                <span className="text-sm text-gray-800">
                  {plan.duration_months === 1 ? 'Monthly' :
                   plan.duration_months === 3 ? 'Quarterly' :
                   plan.duration_months === 12 ? 'Yearly' :
                   `${plan.duration_months} months`}
                </span>
              </div>
              <div className="space-y-2">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <FaCheckCircle className="text-green-500" />
                    <span className="text-sm text-gray-800">{feature}</span>
                  </div>
                ))}
              </div>
              <div className="pt-4">
                <span
                  className={`px-3 py-1 rounded-full text-sm ${
                    plan.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {plan.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4 text-gray-800">
              {planForm.id ? "Edit Plan" : "Add New Plan"}
            </h3>
            <form onSubmit={onPlanSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Name</label>
                <input
                  type="text"
                  value={planForm.name}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, name: e.target.value })
                  }
                  className="w-full rounded-xl border p-2 text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Price (₦)</label>
                <input
                  type="number"
                  value={planForm.price}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, price: e.target.value })
                  }
                  className="w-full rounded-xl border p-2 text-gray-800"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">
                  Duration
                </label>
                <select
                  value={planForm.duration_months}
                  onChange={(e) =>
                    setPlanForm({
                      ...planForm,
                      duration_months: parseInt(e.target.value),
                    })
                  }
                  className="w-full rounded-xl border p-2 text-gray-800"
                  required
                >
                  {durationOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Features</label>
                <div className="space-y-2">
                  {planForm.features.map((feature, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(e) => {
                          const newFeatures = [...planForm.features];
                          newFeatures[index] = e.target.value;
                          setPlanForm({ ...planForm, features: newFeatures });
                        }}
                        className="flex-1 rounded-xl border p-2 text-gray-800"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newFeatures = planForm.features.filter(
                            (_, i) => i !== index
                          );
                          setPlanForm({ ...planForm, features: newFeatures });
                        }}
                        className="p-2 text-red-600"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() =>
                      setPlanForm({
                        ...planForm,
                        features: [...planForm.features, ""],
                      })
                    }
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    + Add Feature
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Status</label>
                <select
                  value={planForm.status}
                  onChange={(e) =>
                    setPlanForm({ ...planForm, status: e.target.value })
                  }
                  className="w-full rounded-xl border p-2 text-gray-800"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="flex justify-end gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowPlanModal(false)}
                  className="px-4 py-2 rounded-xl border hover:bg-gray-50 text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 text-white hover:bg-purple-700"
                >
                  {planForm.id ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function IntegrationsSection({ settings, onSave, saving }) {
  const [form, setForm] = useState({
    whatsapp_api_key: settings?.whatsapp_api_key || "",
    whatsapp_phone_number: settings?.whatsapp_phone_number || "",
    whatsapp_business_id: settings?.whatsapp_business_id || "",
    email_smtp_host: settings?.email_smtp_host || "",
    email_smtp_port: settings?.email_smtp_port || "",
    email_smtp_user: settings?.email_smtp_user || "",
    email_smtp_password: settings?.email_smtp_password || "",
    email_from_address: settings?.email_from_address || "",
    email_from_name: settings?.email_from_name || "",
  });

  const [templates, setTemplates] = useState({
    welcome_email: settings?.templates?.welcome_email || "",
    subscription_confirmation: settings?.templates?.subscription_confirmation || "",
    subscription_expiring: settings?.templates?.subscription_expiring || "",
    subscription_expired: settings?.templates?.subscription_expired || "",
    whatsapp_welcome: settings?.templates?.whatsapp_welcome || "",
    whatsapp_subscription: settings?.templates?.whatsapp_subscription || "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleTemplateChange = (e) => {
    setTemplates({ ...templates, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSave({
      ...form,
      templates,
    });
  };

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={<FaWhatsapp />}
        title="WhatsApp Integration"
        desc="Configure WhatsApp Business API settings for notifications"
      />
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              WhatsApp API Key
            </label>
            <input
              type="password"
              name="whatsapp_api_key"
              value={form.whatsapp_api_key}
              onChange={handleChange}
              className="w-full rounded-xl border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              WhatsApp Phone Number
            </label>
            <input
              type="text"
              name="whatsapp_phone_number"
              value={form.whatsapp_phone_number}
              onChange={handleChange}
              className="w-full rounded-xl border p-2"
              placeholder="+1234567890"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              WhatsApp Business ID
            </label>
            <input
              type="text"
              name="whatsapp_business_id"
              value={form.whatsapp_business_id}
              onChange={handleChange}
              className="w-full rounded-xl border p-2"
            />
          </div>
        </div>

        <SectionHeader
          icon={<FaEnvelope />}
          title="Email Settings"
          desc="Configure SMTP settings for email notifications"
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-1">SMTP Host</label>
            <input
              type="text"
              name="email_smtp_host"
              value={form.email_smtp_host}
              onChange={handleChange}
              className="w-full rounded-xl border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SMTP Port</label>
            <input
              type="number"
              name="email_smtp_port"
              value={form.email_smtp_port}
              onChange={handleChange}
              className="w-full rounded-xl border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SMTP User</label>
            <input
              type="text"
              name="email_smtp_user"
              value={form.email_smtp_user}
              onChange={handleChange}
              className="w-full rounded-xl border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              SMTP Password
            </label>
            <input
              type="password"
              name="email_smtp_password"
              value={form.email_smtp_password}
              onChange={handleChange}
              className="w-full rounded-xl border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              From Address
            </label>
            <input
              type="email"
              name="email_from_address"
              value={form.email_from_address}
              onChange={handleChange}
              className="w-full rounded-xl border p-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">From Name</label>
            <input
              type="text"
              name="email_from_name"
              value={form.email_from_name}
              onChange={handleChange}
              className="w-full rounded-xl border p-2"
            />
          </div>
        </div>

        <SectionHeader
          icon={<FaFileAlt />}
          title="Notification Templates"
          desc="Customize email and WhatsApp notification templates"
        />
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-1">
              Welcome Email Template
            </label>
            <textarea
              name="welcome_email"
              value={templates.welcome_email}
              onChange={handleTemplateChange}
              rows="4"
              className="w-full rounded-xl border p-2"
              placeholder="Welcome to Winja! We're excited to have you on board..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Subscription Confirmation Email
            </label>
            <textarea
              name="subscription_confirmation"
              value={templates.subscription_confirmation}
              onChange={handleTemplateChange}
              rows="4"
              className="w-full rounded-xl border p-2"
              placeholder="Thank you for subscribing to Winja Premium..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Subscription Expiring Email
            </label>
            <textarea
              name="subscription_expiring"
              value={templates.subscription_expiring}
              onChange={handleTemplateChange}
              rows="4"
              className="w-full rounded-xl border p-2"
              placeholder="Your Winja Premium subscription will expire soon..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              WhatsApp Welcome Message
            </label>
            <textarea
              name="whatsapp_welcome"
              value={templates.whatsapp_welcome}
              onChange={handleTemplateChange}
              rows="4"
              className="w-full rounded-xl border p-2"
              placeholder="Welcome to Winja! We'll keep you updated on new opportunities..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              WhatsApp Subscription Message
            </label>
            <textarea
              name="whatsapp_subscription"
              value={templates.whatsapp_subscription}
              onChange={handleTemplateChange}
              rows="4"
              className="w-full rounded-xl border p-2"
              placeholder="Thank you for subscribing to Winja Premium..."
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 rounded-xl bg-purple-600 text-white hover:bg-purple-700 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
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
