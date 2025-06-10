import AdminLayout from "../../layouts/AdminLayout";
import { useState, useEffect } from "react";
import {
  FaSearch,
  FaUserEdit,
  FaBan,
  FaEye,
  FaUserShield,
  FaUserTie,
} from "react-icons/fa";
import theme from "../../theme";
import {
  getUsers,
  getUser,
  updateUser,
  banUser,
  deactivateUser,
  activateUser,
} from "../../api";
import { toast } from "react-toastify";

const roleColors = {
  Admin: "bg-gradient-to-r from-purple-500 to-indigo-500 text-white",
  Partner: "bg-gradient-to-r from-green-400 to-blue-500 text-white",
  User: "bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800",
};

const roleIcons = {
  Admin: <FaUserShield className="inline mr-1" />,
  Partner: <FaUserTie className="inline mr-1" />,
  User: <FaEye className="inline mr-1" />,
};

export default function Users() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [referralFilter, setReferralFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [editRoleUser, setEditRoleUser] = useState(null);
  const [editRoleLoading, setEditRoleLoading] = useState(false);
  const [editRoleValue, setEditRoleValue] = useState("");

  // Fetch users from API
  useEffect(() => {
    setLoading(true);
    setError(null);
    getUsers({
      status: statusFilter,
      referred:
        referralFilter === "referred"
          ? true
          : referralFilter === "not_referred"
          ? false
          : undefined,
      user_type: roleFilter,
      search,
    })
      .then((res) => setUsers(res.data))
      .catch((err) => setError("Failed to load users"))
      .finally(() => setLoading(false));
  }, [search, statusFilter, referralFilter, roleFilter]);

  // Filter logic (search is handled by backend for now)
  const filteredUsers = users;

  // View user profile (fetch full details)
  const handleViewProfile = (user) => {
    setProfileLoading(true);
    getUser(user.id)
      .then((res) => setSelectedUser(res.data))
      .catch(() => toast.error("Failed to load user profile"))
      .finally(() => setProfileLoading(false));
  };

  // Ban/Deactivate/Activate user
  const handleBan = (user) => {
    banUser(user.id)
      .then(() => {
        toast.success("User banned");
        refreshUsers();
      })
      .catch(() => toast.error("Failed to ban user"));
  };
  const handleDeactivate = (user) => {
    deactivateUser(user.id)
      .then(() => {
        toast.success("User deactivated");
        refreshUsers();
      })
      .catch(() => toast.error("Failed to deactivate user"));
  };
  const handleActivate = (user) => {
    activateUser(user.id)
      .then(() => {
        toast.success("User activated");
        refreshUsers();
      })
      .catch(() => toast.error("Failed to activate user"));
  };
  const refreshUsers = () => {
    setLoading(true);
    getUsers({
      status: statusFilter,
      referred:
        referralFilter === "referred"
          ? true
          : referralFilter === "not_referred"
          ? false
          : undefined,
      user_type: roleFilter,
      search,
    })
      .then((res) => setUsers(res.data))
      .catch(() => setError("Failed to load users"))
      .finally(() => setLoading(false));
  };

  // Edit user role
  const handleEditRole = (user) => {
    setEditRoleUser(user);
    setEditRoleValue(user.user_type);
  };
  const handleSaveRole = () => {
    if (!editRoleUser) return;
    setEditRoleLoading(true);
    updateUser(editRoleUser.id, { user_type: editRoleValue })
      .then(() => {
        toast.success("Role updated");
        setEditRoleUser(null);
        refreshUsers();
      })
      .catch(() => toast.error("Failed to update role"))
      .finally(() => setEditRoleLoading(false));
  };

  return (
    <AdminLayout>
      <div className="flex flex-col gap-8">
        <div className="flex flex-wrap gap-4 items-center justify-between mb-4">
          <div
            className="flex gap-2 items-center bg-white/70 rounded-xl px-3 py-2 shadow border"
            style={{ borderColor: theme.border }}
          >
            <FaSearch className="text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 rounded-lg border-0 focus:outline-none bg-transparent text-gray-900 min-w-[220px]"
            />
          </div>
          <div
            className="flex gap-2 items-center bg-white/70 rounded-xl px-3 py-2 shadow border"
            style={{ borderColor: theme.border }}
          >
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border-0 bg-transparent text-gray-900"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="banned">Banned</option>
            </select>
            <select
              value={referralFilter}
              onChange={(e) => setReferralFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border-0 bg-transparent text-gray-900"
            >
              <option value="">All Referrals</option>
              <option value="referred">Referred</option>
              <option value="not_referred">Not Referred</option>
            </select>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 rounded-lg border-0 bg-transparent text-gray-900"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="partner">Partner</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>
        <div
          className="overflow-x-auto rounded-3xl shadow-2xl bg-white/70 backdrop-blur-lg border border-2"
          style={{ borderColor: theme.border }}
        >
          {loading ? (
            <div className="py-16 text-center text-gray-400">
              Loading users...
            </div>
          ) : error ? (
            <div className="py-16 text-center text-red-500">{error}</div>
          ) : (
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-gradient-to-r from-[#ede9fe] to-[#f8fafc] text-gray-700">
                  <th className="py-4 px-4 text-left font-bold">Name</th>
                  <th className="py-4 px-4 text-left font-bold">Email</th>
                  <th className="py-4 px-4 text-left font-bold">Status</th>
                  <th className="py-4 px-4 text-left font-bold">Role</th>
                  <th className="py-4 px-4 text-left font-bold">Referral</th>
                  <th className="py-4 px-4 text-left font-bold">Interests</th>
                  <th className="py-4 px-4 text-left font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-10 text-gray-400">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b last:border-b-0 hover:bg-[#f5f3ff]/60 transition"
                      style={{ borderColor: theme.border }}
                    >
                      <td className="py-4 px-4 font-semibold flex items-center gap-2">
                        <span className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ede9fe] to-[#a78bfa] flex items-center justify-center text-lg font-bold shadow">
                          {user.name[0]}
                        </span>
                        {user.name}
                      </td>
                      <td className="py-4 px-4">{user.email}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 rounded-lg text-xs font-bold shadow ${
                            user.status === "active"
                              ? "bg-green-100 text-green-700"
                              : user.status === "banned"
                              ? "bg-red-200 text-red-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.status.charAt(0).toUpperCase() +
                            user.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-xl text-xs font-bold shadow flex items-center gap-1 ${
                            roleColors[
                              user.user_type
                                ? user.user_type.charAt(0).toUpperCase() +
                                  user.user_type.slice(1)
                                : "User"
                            ]
                          }`}
                        >
                          {
                            roleIcons[
                              user.user_type
                                ? user.user_type.charAt(0).toUpperCase() +
                                  user.user_type.slice(1)
                                : "User"
                            ]
                          }
                          {user.user_type
                            ? user.user_type.charAt(0).toUpperCase() +
                              user.user_type.slice(1)
                            : "User"}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {user.referred_by ? (
                          <span className="bg-green-50 text-green-700 px-2 py-1 rounded-lg text-xs font-semibold">
                            Yes
                          </span>
                        ) : (
                          <span className="bg-gray-100 text-gray-500 px-2 py-1 rounded-lg text-xs font-semibold">
                            No
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        {Array.isArray(user.interests) &&
                        user.interests.length > 0 ? (
                          user.interests.map((i) => (
                            <span
                              key={i}
                              className="inline-block bg-[#ede9fe] text-[#5b2be7] rounded-full px-2 py-1 text-xs mr-1 mb-1 shadow"
                            >
                              {i}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 flex gap-2">
                        <button
                          className="p-2 rounded-lg hover:bg-[#ede9fe] transition"
                          title="View Profile"
                          onClick={() => handleViewProfile(user)}
                          disabled={profileLoading}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="p-2 rounded-lg hover:bg-[#ede9fe] transition"
                          title="Edit Role"
                          onClick={() => handleEditRole(user)}
                          disabled={editRoleLoading}
                        >
                          <FaUserEdit />
                        </button>
                        {user.status === "banned" ? (
                          <button
                            className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition"
                            title="Activate"
                            onClick={() => handleActivate(user)}
                            disabled={loading}
                          >
                            Activate
                          </button>
                        ) : user.status === "inactive" ? (
                          <button
                            className="p-2 rounded-lg hover:bg-green-100 text-green-600 transition"
                            title="Activate"
                            onClick={() => handleActivate(user)}
                            disabled={loading}
                          >
                            Activate
                          </button>
                        ) : (
                          <>
                            <button
                              className="p-2 rounded-lg hover:bg-yellow-100 text-yellow-600 transition"
                              title="Deactivate"
                              onClick={() => handleDeactivate(user)}
                              disabled={loading}
                            >
                              Deactivate
                            </button>
                            <button
                              className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition"
                              title="Ban"
                              onClick={() => handleBan(user)}
                              disabled={loading}
                            >
                              <FaBan />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
        {/* User Profile Modal (modern glassy style) */}
        {selectedUser && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white/90 rounded-3xl shadow-2xl p-10 w-full max-w-lg relative border border-[#ede9fe] backdrop-blur-xl">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setSelectedUser(null)}
              >
                ×
              </button>
              {profileLoading ? (
                <div className="py-16 text-center text-gray-400">
                  Loading profile...
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-4 mb-4">
                    <span className="w-14 h-14 rounded-full bg-gradient-to-br from-[#ede9fe] to-[#a78bfa] flex items-center justify-center text-2xl font-bold shadow">
                      {selectedUser.name[0]}
                    </span>
                    <div>
                      <h2
                        className="text-2xl font-bold mb-1"
                        style={{ color: theme.primary }}
                      >
                        {selectedUser.name}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-bold shadow flex items-center gap-1 ${
                          roleColors[
                            selectedUser.user_type
                              ? selectedUser.user_type.charAt(0).toUpperCase() +
                                selectedUser.user_type.slice(1)
                              : "User"
                          ]
                        }`}
                      >
                        {
                          roleIcons[
                            selectedUser.user_type
                              ? selectedUser.user_type.charAt(0).toUpperCase() +
                                selectedUser.user_type.slice(1)
                              : "User"
                          ]
                        }
                        {selectedUser.user_type
                          ? selectedUser.user_type.charAt(0).toUpperCase() +
                            selectedUser.user_type.slice(1)
                          : "User"}
                      </span>
                    </div>
                  </div>
                  <p className="mb-2 text-gray-600">{selectedUser.email}</p>
                  <div className="mb-4 grid grid-cols-2 gap-2">
                    <div>
                      <span className="font-semibold">Status:</span>{" "}
                      {selectedUser.status.charAt(0).toUpperCase() +
                        selectedUser.status.slice(1)}
                    </div>
                    <div>
                      <span className="font-semibold">Referral:</span>{" "}
                      {selectedUser.referred_by ? "Yes" : "No"}
                    </div>
                    <div className="col-span-2">
                      <span className="font-semibold">Interests:</span>{" "}
                      {Array.isArray(selectedUser.interests)
                        ? selectedUser.interests.join(", ")
                        : "-"}
                    </div>
                  </div>
                  <div className="mb-6">
                    <h3 className="font-semibold mb-2 text-[#5b2be7]">
                      Activity
                    </h3>
                    <ul className="list-disc pl-5 text-gray-700">
                      <li>
                        Saved Opportunities:{" "}
                        {selectedUser.saved_opportunities
                          ? selectedUser.saved_opportunities.length
                          : 0}
                      </li>
                      <li>
                        Referrals:{" "}
                        {selectedUser.referrals
                          ? selectedUser.referrals.length
                          : 0}
                      </li>
                      <li>
                        Application Tracker Usage:{" "}
                        {selectedUser.application_trackers
                          ? selectedUser.application_trackers.length
                          : 0}
                      </li>
                    </ul>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button className="px-4 py-2 rounded-lg bg-[#ede9fe] text-[#5b2be7] font-semibold shadow">
                      Edit Role
                    </button>
                    {selectedUser.status === "banned" ? (
                      <button
                        className="px-4 py-2 rounded-lg bg-green-100 text-green-600 font-semibold shadow"
                        onClick={() => handleActivate(selectedUser)}
                      >
                        Activate
                      </button>
                    ) : selectedUser.status === "inactive" ? (
                      <button
                        className="px-4 py-2 rounded-lg bg-green-100 text-green-600 font-semibold shadow"
                        onClick={() => handleActivate(selectedUser)}
                      >
                        Activate
                      </button>
                    ) : (
                      <>
                        <button
                          className="px-4 py-2 rounded-lg bg-yellow-100 text-yellow-600 font-semibold shadow"
                          onClick={() => handleDeactivate(selectedUser)}
                        >
                          Deactivate
                        </button>
                        <button
                          className="px-4 py-2 rounded-lg bg-red-100 text-red-600 font-semibold shadow"
                          onClick={() => handleBan(selectedUser)}
                        >
                          Ban
                        </button>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
        {/* Edit Role Modal */}
        {editRoleUser && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
            <div className="bg-white/90 rounded-3xl shadow-2xl p-8 w-full max-w-sm relative border border-[#ede9fe] backdrop-blur-xl">
              <button
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold"
                onClick={() => setEditRoleUser(null)}
                disabled={editRoleLoading}
              >
                ×
              </button>
              <h2
                className="text-xl font-bold mb-4"
                style={{ color: theme.primary }}
              >
                Edit Role for {editRoleUser.name}
              </h2>
              <select
                className="w-full px-4 py-3 rounded-lg border focus:outline-none focus:ring-2 bg-white/80 text-gray-900 shadow mb-6"
                style={{ borderColor: theme.border }}
                value={editRoleValue}
                onChange={(e) => setEditRoleValue(e.target.value)}
                disabled={editRoleLoading}
              >
                <option value="admin">Admin</option>
                <option value="partner">Partner</option>
                <option value="user">User</option>
              </select>
              <div className="flex gap-2 justify-end">
                <button
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600 font-semibold shadow"
                  onClick={() => setEditRoleUser(null)}
                  disabled={editRoleLoading}
                >
                  Cancel
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-[#5b2be7] text-white font-semibold shadow disabled:opacity-60"
                  onClick={handleSaveRole}
                  disabled={editRoleLoading}
                >
                  {editRoleLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
