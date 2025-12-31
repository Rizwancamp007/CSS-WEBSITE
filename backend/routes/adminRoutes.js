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
 * Prevents non-master nodes from accessing forensic logs or authority settings.
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

// Public Gateway: Handshake for Admin/Board login
router.post("/login", adminLogin);

// Public Gateway: Board activation (Syncs with /activate on frontend)
router.post("/setup-password", setupAdminPassword);

// Private Node: Identity retrieval
router.get("/profile", protect, getAdminProfile);

// Private Node: Credential rotation
router.put("/change-password", protect, changePassword);

// ==========================================
// 2. INQUIRY SYSTEM (COMMUNICATIONS)
// ==========================================

// Public Uplink: Student contact submission
router.post("/messages/public", submitPublicMessage);

// Restricted: SuperAdmin Inquiry Management
router.get("/messages", protect, superAdminOnly, getMessages);

// Restricted: Status modification
router.patch("/messages/:id", protect, superAdminOnly, markMessageRead);

// ==========================================
// 3. SYSTEM AUTHORITY & FORENSICS
// ==========================================

// Restricted: Master Admin only can sync permissions
router.patch("/permissions/:id", protect, superAdminOnly, updateMemberPermissions);

// Restricted: Master Admin only can access audit trail
router.get("/logs", protect, superAdminOnly, getActivityLogs);

module.exports = router;