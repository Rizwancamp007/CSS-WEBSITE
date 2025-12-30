import axios from "axios";

/**
 * @description Standardized Mainframe Uplink Configuration
 * Hardened for environment-aware routing.
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @section Request Interceptor (Auth Key Binder)
 * Automatically binds JWT to every administrative request.
 */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "null") {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }
  return config;
}, (error) => Promise.reject(error));

/**
 * @section Response Interceptor (Security Sentry)
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin') {
        window.location.href = "/admin"; 
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// 1. ADMINISTRATIVE & AUTH
// ==========================================
export const adminLogin = (formData) => API.post("/admin/login", formData);
export const getAdminProfile = () => API.get("/admin/profile");
export const updatePassword = (passwords) => API.put("/admin/change-password", passwords);
export const getActivityLogs = () => API.get("/admin/logs");

// ==========================================
// 2. MISSIONS (EVENTS)
// ==========================================
export const fetchEvents = () => API.get("/events");
export const fetchAdminEvents = () => API.get("/events/admin/all");
export const createEvent = (data) => API.post("/events", data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
// RESTORED: Archive Protocol for Events
export const toggleArchiveEvent = (id) => API.patch(`/events/archive/${id}`);

// ==========================================
// 3. BROADCASTS (ANNOUNCEMENTS)
// ==========================================
export const fetchAnnouncements = () => API.get("/announcements");
export const fetchAdminAnnouncements = () => API.get("/announcements/admin/all");
export const createAnnouncement = (data) => API.post("/announcements", data);
export const updateAnnouncement = (id, data) => API.put(`/announcements/${id}`, data);
export const toggleArchiveAnnouncement = (id) => API.patch(`/announcements/archive/${id}`);
export const deleteAnnouncement = (id) => API.delete(`/announcements/${id}`);

// ==========================================
// 4. PERSONNEL & AUTHORITY (MEMBERSHIPS)
// ==========================================
export const submitMembership = (data) => API.post("/memberships", data);
export const setupBoardPassword = (data) => API.post("/memberships/activate-board", data);
export const fetchAllMemberships = () => API.get("/memberships/admin/all");
export const syncPermissions = (id, data) => API.patch(`/memberships/permissions/${id}`, data); 
export const deleteMembership = (id) => API.delete(`/memberships/${id}`);

// ==========================================
// 5. ENROLLMENTS (REGISTRATIONS)
// ==========================================
export const registerForEvent = (data) => API.post("/register", data);
export const fetchAllRegistrations = () => API.get("/register/all");
export const deleteRegistration = (id) => API.delete(`/register/${id}`);
export const exportRegistrations = () => API.get("/register/export", { responseType: 'blob' });

// ==========================================
// 6. TEAM MANAGEMENT
// ==========================================
export const fetchPublicTeam = () => API.get("/team");
export const fetchAdminTeam = () => API.get("/team/admin/all");
export const addTeamMember = (data) => API.post("/team", data);
export const updateTeamMember = (id, data) => API.put(`/team/${id}`, data);
export const toggleTeamStatus = (id) => API.patch(`/team/status/${id}`);

// ==========================================
// 7. COMMUNICATIONS (INQUIRIES)
// ==========================================
export const submitInquiry = (data) => API.post("/admin/messages/public", data);
export const fetchInquiries = () => API.get("/admin/messages");
export const markInquiryRead = (id) => API.patch(`/admin/messages/${id}`);
export const deleteMessage = (id) => API.delete(`/admin/messages/${id}`);

export default API;