import axios from "axios";

/**
 * @description Standardized Mainframe Uplink Configuration
 * Centralized Axios instance configured for high-security administrative 
 * communication. Base URL is dynamic based on environment configuration.
 */
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * @section Request Interceptor (Auth Key Binder)
 * Automatically extracts the JWT from local storage and binds it to the 
 * Authorization header. Sanitizes the token to prevent transmission errors.
 */
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    // Standardize the Bearer string and remove any accidental whitespace
    config.headers.Authorization = `Bearer ${token.trim()}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

/**
 * @section Response Interceptor (Security Sentry)
 * Globally monitors incoming traffic for 401 (Unauthorized) or 403 (Forbidden) 
 * statuses. Triggers a local session wipe if the security context is lost.
 */
API.interceptors.response.use(
  (response) => response,
  (error) => {
    // Catch security-related failures (expired tokens or revoked access)
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Wipe corrupted or expired credentials to prevent infinite redirect loops
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Optional: Signal the application to return to the login frequency
      if (window.location.pathname.startsWith('/admin')) {
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

// ==========================================
// 3. BROADCASTS (ANNOUNCEMENTS)
// ==========================================
export const fetchAnnouncements = () => API.get("/announcements");
export const fetchAdminAnnouncements = () => API.get("/announcements/admin/all");
export const createAnnouncement = (data) => API.post("/announcements", data);
export const toggleArchiveAnnouncement = (id) => API.patch(`/announcements/archive/${id}`);
export const deleteAnnouncement = (id) => API.delete(`/announcements/${id}`);

// ==========================================
// 4. PERSONNEL & AUTHORITY (MEMBERSHIPS)
// ==========================================
export const submitMembership = (data) => API.post("/memberships", data);
export const setupBoardPassword = (data) => API.post("/memberships/setup-password", data);
export const fetchAllMemberships = () => API.get("/memberships/admin/all");
export const syncPermissions = (id, data) => API.patch(`/admin/permissions/${id}`, data); 
export const deleteMembership = (id) => API.delete(`/memberships/${id}`);

// ==========================================
// 5. ENROLLMENTS (REGISTRATIONS)
// ==========================================
export const registerForEvent = (data) => API.post("/register", data);
export const fetchAllRegistrations = () => API.get("/register/all");
export const deleteRegistration = (id) => API.delete(`/register/${id}`);
export const exportRegistrations = () => API.get("/register/export", { responseType: 'blob' });

// ==========================================
// 6. COMMUNICATIONS (INQUIRIES)
// ==========================================
export const submitInquiry = (data) => API.post("/admin/messages/public", data);
export const fetchInquiries = () => API.get("/admin/messages");
export const markInquiryRead = (id) => API.patch(`/admin/messages/${id}`);

export default API;