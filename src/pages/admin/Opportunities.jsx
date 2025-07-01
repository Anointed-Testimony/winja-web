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
  FaEye,
} from "react-icons/fa";
import theme from "../../theme";
import {
  getOpportunityTypes,
  createOpportunityType,
  updateOpportunityType,
  deleteOpportunityType,
  getOpportunities,
  createOpportunity,
  updateOpportunity,
  deleteOpportunity,
  getSponsoredOpportunities,
  createSponsoredOpportunity,
  updateSponsoredOpportunity,
  getAllPartners,
} from "../../api";
import { Editor } from '@tinymce/tinymce-react';

const mockTypes = [
  { id: 1, name: "Grant", count: 12 },
  { id: 2, name: "Scholarship", count: 8 },
  { id: 3, name: "Job", count: 5 },
];
const mockOpportunities = [
  {
    id: 1,
    title: "Women in Tech Grant",
    sponsor: "TechWomen",
    category: "Grant",
    status: "Active",
    expiry: "2024-07-30",
    verified: true,
    submittedBy: "user",
  },
  {
    id: 2,
    title: "Undergraduate Scholarship",
    sponsor: "UBA Foundation",
    category: "Scholarship",
    status: "Pending",
    expiry: "2024-08-15",
    verified: false,
    submittedBy: "partner",
  },
  {
    id: 3,
    title: "Lagos Youth Empowerment",
    sponsor: "Lagos State",
    category: "Job",
    status: "Expired",
    expiry: "2024-05-01",
    verified: false,
    submittedBy: "user",
  },
];
const mockSponsors = [
  "UBA Foundation",
  "TechWomen",
  "Lagos State",
  "XYZ Foundation",
];

