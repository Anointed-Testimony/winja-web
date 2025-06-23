import AdminLayout from "../../layouts/AdminLayout";
import { useState, useEffect } from "react";
import {
  FaPlus,
  FaCheck,
  FaTimes,
  FaTrash,
  FaEdit,
  FaSearch,
  FaFilter,
  FaCheckCircle,
  FaExclamationCircle,
  FaListAlt,
  FaLayerGroup,
  FaTimesCircle,
  FaStar,
  FaBuilding,
  FaUsers,
  FaMoneyBillWave,
  FaCalendarAlt,
  FaEye,
  FaGlobe,
  FaPhone,
  FaUser,
  FaIdCard,
  FaMapMarkerAlt,
} from "react-icons/fa";
import theme from "../../theme";
import {
  getPartners,
  getPartner,
  updatePartner,
  getPartnerSponsoredOpportunities,
  getPartnerMetrics,
  getSponsoredOpportunities,
  deleteSponsoredOpportunity,
} from "../../api";

export default function Partners() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("partners");
  const [partners, setPartners] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
  });
  const [showPartnerModal, setShowPartnerModal] = useState(null);
  const [partnerForm, setPartnerForm] = useState({
    company_name: "",
    company_description: "",
    company_website: "",
    company_logo: null,
    partner_status: "active",
  });
  const [partnerLoading, setPartnerLoading] = useState(false);
  const [partnerError, setPartnerError] = useState("");
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [sponsoredOpportunities, setSponsoredOpportunities] = useState([]);
  const [sponsoredLoading, setSponsoredLoading] = useState(false);
  const [sponsoredError, setSponsoredError] = useState("");
  const [partnerMetrics, setPartnerMetrics] = useState(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState("");

  useEffect(() => {
    async function fetchPartners() {
      setLoading(true);
      setPartnerError("");
      try {
        const res = await getPartners();
        // Ensure partners is always an array
        let arr = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.data)
          ? res.data.data
          : Array.isArray(res.data.partners)
          ? res.data.partners
          : [];
        setPartners(arr);
      } catch (err) {
        setPartnerError("Failed to load partners");
        console.error("Load partners error:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchPartners();
  }, []);

  // Load partner details when selected
  useEffect(() => {
    if (selectedPartner) {
      async function loadPartnerDetails() {
        setSponsoredLoading(true);
        setMetricsLoading(true);
        setSponsoredError("");
        setMetricsError("");
        try {
          const [sponsoredRes, metricsRes] = await Promise.all([
            getPartnerSponsoredOpportunities(selectedPartner.id),
            getPartnerMetrics(selectedPartner.id),
          ]);
          // Defensive: handle both array and paginated/object response
          const sponsoredArr = Array.isArray(sponsoredRes.data)
            ? sponsoredRes.data
            : Array.isArray(sponsoredRes.data.data)
            ? sponsoredRes.data.data
            : [];
          setSponsoredOpportunities(sponsoredArr);
          setPartnerMetrics(metricsRes.data);
        } catch (err) {
          setSponsoredError("Failed to load partner details");
          setMetricsError("Failed to load partner metrics");
          console.error("Load partner details error:", err);
        } finally {
          setSponsoredLoading(false);
          setMetricsLoading(false);
        }
      }
      loadPartnerDetails();
    }
  }, [selectedPartner]);

  // Fetch all sponsored opportunities when Sponsored Posts tab is active
  useEffect(() => {
    if (tab === "sponsored") {
      async function fetchAllSponsored() {
        setSponsoredLoading(true);
        setSponsoredError("");
        try {
          const res = await getSponsoredOpportunities();
          const sponsoredArr = Array.isArray(res.data)
            ? res.data
            : Array.isArray(res.data.data)
            ? res.data.data
            : [];
          setSponsoredOpportunities(sponsoredArr);
        } catch (err) {
          setSponsoredError("Failed to load sponsored opportunities");
          console.error("Fetch all sponsored error:", err);
        } finally {
          setSponsoredLoading(false);
        }
      }
      fetchAllSponsored();
    }
  }, [tab]);

  // Filter partners based on search and filters
  const filteredPartners = partners.filter((p) => {
    // Search filter
    const searchMatch = search
      ? p.company_name.toLowerCase().includes(search.toLowerCase()) ||
        p.name.toLowerCase().includes(search.toLowerCase())
      : true;

    // Status filter
    const statusMatch = filters.status
      ? p.partner_status === filters.status
      : true;

    return searchMatch && statusMatch;
  });

  // Update partner
  const handleUpdatePartner = async () => {
    if (!showPartnerModal) return;
    setPartnerLoading(true);
    setPartnerError("");
    try {
      const formData = new FormData();
      Object.keys(partnerForm).forEach((key) => {
        if (partnerForm[key] !== null) {
          formData.append(key, partnerForm[key]);
        }
      });

      const res = await updatePartner(showPartnerModal, formData);
      setPartners(
        partners.map((p) => (p.id === showPartnerModal ? res.data : p))
      );
      setShowPartnerModal(null);
      setPartnerForm({
        company_name: "",
        company_description: "",
        company_website: "",
        company_logo: null,
        partner_status: "active",
      });
    } catch (err) {
      setPartnerError("Failed to update partner");
      console.error("Update partner error:", err);
    } finally {
      setPartnerLoading(false);
    }
  };

  // Metrics
  const metrics = [
    {
      label: "Total Partners",
      value: partners.length,
      icon: <FaBuilding />,
      color: theme.primary,
    },
    {
      label: "Active Partners",
      value: partners.filter((p) => p.partner_status === "active").length,
      icon: <FaCheckCircle />,
      color: theme.success,
    },
    {
      label: "Inactive Partners",
      value: partners.filter((p) => p.partner_status === "inactive").length,
      icon: <FaTimes />,
      color: theme.error,
    },
    {
      label: "Suspended Partners",
      value: partners.filter((p) => p.partner_status === "suspended").length,
      icon: <FaExclamationCircle />,
      color: theme.warning,
    },
  ];

  // Add unsponsor handler
  const handleUnsponsor = async (id) => {
    setSponsoredLoading(true);
    setSponsoredError("");
    try {
      await deleteSponsoredOpportunity(id);
      // Refetch all sponsored opportunities
      const res = await getSponsoredOpportunities();
      const sponsoredArr = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data.data)
        ? res.data.data
        : [];
      setSponsoredOpportunities(sponsoredArr);
    } catch (err) {
      setSponsoredError("Failed to unsponsor opportunity");
      console.error("Unsponsor error:", err);
    } finally {
      setSponsoredLoading(false);
    }
  };

  return (
    <AdminLayout>
      {/* Metrics Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {metrics.map((m, i) => (
          <div
            key={i}
            className="rounded-2xl shadow p-4 flex flex-col items-center gap-2 min-w-[120px]"
            style={{ background: theme.surfaceGlass }}
          >
            <div
              className="w-10 h-10 flex items-center justify-center rounded-xl"
              style={{ background: m.color + "22", color: m.color }}
            >
              {m.icon}
            </div>
            <div className="text-2xl font-bold" style={{ color: theme.text }}>
              {m.value}
            </div>
            <div
              className="text-xs font-semibold text-center"
              style={{ color: theme.textLight }}
            >
              {m.label}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setTab("partners")}
          className={`px-5 py-2 rounded-xl font-bold transition ${
            tab === "partners" ? "" : ""
          }`}
          style={
            tab === "partners"
              ? {
                  background: theme.primary,
                  color: theme.surface,
                  boxShadow: "0 2px 8px 0 " + theme.primary + "22",
                }
              : {
                  background: theme.surfaceGlass,
                  color: theme.primary,
                  border: "1px solid " + theme.accent,
                }
          }
        >
          Partners
        </button>
        <button
          onClick={() => setTab("sponsored")}
          className={`px-5 py-2 rounded-xl font-bold transition ${
            tab === "sponsored" ? "" : ""
          }`}
          style={
            tab === "sponsored"
              ? {
                  background: theme.primary,
                  color: theme.surface,
                  boxShadow: "0 2px 8px 0 " + theme.primary + "22",
                }
              : {
                  background: theme.surfaceGlass,
                  color: theme.primary,
                  border: "1px solid " + theme.accent,
                }
          }
        >
          Sponsored Posts
        </button>
      </div>

      {/* Tab Content */}
      {tab === "partners" ? (
        <div
          className="rounded-3xl shadow-xl p-6 backdrop-blur-lg border border-white/40 overflow-x-auto"
          style={{ background: theme.surfaceGlass, borderColor: theme.border }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 justify-between">
            <div className="relative w-full md:w-72">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: theme.textLight }}
              />
              <input
                type="text"
                placeholder="Search partners..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-gray-700 shadow"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                className="rounded-xl border px-3 py-2 text-gray-700 focus:ring-2"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="">Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>

          {/* Partner List */}
          <div className="space-y-4">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-2xl shadow flex items-center gap-4 p-6"
                  style={{ background: theme.surfaceGlass }}
                >
                  <div
                    className="w-12 h-12"
                    style={{ background: theme.accent, borderRadius: 12 }}
                  />
                  <div className="flex-1 space-y-2">
                    <div
                      className="h-4"
                      style={{
                        background: theme.accent,
                        borderRadius: 8,
                        width: "50%",
                      }}
                    />
                    <div
                      className="h-3"
                      style={{
                        background: theme.accent,
                        borderRadius: 8,
                        width: "33%",
                      }}
                    />
                  </div>
                </div>
              ))
            ) : partnerError ? (
              <div className="text-center py-8" style={{ color: theme.error }}>
                {partnerError}
              </div>
            ) : partners.length === 0 ? (
              <div
                className="text-center py-8"
                style={{ color: theme.textLight }}
              >
                No partners found.
              </div>
            ) : filteredPartners.length === 0 ? (
              <div
                className="text-center py-8"
                style={{ color: theme.textLight }}
              >
                No partners match your filters.
              </div>
            ) : (
              filteredPartners.map((p) => (
                <div
                  key={p.id}
                  className="flex flex-col md:flex-row items-center gap-4 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition group border border-white/60"
                  style={{
                    background: theme.surfaceGlass,
                    borderColor: theme.border,
                  }}
                >
                  <div className="flex items-center gap-4 flex-1 w-full">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg"
                      style={{
                        background: `linear-gradient(135deg, ${theme.accent}, ${theme.primaryLight})`,
                        color: theme.primary,
                      }}
                    >
                      {p.company_name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span
                          className="font-bold text-lg truncate max-w-[180px]"
                          style={{ color: theme.text }}
                        >
                          {p.company_name}
                        </span>
                        <span
                          className="px-2 py-1 rounded-lg text-xs font-bold"
                          style={{
                            background:
                              p.partner_status === "active"
                                ? theme.success + "22"
                                : p.partner_status === "inactive"
                                ? theme.warning + "22"
                                : theme.error + "22",
                            color:
                              p.partner_status === "active"
                                ? theme.success
                                : p.partner_status === "inactive"
                                ? theme.warning
                                : theme.error,
                          }}
                        >
                          {p.partner_status}
                        </span>
                      </div>
                      <div
                        className="text-sm truncate"
                        style={{ color: theme.textLight }}
                      >
                        {p.name} • Partner since:{" "}
                        {new Date(p.partner_since).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 items-center mt-4 md:mt-0">
                    <button
                      className="p-2 rounded-lg shadow transition hover:scale-105"
                      style={{
                        background: theme.primary,
                        color: theme.surface,
                      }}
                      title="View Details"
                      onClick={() => setSelectedPartner(p)}
                    >
                      <FaEye />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        <div
          className="rounded-3xl shadow-xl p-6 backdrop-blur-lg border border-white/40 overflow-x-auto"
          style={{ background: theme.surfaceGlass, borderColor: theme.border }}
        >
          <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6 justify-between">
            <div className="relative w-full md:w-72">
              <FaSearch
                className="absolute left-3 top-1/2 -translate-y-1/2"
                style={{ color: theme.textLight }}
              />
              <input
                type="text"
                placeholder="Search sponsored opportunities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border focus:outline-none focus:ring-2 text-gray-700 shadow"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <select
                className="rounded-xl border px-3 py-2 text-gray-700 focus:ring-2"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
                value={filters.status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option value="">Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                className="rounded-xl border px-3 py-2 text-gray-700 focus:ring-2"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
                value={filters.payment_status}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, payment_status: e.target.value }))
                }
              >
                <option value="">Payment</option>
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>
          </div>
          {/* Table UI for sponsored opportunities */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr style={{ color: theme.text }}>
                  <th className="px-4 py-2 text-left">Opportunity</th>
                  <th className="px-4 py-2 text-left">Partner</th>
                  <th className="px-4 py-2 text-left">Status</th>
                  <th className="px-4 py-2 text-left">Payment</th>
                  <th className="px-4 py-2 text-left">From</th>
                  <th className="px-4 py-2 text-left">To</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sponsoredLoading ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8"
                      style={{ color: theme.textLight }}
                    >
                      Loading sponsored opportunities...
                    </td>
                  </tr>
                ) : sponsoredError ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8"
                      style={{ color: theme.error }}
                    >
                      {sponsoredError}
                    </td>
                  </tr>
                ) : sponsoredOpportunities.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="text-center py-8"
                      style={{ color: theme.textLight }}
                    >
                      No sponsored opportunities found.
                    </td>
                  </tr>
                ) : (
                  sponsoredOpportunities
                    .filter((so) => {
                      // Apply search and filters
                      const searchMatch = search
                        ? (so.opportunity?.title || "")
                            .toLowerCase()
                            .includes(search.toLowerCase()) ||
                          (so.partner?.company_name || "")
                            .toLowerCase()
                            .includes(search.toLowerCase())
                        : true;
                      const statusMatch = filters.status
                        ? so.status === filters.status
                        : true;
                      const paymentMatch = filters.payment_status
                        ? so.payment_status === filters.payment_status
                        : true;
                      return searchMatch && statusMatch && paymentMatch;
                    })
                    .map((so) => (
                      <tr key={so.id} style={{ color: theme.text }}>
                        <td className="px-4 py-2 font-semibold">
                          {so.opportunity?.title || "-"}
                        </td>
                        <td className="px-4 py-2">
                          {so.partner?.company_name || "-"}
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className="px-2 py-1 rounded-lg text-xs font-bold"
                            style={{
                              background:
                                so.status === "approved"
                                  ? theme.success + "22"
                                  : so.status === "pending"
                                  ? theme.warning + "22"
                                  : theme.error + "22",
                              color:
                                so.status === "approved"
                                  ? theme.success
                                  : so.status === "pending"
                                  ? theme.warning
                                  : theme.error,
                            }}
                          >
                            {so.status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          <span
                            className="px-2 py-1 rounded-lg text-xs font-bold"
                            style={{
                              background:
                                so.payment_status === "paid"
                                  ? theme.success + "22"
                                  : theme.warning + "22",
                              color:
                                so.payment_status === "paid"
                                  ? theme.success
                                  : theme.warning,
                            }}
                          >
                            {so.payment_status}
                          </span>
                        </td>
                        <td className="px-4 py-2">
                          {so.sponsored_from
                            ? new Date(so.sponsored_from).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-2">
                          {so.sponsored_to
                            ? new Date(so.sponsored_to).toLocaleDateString()
                            : "-"}
                        </td>
                        <td className="px-4 py-2">
                          <button
                            className="p-2 rounded-lg shadow transition"
                            style={{
                              background: theme.error + "22",
                              color: theme.error,
                            }}
                            title="Unsponsor"
                            onClick={() => handleUnsponsor(so.id)}
                            disabled={sponsoredLoading}
                          >
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Partner Details Modal */}
      {selectedPartner && (
        <Modal onClose={() => setSelectedPartner(null)}>
          <div className="p-6 max-w-4xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold" style={{ color: theme.primary }}>
              Partner Details
            </h2>
              <div className="flex gap-2">
                <button
                  className="px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
                  style={{
                    background: theme.success + "22",
                    color: theme.success,
                  }}
                  onClick={async () => {
                    try {
                      await updatePartner(selectedPartner.id, {
                        partner_status: "active",
                        verification_notes: "Partner approved by admin",
                      });
                      setPartners(partners.map(p => 
                        p.id === selectedPartner.id 
                          ? { ...p, partner_status: "active" }
                          : p
                      ));
                      setSelectedPartner(null);
                    } catch (err) {
                      console.error("Failed to approve partner:", err);
                    }
                  }}
                >
                  <FaCheck /> Approve
                </button>
                <button
                  className="px-4 py-2 rounded-lg shadow transition flex items-center gap-2"
                  style={{
                    background: theme.error + "22",
                    color: theme.error,
                  }}
                  onClick={async () => {
                    try {
                      await updatePartner(selectedPartner.id, {
                        partner_status: "suspended",
                        verification_notes: "Partner suspended by admin",
                      });
                      setPartners(partners.map(p => 
                        p.id === selectedPartner.id 
                          ? { ...p, partner_status: "suspended" }
                          : p
                      ));
                      setSelectedPartner(null);
                    } catch (err) {
                      console.error("Failed to suspend partner:", err);
                    }
                  }}
                >
                  <FaTimes /> Reject
                </button>
              </div>
            </div>

            {metricsError && (
              <div
                className="mb-4 p-3 rounded-lg text-sm"
                style={{ background: theme.error + "22", color: theme.error }}
              >
                {metricsError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Company Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
                  Company Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FaBuilding className="mt-1" style={{ color: theme.primary }} />
                    <div>
                      <div className="font-medium" style={{ color: theme.text }}>
                        Company Name
                      </div>
                      <div style={{ color: theme.textLight }}>
                        {selectedPartner.company_name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaGlobe className="mt-1" style={{ color: theme.primary }} />
                    <div>
                      <div className="font-medium" style={{ color: theme.text }}>
                        Website
                      </div>
                      <a
                        href={selectedPartner.company_website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {selectedPartner.company_website}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaIdCard className="mt-1" style={{ color: theme.primary }} />
                    <div>
                      <div className="font-medium" style={{ color: theme.text }}>
                        Business Registration
                      </div>
                      <div style={{ color: theme.textLight }}>
                        {selectedPartner.business_registration_number}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaIdCard className="mt-1" style={{ color: theme.primary }} />
                    <div>
                      <div className="font-medium" style={{ color: theme.text }}>
                        Tax ID
                      </div>
                      <div style={{ color: theme.textLight }}>
                        {selectedPartner.tax_identification_number}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="mt-1" style={{ color: theme.primary }} />
                    <div>
                      <div className="font-medium" style={{ color: theme.text }}>
                        Business Address
                      </div>
                      <div style={{ color: theme.textLight }}>
                        {selectedPartner.business_address}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
                  Contact Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <FaUser className="mt-1" style={{ color: theme.primary }} />
                    <div>
                      <div className="font-medium" style={{ color: theme.text }}>
                        Contact Person
                      </div>
                      <div style={{ color: theme.textLight }}>
                        {selectedPartner.contact_person_name}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaUser className="mt-1" style={{ color: theme.primary }} />
                    <div>
                      <div className="font-medium" style={{ color: theme.text }}>
                        Position
                      </div>
                      <div style={{ color: theme.textLight }}>
                        {selectedPartner.contact_person_position}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <FaPhone className="mt-1" style={{ color: theme.primary }} />
                    <div>
                      <div className="font-medium" style={{ color: theme.text }}>
                        Phone
                      </div>
                      <div style={{ color: theme.textLight }}>
                        {selectedPartner.contact_person_phone}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Partner Metrics */}
            {metricsLoading ? (
                <div className="col-span-2 text-center py-8" style={{ color: theme.text }}>
                  Loading metrics...
                </div>
            ) : (
              partnerMetrics && (
                  <div className="col-span-2 grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div
                    className="p-4 rounded-xl"
                    style={{ background: theme.surfaceGlass }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FaListAlt style={{ color: theme.primary }} />
                      <span className="font-semibold" style={{ color: theme.text }}>Total Sponsored</span>
                    </div>
                      <div className="text-2xl font-bold" style={{ color: theme.text }}>
                      {partnerMetrics.total_sponsored}
                    </div>
                  </div>
                  <div
                    className="p-4 rounded-xl"
                    style={{ background: theme.surfaceGlass }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FaCheckCircle style={{ color: theme.success }} />
                      <span className="font-semibold" style={{ color: theme.text }}>Active Sponsored</span>
                    </div>
                      <div className="text-2xl font-bold" style={{ color: theme.text }}>
                      {partnerMetrics.active_sponsored}
                    </div>
                  </div>
                  <div
                    className="p-4 rounded-xl"
                    style={{ background: theme.surfaceGlass }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FaMoneyBillWave style={{ color: theme.warning }} />
                      <span className="font-semibold" style={{ color: theme.text }}>Total Spend</span>
                    </div>
                      <div className="text-2xl font-bold" style={{ color: theme.text }}>
                      ${partnerMetrics.total_spend}
                    </div>
                  </div>
                  <div
                    className="p-4 rounded-xl"
                    style={{ background: theme.surfaceGlass }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <FaCalendarAlt style={{ color: theme.info }} />
                      <span className="font-semibold" style={{ color: theme.text }}>Partner Since</span>
                    </div>
                      <div className="text-2xl font-bold" style={{ color: theme.text }}>
                        {new Date(partnerMetrics.partner_since).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              )
            )}

              {/* Verification Documents */}
              {selectedPartner.verification_documents && (
                <div className="col-span-2 space-y-4">
                  <h3 className="text-lg font-semibold" style={{ color: theme.text }}>
                    Verification Documents
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {JSON.parse(selectedPartner.verification_documents).map((doc, index) => (
                      <a
                        key={index}
                        href={doc}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl hover:shadow-lg transition"
                        style={{ background: theme.surfaceGlass }}
                      >
                        <div className="flex items-center gap-2">
                          <FaIdCard style={{ color: theme.primary }} />
                          <span style={{ color: theme.text }}>
                            Document {index + 1}
                          </span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 justify-end mt-6">
              <button
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 font-semibold shadow"
                onClick={() => setSelectedPartner(null)}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Edit Partner Modal */}
      {showPartnerModal && (
        <Modal onClose={() => setShowPartnerModal(null)}>
          <div className="p-6">
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: theme.primary }}
            >
              Edit Partner
            </h2>
            {partnerError && (
              <div
                className="mb-4 p-3 rounded-lg text-sm"
                style={{ background: theme.error + "22", color: theme.error }}
              >
                {partnerError}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Company Name
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border bg-white/80 text-gray-900 shadow"
                  style={{ borderColor: theme.border }}
                  value={partnerForm.company_name}
                  onChange={(e) =>
                    setPartnerForm((f) => ({
                      ...f,
                      company_name: e.target.value,
                    }))
                  }
                  disabled={partnerLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Company Description
                </label>
                <textarea
                  className="w-full px-4 py-2 rounded-lg border bg-white/80 text-gray-900 shadow"
                  style={{ borderColor: theme.border }}
                  value={partnerForm.company_description}
                  onChange={(e) =>
                    setPartnerForm((f) => ({
                      ...f,
                      company_description: e.target.value,
                    }))
                  }
                  disabled={partnerLoading}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Company Website
                </label>
                <input
                  type="url"
                  className="w-full px-4 py-2 rounded-lg border bg-white/80 text-gray-900 shadow"
                  style={{ borderColor: theme.border }}
                  value={partnerForm.company_website}
                  onChange={(e) =>
                    setPartnerForm((f) => ({
                      ...f,
                      company_website: e.target.value,
                    }))
                  }
                  disabled={partnerLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Company Logo
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full px-4 py-2 rounded-lg border bg-white/80 text-gray-900 shadow"
                  style={{ borderColor: theme.border }}
                  onChange={(e) =>
                    setPartnerForm((f) => ({
                      ...f,
                      company_logo: e.target.files[0],
                    }))
                  }
                  disabled={partnerLoading}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">
                  Partner Status
                </label>
                <select
                  className="w-full px-4 py-2 rounded-lg border bg-white/80 text-gray-900 shadow"
                  style={{ borderColor: theme.border }}
                  value={partnerForm.partner_status}
                  onChange={(e) =>
                    setPartnerForm((f) => ({
                      ...f,
                      partner_status: e.target.value,
                    }))
                  }
                  disabled={partnerLoading}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-6">
              <button
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 font-semibold shadow"
                onClick={() => setShowPartnerModal(null)}
                disabled={partnerLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[#5b2be7] text-white font-semibold shadow flex items-center gap-2"
                onClick={handleUpdatePartner}
                disabled={partnerLoading}
              >
                {partnerLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div
        className="bg-white/90 rounded-2xl shadow-2xl p-8 min-w-[320px] max-w-full relative"
        style={{
          background: theme.surfaceGlass,
          border: `1px solid ${theme.border}`,
        }}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl"
        >
          <FaTimesCircle />
        </button>
        {children}
      </div>
    </div>
  );
}
