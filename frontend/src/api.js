import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * @section PUBLIC_API (The Entry Node)
 * Used for Login and Account Activation where no JWT exists yet.
 * Security is handled by the Activation Token or Credentials.
 */
const PUBLIC_API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * @section API (The Administrative Uplink)
 * Used for all protected routes. Includes Interceptors for JWT binding.
 */
const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor: Binds JWT to the header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token && token !== "null") {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handles expired sessions (401/403)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      // Only redirect if we are inside the admin panel, not on the public site
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
// FIXED: Uses PUBLIC_API to prevent interceptor loops
export const adminLogin = (formData) => PUBLIC_API.post("/admin/login", formData);
export const getAdminProfile = () => API.get("/admin/profile");
export const updatePassword = (passwords) => API.put("/admin/change-password", passwords);
export const getActivityLogs = () => API.get("/admin/logs");

// ==========================================
// 2. MISSIONS (EVENTS)
// ==========================================
export const fetchEvents = () => PUBLIC_API.get("/events");
export const fetchAdminEvents = () => API.get("/events/admin/all");
export const createEvent = (data) => API.post("/events", data);
export const updateEvent = (id, data) => API.put(`/events/${id}`, data);
export const deleteEvent = (id) => API.delete(`/events/${id}`);
export const toggleArchiveEvent = (id) => API.patch(`/events/archive/${id}`);

// ==========================================
// 3. BROADCASTS (ANNOUNCEMENTS)
// ==========================================
export const fetchAnnouncements = () => PUBLIC_API.get("/announcements");
export const fetchAdminAnnouncements = () => API.get("/announcements/admin/all");
export const createAnnouncement = (data) => API.post("/announcements", data);
export const updateAnnouncement = (id, data) => API.put(`/announcements/${id}`, data);
export const toggleArchiveAnnouncement = (id) => API.patch(`/announcements/archive/${id}`);
export const deleteAnnouncement = (id) => API.delete(`/announcements/${id}`);

// ==========================================
// 4. PERSONNEL & AUTHORITY (MEMBERSHIPS)
// ==========================================
export const submitMembership = (data) => PUBLIC_API.post("/memberships", data);
// FIXED: Uses PUBLIC_API so the Activation Token is the primary security key
export const setupBoardPassword = (data) => PUBLIC_API.post("/memberships/activate-board", data);
export const fetchAllMemberships = () => API.get("/memberships/admin/all");
export const syncPermissions = (id, data) => API.patch(`/memberships/permissions/${id}`, data); 
export const deleteMembership = (id) => API.delete(`/memberships/${id}`);

// ==========================================
// 5. ENROLLMENTS (REGISTRATIONS)
// ==========================================
export const registerForEvent = (data) => PUBLIC_API.post("/register", data);
export const fetchAllRegistrations = () => API.get("/register/all");
export const deleteRegistration = (id) => API.delete(`/register/${id}`);
export const exportRegistrations = () => API.get("/register/export", { responseType: 'blob' });

// ==========================================
// 6. TEAM MANAGEMENT
// ==========================================
export const fetchPublicTeam = () => PUBLIC_API.get("/team");
export const fetchAdminTeam = () => API.get("/team/admin/all");
export const addTeamMember = (data) => API.post("/team", data);
export const updateTeamMember = (id, data) => API.put(`/team/${id}`, data);
export const toggleTeamStatus = (id) => API.patch(`/team/status/${id}`);

// ==========================================
// 7. COMMUNICATIONS (INQUIRIES)
// ==========================================
export const submitInquiry = (data) => PUBLIC_API.post("/admin/messages/public", data);
export const fetchInquiries = () => API.get("/admin/messages");
export const markInquiryRead = (id) => API.patch(`/admin/messages/${id}`);
export const deleteMessage = (id) => API.delete(`/admin/messages/${id}`);

export default API;