export default function Opportunities() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("listings");
  const [types, setTypes] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [selected, setSelected] = useState([]);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    status: "",
    verified: "",
  });
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [showEditTypeModal, setShowEditTypeModal] = useState(null);
  const [typeName, setTypeName] = useState("");
  const [showListingModal, setShowListingModal] = useState(false);
  const [showEditListingModal, setShowEditListingModal] = useState(null);
  const [listingForm, setListingForm] = useState({
    title: "",
    partner_id: "",
    verified: false,
    description: "",
    eligibility: "",
    category: "",
    status: "Active",
    expiry: "",
    image: null,
    application_link: "",
  });
  const [typeLoading, setTypeLoading] = useState(false);
  const [typeError, setTypeError] = useState("");
  const [deleteTypeId, setDeleteTypeId] = useState(null);
  const [listingLoading, setListingLoading] = useState(false);
  const [listingError, setListingError] = useState("");
  const [deleteListingId, setDeleteListingId] = useState(null);
  const [showSponsorModal, setShowSponsorModal] = useState(null);
  const [sponsorStatus, setSponsorStatus] = useState("pending");
  const [sponsorPayment, setSponsorPayment] = useState("unpaid");
  const [sponsoredOpportunities, setSponsoredOpportunities] = useState([]);
  const [sponsorLoading, setSponsorLoading] = useState(false);
  const [sponsorError, setSponsorError] = useState("");
  const [partners, setPartners] = useState([]);
  const [showSponsoredDetailsModal, setShowSponsoredDetailsModal] = useState(null);
  const [sponsoredDetails, setSponsoredDetails] = useState(null);
  const [sponsoredDetailsLoading, setSponsoredDetailsLoading] = useState(false);

  useEffect(() => {
    async function fetchTypesAndOpportunities() {
      setTypeLoading(true);
      setListingLoading(true);
      setSponsorLoading(true);
      setTypeError("");
      setListingError("");
      setSponsorError("");
      try {
        const [typesRes, oppsRes, sponsoredRes, partnersRes] =
          await Promise.all([
            getOpportunityTypes(),
            getOpportunities(),
            getSponsoredOpportunities(),
            getAllPartners(),
          ]);
        // Defensive: handle both array and paginated/object response
        const typesArr = Array.isArray(typesRes.data)
          ? typesRes.data
          : Array.isArray(typesRes.data.data)
          ? typesRes.data.data
          : [];
        setTypes(typesArr);
        setOpportunities(oppsRes.data);
        // Debug sponsored opportunities
        const sponsoredArr = Array.isArray(sponsoredRes.data)
          ? sponsoredRes.data
          : Array.isArray(sponsoredRes.data.data)
          ? sponsoredRes.data.data
          : [];
        const sponsoredIds = sponsoredArr.map((so) => so.opportunity_id);
        setSponsoredOpportunities(sponsoredIds);
        console.log("Fetched sponsored opportunities:", sponsoredArr);
        console.log("Sponsored opportunity IDs:", sponsoredIds);
        const partnersArr = Array.isArray(partnersRes.data)
          ? partnersRes.data
          : Array.isArray(partnersRes.data.data)
          ? partnersRes.data.data
          : [];
        setPartners(partnersArr);
        if (partnersArr.length === 0) {
          setSponsorError("No partners found. Please add partners first.");
        }
        if (sponsoredIds.length === 0) {
          setSponsorError("No sponsored opportunities found.");
        }
      } catch (err) {
        setTypeError("Failed to load types");
        setListingError("Failed to load opportunities");
        setSponsorError("Failed to load sponsored opportunities");
        console.error("Error fetching sponsored opportunities or types:", err);
      } finally {
        setTypeLoading(false);
        setListingLoading(false);
        setSponsorLoading(false);
        setLoading(false);
      }
    }
    fetchTypesAndOpportunities();
  }, []);

  // Metrics
  const metrics = [
    {
      label: "Opportunity Types",
      value: types.length,
      icon: <FaLayerGroup />,
      color: theme.primary,
    },
    {
      label: "Total Opportunities",
      value: opportunities.length,
      icon: <FaListAlt />,
      color: theme.info,
    },
    {
      label: "Active",
      value: opportunities.filter((o) => o.status === "Active").length,
      icon: <FaCheckCircle />,
      color: theme.success,
    },
    {
      label: "Pending",
      value: opportunities.filter((o) => o.status === "Pending").length,
      icon: <FaExclamationCircle />,
      color: theme.warning,
    },
    {
      label: "Expired",
      value: opportunities.filter((o) => o.status === "Expired").length,
      icon: <FaTimes />,
      color: theme.error,
    },
    {
      label: "Verified",
      value: opportunities.filter((o) => o.verified).length,
      icon: <FaCheckCircle />,
      color: theme.success,
    },
    {
      label: "Unverified",
      value: opportunities.filter((o) => !o.verified).length,
      icon: <FaExclamationCircle />,
      color: theme.warning,
    },
  ];

  // Filter opportunities based on search and filters
  const filteredOpportunities = opportunities.filter((o) => {
    // Search filter
    const searchMatch = search
      ? o.title.toLowerCase().includes(search.toLowerCase()) ||
        o.sponsor.toLowerCase().includes(search.toLowerCase()) ||
        o.type?.name.toLowerCase().includes(search.toLowerCase())
      : true;

    // Status filter
    const statusMatch = filters.status ? o.status === filters.status : true;

    // Verification filter
    const verifiedMatch =
      filters.verified === "Verified"
        ? o.verified
        : filters.verified === "Unverified"
        ? !o.verified
        : true;

    return searchMatch && statusMatch && verifiedMatch;
  });

  // Add Type
  const handleAddType = async () => {
    if (!typeName.trim()) return;
    setTypeLoading(true);
    setTypeError("");
    try {
      const res = await createOpportunityType({ name: typeName });
      setTypes([...types, res.data]);
      setTypeName("");
      setShowTypeModal(false);
    } catch (err) {
      setTypeError("Failed to add type");
    } finally {
      setTypeLoading(false);
    }
  };
  // Edit Type
  const handleEditType = async () => {
    setTypeLoading(true);
    setTypeError("");
    try {
      const res = await updateOpportunityType(showEditTypeModal, {
        name: typeName,
      });
      setTypes(types.map((t) => (t.id === showEditTypeModal ? res.data : t)));
      setShowEditTypeModal(null);
      setTypeName("");
    } catch (err) {
      setTypeError("Failed to update type");
    } finally {
      setTypeLoading(false);
    }
  };
  // Delete Type
  const handleDeleteType = async (id) => {
    setTypeLoading(true);
    setTypeError("");
    try {
      await deleteOpportunityType(id);
      setTypes(types.filter((t) => t.id !== id));
    } catch (err) {
      setTypeError("Failed to delete type");
    } finally {
      setTypeLoading(false);
    }
  };
  // Add Listing
  const handleAddListing = async () => {
    if (
      !listingForm.title.trim() ||
      !listingForm.partner_id ||
      !listingForm.category
    )
      return;
    setListingLoading(true);
    setListingError("");
    try {
      console.log('Form state before submission:', listingForm);
      console.log('Image file:', listingForm.image);
      
      const data = {
        ...listingForm,
        opportunity_type_id: listingForm.category,
        category: undefined, // remove category field
      };
      
      console.log('Data being sent to API:', data);
      const res = await createOpportunity(data);
      console.log('API Response:', res);
      
      setOpportunities([...opportunities, res.data]);
      setListingForm({
        title: "",
        partner_id: "",
        verified: false,
        description: "",
        eligibility: "",
        category: "",
        status: "Active",
        expiry: "",
        image: null,
        application_link: "",
      });
      setShowListingModal(false);
    } catch (err) {
      console.error('Add listing error details:', err);
      setListingError("Failed to add listing");
    } finally {
      setListingLoading(false);
    }
  };
  // Edit Listing
  const handleEditListing = async () => {
    setListingLoading(true);
    setListingError("");
    try {
      const data = {
        ...listingForm,
        opportunity_type_id: listingForm.category,
        category: undefined,
        // Do not send sponsor
      };
      const res = await updateOpportunity(showEditListingModal, data);
      setOpportunities(
        opportunities.map((o) => (o.id === showEditListingModal ? res.data : o))
      );
      setShowEditListingModal(null);
      setListingForm({
        title: "",
        partner_id: "",
        verified: false,
        description: "",
        eligibility: "",
        category: "",
        status: "Active",
        expiry: "",
        image: null,
        application_link: "",
      });
    } catch (err) {
      setListingError("Failed to update listing");
    } finally {
      setListingLoading(false);
    }
  };
  // Delete Listing
  const handleDeleteListing = async (id) => {
    setListingLoading(true);
    setListingError("");
    try {
      await deleteOpportunity(id);
      setOpportunities(opportunities.filter((o) => o.id !== id));
    } catch (err) {
      setListingError("Failed to delete listing");
    } finally {
      setListingLoading(false);
    }
  };
  // Approve/Reject/Verify
  const handleStatus = async (id, status) => {
    setListingLoading(true);
    setListingError("");
    try {
      const opp = opportunities.find((o) => o.id === id);
      const data = {
        ...opp,
        status,
        opportunity_type_id: opp.type?.id || opp.opportunity_type_id,
      };
      const res = await updateOpportunity(id, data);
      setOpportunities(opportunities.map((o) => (o.id === id ? res.data : o)));
    } catch (err) {
      setListingError("Failed to update status");
      console.error("Status update error:", err);
    } finally {
      setListingLoading(false);
    }
  };
  const handleVerify = (id, verified) => {
    setOpportunities(
      opportunities.map((o) => (o.id === id ? { ...o, verified } : o))
    );
  };

  // Handle making an opportunity sponsored
  const handleMakeSponsored = async (opportunityId) => {
    setSponsorLoading(true);
    setSponsorError("");
    try {
      // Find the opportunity and get its partner_id
      const opp = opportunities.find((o) => o.id === opportunityId);
      console.log("Opportunity object for sponsorship:", opp);
      const data = {
        opportunity_id: opportunityId,
        partner_id: opp && opp.partner_id ? opp.partner_id : null,
        status: sponsorStatus,
        payment_status: sponsorPayment,
        sponsored_from: new Date().toISOString(),
        sponsored_to: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000
        ).toISOString(), // 30 days from now
      };
      await createSponsoredOpportunity(data);
      // Refetch sponsored opportunities from backend
      const sponsoredRes = await getSponsoredOpportunities();
      const sponsoredArr = Array.isArray(sponsoredRes.data)
        ? sponsoredRes.data
        : Array.isArray(sponsoredRes.data.data)
        ? sponsoredRes.data.data
        : [];
      const sponsoredIds = sponsoredArr.map((so) => so.opportunity_id);
      setSponsoredOpportunities(sponsoredIds);
      setShowSponsorModal(null);
    } catch (err) {
      let msg = "Failed to make opportunity sponsored";
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setSponsorError(msg);
      console.error("Sponsor error:", err, err.response && err.response.data);
    } finally {
      setSponsorLoading(false);
    }
  };

  // Handle viewing sponsored opportunity details
  const handleViewSponsoredDetails = async (opportunityId) => {
    setSponsoredDetailsLoading(true);
    try {
      // Find the sponsored opportunity from the list
      const sponsoredRes = await getSponsoredOpportunities();
      const sponsoredArr = Array.isArray(sponsoredRes.data)
        ? sponsoredRes.data
        : Array.isArray(sponsoredRes.data.data)
        ? sponsoredRes.data.data
        : [];
      const sponsoredOpp = sponsoredArr.find(so => so.opportunity_id === opportunityId);
      
      if (sponsoredOpp) {
        setSponsoredDetails(sponsoredOpp);
        setShowSponsoredDetailsModal(opportunityId);
      }
    } catch (err) {
      console.error("Error fetching sponsored details:", err);
    } finally {
      setSponsoredDetailsLoading(false);
    }
  };

  const handleOpenAddModal = () => {
    setListingForm({
      title: "",
      partner_id: "",
      verified: false,
      description: "",
      eligibility: "",
      category: "",
      status: "Active",
      expiry: "",
      image: null,
      application_link: "",
    });
    setShowListingModal(true);
  };

  return (
    <AdminLayout>
      {/* Metrics Section */}
      <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-7 gap-4 mb-8">
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
          onClick={() => setTab("listings")}
          className={`px-5 py-2 rounded-xl font-bold transition ${
            tab === "listings" ? "" : ""
          }`}
          style={
            tab === "listings"
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
          Listings
        </button>
        <button
          onClick={() => setTab("types")}
          className={`px-5 py-2 rounded-xl font-bold transition ${
            tab === "types" ? "" : ""
          }`}
          style={
            tab === "types"
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
          Opportunity Types
        </button>
      </div>
      {/* Tab Content */}
      {tab === "listings" ? (
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
                placeholder="Search opportunities..."
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
                <option>Active</option>
                <option>Pending</option>
                <option>Expired</option>
              </select>
              <select
                className="rounded-xl border px-3 py-2 text-gray-700 focus:ring-2"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
                value={filters.verified}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, verified: e.target.value }))
                }
              >
                <option value="">Verification</option>
                <option>Verified</option>
                <option>Unverified</option>
              </select>
              <button
                className="flex items-center gap-1 px-3 py-2 rounded-xl font-semibold shadow transition"
                style={{ background: theme.accent, color: theme.primary }}
              >
                <FaFilter /> More Filters
              </button>
            </div>
            <button
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold shadow transition whitespace-nowrap"
              style={{ background: theme.primary, color: theme.surface }}
              onClick={handleOpenAddModal}
            >
              <FaPlus /> Add New Listing
            </button>
          </div>
          {/* Card-based List */}
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
            ) : opportunities.length === 0 ? (
              <div
                className="text-center py-8"
                style={{ color: theme.textLight }}
              >
                No opportunities found.
              </div>
            ) : filteredOpportunities.length === 0 ? (
              <div
                className="text-center py-8"
                style={{ color: theme.textLight }}
              >
                No opportunities match your filters.
              </div>
            ) : (
              filteredOpportunities.map((o) => {
                const isSponsored = sponsoredOpportunities.includes(o.id);
                console.log(`Opportunity ${o.id} sponsored:`, isSponsored);
                return (
                  <div
                    key={o.id}
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
                        {o.title[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span
                            className="font-bold text-lg truncate max-w-[180px]"
                            style={{ color: theme.text }}
                          >
                            {o.title}
                          </span>
                          <span
                            className="px-2 py-1 rounded-lg text-xs font-bold"
                            style={{
                              background:
                                o.status === "Active"
                                  ? theme.success + "22"
                                  : o.status === "Pending"
                                  ? theme.warning + "22"
                                  : theme.border,
                              color:
                                o.status === "Active"
                                  ? theme.success
                                  : o.status === "Pending"
                                  ? theme.warning
                                  : theme.textLight,
                            }}
                          >
                            {o.status}
                          </span>
                          {o.verified ? (
                            <FaCheckCircle
                              style={{ color: theme.success }}
                              title="Verified"
                            />
                          ) : (
                            <FaExclamationCircle
                              style={{ color: theme.warning }}
                              title="Unverified"
                            />
                          )}
                        </div>
                        <div
                          className="text-sm truncate"
                          style={{ color: theme.textLight }}
                        >
                          {/* Show partner name if available */}
                          {o.partner?.company_name ? (
                            <>{o.partner.company_name} • </>
                          ) : null}
                          {o.type?.name} • Expires: {o.expiry}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 items-center mt-4 md:mt-0">
                      <button
                        className="p-2 rounded-lg shadow transition"
                        style={{
                          background: theme.accent,
                          color: theme.primary,
                        }}
                        title="Edit"
                        onClick={() => {
                          setShowEditListingModal(o.id);
                          setListingForm({ ...o, category: o.type?.id || "" });
                        }}
                        disabled={listingLoading}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="p-2 rounded-lg shadow transition"
                        style={{
                          background: theme.success + "22",
                          color: theme.success,
                        }}
                        title="Approve"
                        onClick={async () => {
                          await handleStatus(o.id, "Active");
                        }}
                        disabled={listingLoading || o.status === "Active"}
                      >
                        <FaCheck />
                      </button>
                      <button
                        className="p-2 rounded-lg shadow transition"
                        style={{
                          background: theme.warning + "22",
                          color: theme.warning,
                        }}
                        title="Reject"
                        onClick={async () => {
                          await handleStatus(o.id, "Pending");
                        }}
                        disabled={listingLoading || o.status === "Pending"}
                      >
                        <FaTimes />
                      </button>
                      <button
                        className="p-2 rounded-lg shadow transition"
                        style={{
                          background: theme.error + "22",
                          color: theme.error,
                        }}
                        title="Delete"
                        onClick={() => setDeleteListingId(o.id)}
                        disabled={listingLoading}
                      >
                        <FaTrash />
                      </button>
                      {isSponsored ? (
                        <div className="flex gap-2">
                          <button
                            className="p-2 rounded-lg shadow transition"
                          style={{
                              background: theme.success,
                              color: theme.surface,
                            }}
                            title="Sponsored"
                            disabled={listingLoading}
                          >
                            <FaStar />
                          </button>
                          <button
                            className="p-2 rounded-lg shadow transition"
                            style={{
                              background: theme.info,
                              color: theme.surface,
                          }}
                            title="View Details"
                            onClick={() => handleViewSponsoredDetails(o.id)}
                            disabled={sponsoredDetailsLoading}
                          >
                            <FaEye />
                          </button>
                        </div>
                      ) : (
                        <button
                          className="p-2 rounded-lg shadow transition"
                          style={{
                            background: theme.accent,
                            color: theme.primary,
                          }}
                          title="Make Sponsored"
                          onClick={() => setShowSponsorModal(o.id)}
                          disabled={listingLoading}
                        >
                          <FaStar />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
          {/* Bulk Actions */}
          {selected.length > 0 && (
            <div className="mt-4 flex gap-2">
              <button
                className="px-4 py-2 rounded-lg font-semibold transition"
                style={{ background: theme.success, color: theme.surface }}
              >
                Approve Selected
              </button>
              <button
                className="px-4 py-2 rounded-lg font-semibold transition"
                style={{ background: theme.warning, color: theme.surface }}
              >
                Reject Selected
              </button>
              <button
                className="px-4 py-2 rounded-lg font-semibold transition"
                style={{ background: theme.error, color: theme.surface }}
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
      ) : (
        <div
          className="rounded-3xl shadow-xl p-6 backdrop-blur-lg border border-white/40 overflow-x-auto"
          style={{ background: theme.surfaceGlass, borderColor: theme.border }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold" style={{ color: theme.primary }}>
              Opportunity Types
            </h2>
            <button
              className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold shadow transition"
              style={{ background: theme.primary, color: theme.surface }}
              onClick={() => setShowTypeModal(true)}
            >
              <FaPlus /> Add New Type
            </button>
          </div>
          <div className="space-y-4">
            {typeLoading ? (
              <div
                className="text-center py-8"
                style={{ color: theme.textLight }}
              >
                Loading types...
              </div>
            ) : typeError ? (
              <div className="text-center py-8" style={{ color: theme.error }}>
                {typeError}
              </div>
            ) : types.length === 0 ? (
              <div
                className="text-center py-8"
                style={{ color: theme.textLight }}
              >
                No types found.
              </div>
            ) : (
              types.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center gap-4 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition group border border-white/60"
                  style={{
                    background: theme.surfaceGlass,
                    borderColor: theme.border,
                  }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl font-bold shadow-lg"
                    style={{
                      background: `linear-gradient(135deg, ${theme.accent}, ${theme.primaryLight})`,
                      color: theme.primary,
                    }}
                  >
                    {t.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span
                      className="font-bold text-lg truncate max-w-[180px]"
                      style={{ color: theme.text }}
                    >
                      {t.name}
                    </span>
                    <span
                      className="ml-3 px-2 py-1 rounded-lg text-xs font-bold"
                      style={{ background: theme.accent, color: theme.primary }}
                    >
                      {t.count} Listings
                    </span>
                  </div>
                  <div className="flex gap-2 items-center">
                    <button
                      className="p-2 rounded-lg shadow transition"
                      style={{ background: theme.accent, color: theme.primary }}
                      title="Edit"
                      onClick={() => {
                        setShowEditTypeModal(t.id);
                        setTypeName(t.name);
                      }}
                      disabled={typeLoading}
                    >
                      <FaEdit />
                    </button>
                    <button
                      className="p-2 rounded-lg shadow transition"
                      style={{
                        background: theme.error + "22",
                        color: theme.error,
                      }}
                      title="Delete"
                      onClick={() => setDeleteTypeId(t.id)}
                      disabled={typeLoading}
                    >
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {showListingModal && (
        <Modal onClose={() => setShowListingModal(false)}>
          <h3
            className="text-xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
            Add New Listing
          </h3>
          {sponsorError && (
            <div className="mb-2 text-red-500 text-sm font-semibold">
              {sponsorError}
            </div>
          )}
          <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await handleAddListing();
            }}
          >
            <input
              className="rounded-lg border px-4 py-2"
              style={{
                borderColor: theme.border,
                background: theme.surfaceGlass,
                color: theme.text,
              }}
              placeholder="Title"
              value={listingForm.title}
              onChange={(e) =>
                setListingForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
            <div className="flex gap-2 items-center">
              <select
                className="rounded-lg border px-4 py-2 flex-1"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
                value={listingForm.partner_id || ""}
                onChange={(e) =>
                  setListingForm((f) => ({ ...f, partner_id: e.target.value }))
                }
                required
              >
                <option value="">
                  {partners.length === 0
                    ? "No partners available"
                    : "Select Sponsor (Partner)"}
                </option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company_name}
                  </option>
                ))}
              </select>
              <label
                className="flex items-center gap-2 text-sm"
                style={{ color: theme.textLight }}
              >
                <input
                  type="checkbox"
                  checked={listingForm.verified}
                  onChange={(e) =>
                    setListingForm((f) => ({
                      ...f,
                      verified: e.target.checked,
                    }))
                  }
                />{" "}
                Verified
              </label>
            </div>
            <label className="font-semibold mb-1" style={{ color: theme.primary }}>
              Description
            </label>
            <Editor
              apiKey="mkyaup5rx10x4g0h9h3iqvea4fx46wl690xfxnfu1c1ssrev"
              value={listingForm.description}
              init={{
                plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                menubar: false,
                height: 300,
              }}
              onEditorChange={(content) => setListingForm((f) => ({ ...f, description: content }))}
            />
            <label className="font-semibold mb-1 mt-4" style={{ color: theme.primary }}>
              Eligibility
            </label>
            <Editor
              apiKey="mkyaup5rx10x4g0h9h3iqvea4fx46wl690xfxnfu1c1ssrev"
              value={listingForm.eligibility}
              init={{
                plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                menubar: false,
                height: 200,
              }}
              onEditorChange={(content) => setListingForm((f) => ({ ...f, eligibility: content }))}
            />
            <input
              className="rounded-lg border px-4 py-2"
              style={{
                borderColor: theme.border,
                background: theme.surfaceGlass,
                color: theme.text,
              }}
              placeholder="Application Link (optional)"
              value={listingForm.application_link}
              onChange={(e) =>
                setListingForm((f) => ({
                  ...f,
                  application_link: e.target.value,
                }))
              }
            />
            <input
              type="file"
              accept="image/*"
              className="rounded-lg border px-4 py-2"
              style={{
                borderColor: theme.border,
                background: theme.surfaceGlass,
                color: theme.text,
              }}
              onChange={(e) => {
                console.log('File input change event:', e.target.files[0]);
                setListingForm((f) => ({ ...f, image: e.target.files[0] }));
              }}
              required
            />
            <div className="flex gap-2">
              <input
                type="date"
                className="rounded-lg border px-4 py-2 flex-1"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
                value={listingForm.expiry}
                onChange={(e) =>
                  setListingForm((f) => ({ ...f, expiry: e.target.value }))
                }
                required
              />
              <select
                className="rounded-lg border px-4 py-2 flex-1"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
                value={listingForm.status}
                onChange={(e) =>
                  setListingForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option>Active</option>
                <option>Pending</option>
                <option>Expired</option>
              </select>
              <select
                className="rounded-lg border px-4 py-2 flex-1"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
                value={listingForm.category}
                onChange={(e) =>
                  setListingForm((f) => ({ ...f, category: e.target.value }))
                }
                required
              >
                <option value="">Select Category</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg font-semibold transition"
                style={{ background: theme.accent, color: theme.primary }}
                onClick={() => setShowListingModal(false)}
                disabled={listingLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                style={{ background: theme.primary, color: theme.surface }}
                disabled={listingLoading}
              >
                {listingLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Adding...
                  </span>
                ) : (
                  "Add Listing"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {showEditListingModal && (
        <Modal onClose={() => setShowEditListingModal(null)}>
          <h3
            className="text-xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
            Edit Listing
          </h3>
          {listingError && (
            <div className="mb-2 text-red-500 text-sm font-semibold">
              {listingError}
            </div>
          )}
          <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              await handleEditListing();
            }}
          >
            <input
              className="rounded-lg border px-4 py-2"
              style={{
                borderColor: theme.border,
                background: theme.surfaceGlass,
                color: theme.text,
              }}
              placeholder="Title"
              value={listingForm.title}
              onChange={(e) =>
                setListingForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
            <div className="flex gap-2 items-center">
              <select
                className="rounded-lg border px-4 py-2 flex-1"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
                value={listingForm.partner_id || ""}
                onChange={(e) =>
                  setListingForm((f) => ({ ...f, partner_id: e.target.value }))
                }
                required
              >
                <option value="">
                  {partners.length === 0
                    ? "No partners available"
                    : "Select Sponsor (Partner)"}
                </option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.company_name}
                  </option>
                ))}
              </select>
              <label
                className="flex items-center gap-2 text-sm"
                style={{ color: theme.textLight }}
              >
                <input
                  type="checkbox"
                  checked={listingForm.verified}
                  onChange={(e) =>
                    setListingForm((f) => ({
                      ...f,
                      verified: e.target.checked,
                    }))
                  }
                />{" "}
                Verified
              </label>
            </div>
            <label className="font-semibold mb-1" style={{ color: theme.primary }}>
              Description
            </label>
            <Editor
              apiKey="mkyaup5rx10x4g0h9h3iqvea4fx46wl690xfxnfu1c1ssrev"
              value={listingForm.description}
              init={{
                plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                menubar: false,
                height: 300,
              }}
              onEditorChange={(content) => setListingForm((f) => ({ ...f, description: content }))}
            />
            <label className="font-semibold mb-1 mt-4" style={{ color: theme.primary }}>
              Eligibility
            </label>
            <Editor
              apiKey="mkyaup5rx10x4g0h9h3iqvea4fx46wl690xfxnfu1c1ssrev"
              value={listingForm.eligibility}
              init={{
                plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                menubar: false,
                height: 200,
              }}
              onEditorChange={(content) => setListingForm((f) => ({ ...f, eligibility: content }))}
            />
            <input
              className="rounded-lg border px-4 py-2"
              style={{
                borderColor: theme.border,
                background: theme.surfaceGlass,
                color: theme.text,
              }}
              placeholder="Application Link (optional)"
              value={listingForm.application_link}
              onChange={(e) =>
                setListingForm((f) => ({
                  ...f,
                  application_link: e.target.value,
                }))
              }
            />
            <input
              type="file"
              accept="image/*"
              className="rounded-lg border px-4 py-2"
              style={{
                borderColor: theme.border,
                background: theme.surfaceGlass,
                color: theme.text,
              }}
              onChange={(e) =>
                setListingForm((f) => ({ ...f, image: e.target.files[0] }))
              }
              required
            />
            <div className="flex gap-2">
              <input
                type="date"
                className="rounded-lg border px-4 py-2 flex-1"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
                value={listingForm.expiry}
                onChange={(e) =>
                  setListingForm((f) => ({ ...f, expiry: e.target.value }))
                }
                required
              />
              <select
                className="rounded-lg border px-4 py-2 flex-1"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
                value={listingForm.status}
                onChange={(e) =>
                  setListingForm((f) => ({ ...f, status: e.target.value }))
                }
              >
                <option>Active</option>
                <option>Pending</option>
                <option>Expired</option>
              </select>
              <select
                className="rounded-lg border px-4 py-2 flex-1"
                style={{
                  borderColor: theme.border,
                  background: theme.surfaceGlass,
                  color: theme.text,
                }}
                value={listingForm.category}
                onChange={(e) =>
                  setListingForm((f) => ({ ...f, category: e.target.value }))
                }
                required
              >
                <option value="">Select Category</option>
                {types.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg font-semibold transition"
                style={{ background: theme.accent, color: theme.primary }}
                onClick={() => setShowEditListingModal(null)}
                disabled={listingLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                style={{ background: theme.primary, color: theme.surface }}
                disabled={listingLoading}
              >
                {listingLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {showTypeModal && (
        <Modal onClose={() => setShowTypeModal(false)}>
          <h3
            className="text-xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
            Add New Opportunity Type
          </h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleAddType();
            }}
          >
            <input
              className="rounded-lg border px-4 py-2"
              style={{
                borderColor: theme.border,
                background: theme.surfaceGlass,
                color: theme.text,
              }}
              placeholder="Type Name"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              required
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg font-semibold transition"
                style={{ background: theme.accent, color: theme.primary }}
                onClick={() => setShowTypeModal(false)}
                disabled={typeLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                style={{ background: theme.primary, color: theme.surface }}
                disabled={typeLoading}
              >
                {typeLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Adding...
                  </span>
                ) : (
                  "Add Type"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {showEditTypeModal && (
        <Modal onClose={() => setShowEditTypeModal(null)}>
          <h3
            className="text-xl font-bold mb-4"
            style={{ color: theme.primary }}
          >
            Edit Opportunity Type
          </h3>
          <form
            className="flex flex-col gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              handleEditType();
            }}
          >
            <input
              className="rounded-lg border px-4 py-2"
              style={{
                borderColor: theme.border,
                background: theme.surfaceGlass,
                color: theme.text,
              }}
              placeholder="Type Name"
              value={typeName}
              onChange={(e) => setTypeName(e.target.value)}
              required
            />
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                className="px-4 py-2 rounded-lg font-semibold transition"
                style={{ background: theme.accent, color: theme.primary }}
                onClick={() => setShowEditTypeModal(null)}
                disabled={typeLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2"
                style={{ background: theme.primary, color: theme.surface }}
                disabled={typeLoading}
              >
                {typeLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Saving...
                  </span>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        </Modal>
      )}
      {deleteTypeId && (
        <Modal onClose={() => setDeleteTypeId(null)}>
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.error }}>
            Delete Opportunity Type
          </h3>
          <p className="mb-6" style={{ color: theme.text }}>
            Are you sure you want to delete this opportunity type? This action
            cannot be undone.
          </p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg font-semibold transition"
              style={{ background: theme.accent, color: theme.primary }}
              onClick={() => setDeleteTypeId(null)}
              disabled={typeLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
              style={{ background: theme.error, color: theme.surface }}
              onClick={async () => {
                await handleDeleteType(deleteTypeId);
                setDeleteTypeId(null);
              }}
              disabled={typeLoading}
            >
              {typeLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </Modal>
      )}
      {deleteListingId && (
        <Modal onClose={() => setDeleteListingId(null)}>
          <h3 className="text-xl font-bold mb-4" style={{ color: theme.error }}>
            Delete Opportunity Listing
          </h3>
          <p className="mb-6" style={{ color: theme.text }}>
            Are you sure you want to delete this opportunity listing? This
            action cannot be undone.
          </p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              className="px-4 py-2 rounded-lg font-semibold transition"
              style={{ background: theme.accent, color: theme.primary }}
              onClick={() => setDeleteListingId(null)}
              disabled={listingLoading}
            >
              Cancel
            </button>
            <button
              type="button"
              className="px-4 py-2 rounded-lg font-semibold transition flex items-center gap-2"
              style={{ background: theme.error, color: theme.surface }}
              onClick={async () => {
                await handleDeleteListing(deleteListingId);
                setDeleteListingId(null);
              }}
              disabled={listingLoading}
            >
              {listingLoading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </button>
          </div>
        </Modal>
      )}
      {showSponsorModal && (
        <Modal onClose={() => setShowSponsorModal(null)}>
          <div className="p-6">
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: theme.primary }}
            >
              Make Opportunity Sponsored
            </h2>
            {sponsorError && (
              <div
                className="mb-4 p-3 rounded-lg text-sm"
                style={{ background: theme.error + "22", color: theme.error }}
              >
                {sponsorError}
              </div>
            )}
            <div className="mb-4">
              <div className="mb-2 font-semibold">Sponsorship Status</div>
              <select
                className="w-full px-4 py-2 rounded-lg border bg-white/80 text-gray-900 shadow"
                style={{ borderColor: theme.border }}
                value={sponsorStatus}
                onChange={(e) => setSponsorStatus(e.target.value)}
                disabled={sponsorLoading}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="mb-4">
              <div className="mb-2 font-semibold">Payment Status</div>
              <select
                className="w-full px-4 py-2 rounded-lg border bg-white/80 text-gray-900 shadow"
                style={{ borderColor: theme.border }}
                value={sponsorPayment}
                onChange={(e) => setSponsorPayment(e.target.value)}
                disabled={sponsorLoading}
              >
                <option value="unpaid">Unpaid</option>
                <option value="paid">Paid</option>
              </select>
            </div>
            <div className="flex gap-2 justify-end">
              <button
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 font-semibold shadow"
                onClick={() => setShowSponsorModal(null)}
                disabled={sponsorLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-[#5b2be7] text-white font-semibold shadow flex items-center gap-2"
                onClick={() => handleMakeSponsored(showSponsorModal)}
                disabled={sponsorLoading}
              >
                {sponsorLoading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Processing...
                  </>
                ) : (
                  "Make Sponsored"
                )}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Sponsored Opportunity Details Modal */}
      {showSponsoredDetailsModal && sponsoredDetails && (
        <Modal onClose={() => setShowSponsoredDetailsModal(null)}>
          <div className="p-6">
            <h2
              className="text-xl font-bold mb-4"
              style={{ color: theme.primary }}
            >
              Sponsored Opportunity Details
            </h2>
            {sponsoredDetailsLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Opportunity</h3>
                  <p className="text-gray-700">{sponsoredDetails.opportunity?.title}</p>
                </div>
                
                <div>
                  <h3 className="font-semibold mb-2">Sponsor</h3>
                  <p className="text-gray-700">
                    {sponsoredDetails.partner?.name || sponsoredDetails.partner?.company_name || 'Admin Sponsored'}
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Campaign Link</h3>
                  <p className="text-gray-700">
                    {sponsoredDetails.ad_campaign_id ? `Campaign ID: ${sponsoredDetails.ad_campaign_id}` : 'No campaign linked'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Status</h3>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        sponsoredDetails.status === 'active' || sponsoredDetails.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : sponsoredDetails.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sponsoredDetails.status}
                    </span>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Payment Status</h3>
                    <span
                      className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        sponsoredDetails.payment_status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sponsoredDetails.payment_status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-semibold mb-2">Sponsored From</h3>
                    <p className="text-gray-700">
                      {sponsoredDetails.sponsored_from ? new Date(sponsoredDetails.sponsored_from).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Sponsored To</h3>
                    <p className="text-gray-700">
                      {sponsoredDetails.sponsored_to ? new Date(sponsoredDetails.sponsored_to).toLocaleDateString() : 'N/A'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 justify-end pt-4">
                  <button
                    className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 font-semibold shadow"
                    onClick={() => setShowSponsoredDetailsModal(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </AdminLayout>
  );
}

function Modal({ children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div
        className="bg-white/90 rounded-2xl shadow-2xl p-8 min-w-[320px] max-w-full relative"
        style={{
          background: theme.surfaceGlass,
          border: `1px solid ${theme.border}`,
          width: 700,
          height: '80vh',
          overflowY: 'auto',
          maxWidth: '95vw',
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
