import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * @section PUBLIC_API
 * Used for Login and Account Activation (No JWT required).
 */
const PUBLIC_API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

/**
 * @section API
 * Used for protected routes. Includes JWT binding.
 */
const API = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// Request Interceptor: Binds JWT to the header
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  // Clean 'null' strings sometimes left by failed sessions
  if (token && token !== "null" && token !== "undefined") {
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }
  return config;
}, (error) => Promise.reject(error));

// 

// Response Interceptor: Handles expired sessions (401/403)
API.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response ? error.response.status : null;
    const currentPath = window.location.pathname;

    /**
     * @section SECURITY BYPASS
     * Do not trigger a session wipe if the user is currently on the 
     * Login or Activation pages. This prevents the "2-second logout loop."
     */
    const isSafeZone = currentPath === "/setup-board-password" || currentPath === "/admin";

    if ((status === 401 || status === 403) && !isSafeZone) {
      console.warn("AUTH_INTERCEPTOR: Session invalid. Purging local nodes.");
      
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      /**
       * @section ROUTE SHIELD
       * Only redirect to login if we are trying to access a protected sector.
       */
      const isProtectedRoute = currentPath.startsWith('/admin') || 
                               currentPath === "/all-registrations" || 
                               currentPath === "/admin-dashboard";

      if (isProtectedRoute) {
        window.location.href = "/admin"; 
      }
    }
    return Promise.reject(error);
  }
);

// ==========================================
// 1. ADMINISTRATIVE & AUTH
// ==========================================
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
export const setupBoardPassword = (data) => PUBLIC_API.post("/admin/setup-password", data);
export const fetchAllMemberships = () => API.get("/memberships/admin/all");
export const syncPermissions = (id, data) => API.patch(`/admin/permissions/${id}`, data); 
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