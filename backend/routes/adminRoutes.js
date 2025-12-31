const express = require("express");
const router = express.Router();
const { 
  adminLogin, 
  setupAdminPassword, 
  getMessages, 
  getAdminProfile,
  markMessageRead,
  submitPublicMessage,
  updateMemberPermissions,
  changePassword,
  getActivityLogs 
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @helper SuperAdmin Guard (Level 0 Clearance)
 * Ensures only the master admin node can access critical authority endpoints.
 */
const superAdminOnly = (req, res, next) => {
    const MASTER_EMAIL = (process.env.MASTER_ADMIN_EMAIL || "css@gmail.com").toLowerCase().trim();
    const currentUserEmail = (req.user?.email || "").toLowerCase().trim();

    if (req.user && currentUserEmail === MASTER_EMAIL) {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: "RESTRICTED: Level 0 Clearance Required." 
        });
    }
};

// ==========================================
// 1. AUTHENTICATION & IDENTITY
// ==========================================

// Public Gateway: Admin/Board login
router.post("/login", adminLogin);

// Public Gateway: Initial Board password setup or reset
router.post("/setup-password", setupAdminPassword);

// Private Node: Retrieve profile (requires JWT verification)
router.get("/profile", protect, getAdminProfile);

// Private Node: Password change endpoint for admins/board members
router.put("/change-password", protect, changePassword);

// ==========================================
// 2. INQUIRY SYSTEM (COMMUNICATIONS)
// ==========================================

// Public Uplink: Students or public submit messages
router.post("/messages/public", submitPublicMessage);

// Restricted: SuperAdmin retrieves all messages (audit/log purpose)
router.get("/messages", protect, superAdminOnly, getMessages);

// Restricted: SuperAdmin marks message as read (status update)
router.patch("/messages/:id", protect, superAdminOnly, markMessageRead);

// ==========================================
// 3. SYSTEM AUTHORITY & FORENSICS
// ==========================================

// Restricted: SuperAdmin updates member permissions
router.patch("/permissions/:id", protect, superAdminOnly, updateMemberPermissions);

// Restricted: SuperAdmin retrieves full activity logs / audit trail
router.get("/logs", protect, superAdminOnly, getActivityLogs);

// ==========================================
// 4. OPTIONAL RBAC EXTENSIONS (if needed later)
// Example usage with granular permission keys from authMiddleware
// router.patch("/events/:id", protect, authorize("canManageEvents"), updateEvent);
// router.post("/announcements", protect, authorize("canManageAnnouncements"), postAnnouncement);
// ==========================================

module.exports = router;
