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
 * Only allows the master node defined in environment variables to access 
 * high-sensitivity system logs and permission controls.
 */
const superAdminOnly = (req, res, next) => {
    // Normalizing environment variable and current user email for strict comparison
    const MASTER_EMAIL = (process.env.MASTER_ADMIN_EMAIL || "css@gmail.com").toLowerCase().trim();
    const currentUserEmail = (req.user?.email || "").toLowerCase().trim();

    if (req.user && currentUserEmail === MASTER_EMAIL) {
        next();
    } else {
        res.status(403).json({ 
            success: false, 
            message: "RESTRICTED: Level 0 Clearance Required for this operation." 
        });
    }
};

// ==========================================
// 1. AUTHENTICATION & IDENTITY
// ==========================================

// Public Gateway: Admin/Board login transmission
router.post("/login", adminLogin);

// Public Gateway: Board member account activation via secure token
router.post("/setup-password", setupAdminPassword);

// Private Node: Retrieve current operator profile
router.get("/profile", protect, getAdminProfile);

// Private Node: Update administrative access credentials
router.put("/change-password", protect, changePassword);

// ==========================================
// 2. INQUIRY SYSTEM (COMMUNICATIONS)
// ==========================================

// Public Uplink: Submit contact/inquiry data
router.post("/messages/public", submitPublicMessage);

// Restricted: View incoming inquiries (SuperAdmin Only)
router.get("/messages", protect, authorize("isAdmin"), superAdminOnly, getMessages);

// Restricted: Update inquiry status (SuperAdmin Only)
router.patch("/messages/:id", protect, authorize("isAdmin"), superAdminOnly, markMessageRead);

// ==========================================
// 3. SYSTEM AUTHORITY & FORENSICS
// ==========================================

/**
 * @section Permission Sync
 * Only the Master Admin can modify the clearance levels of other board members.
 */
router.patch("/permissions/:id", protect, authorize("isAdmin"), superAdminOnly, updateMemberPermissions);

/**
 * @section Forensic Logs
 * Only the Master Admin can view the global administrative activity ledger.
 */
router.get("/logs", protect, authorize("isAdmin"), superAdminOnly, getActivityLogs);

module.exports = router;