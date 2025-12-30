const express = require("express");
const router = express.Router();
const { 
    applyForMembership, 
    getAllMemberships, 
    deleteMember 
} = require("../controllers/membershipController");
const { 
    updateMemberPermissions, 
    setupAdminPassword 
} = require("../controllers/adminController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @section Public Enlistment Protocols
 * These endpoints are open to the student body for initial interaction.
 */

// Deployment of a new candidacy application
// Path: POST /api/memberships
router.post("/", applyForMembership);

// Terminal Activation: Approved candidate establishes their access key
// Path: POST /api/memberships/setup-password
// Linked to the 'ActivateAccount.jsx' frontend module
router.post("/setup-password", setupAdminPassword);


/**
 * @section Administrative Command (High Clearance)
 * Access restricted to Administrative nodes with 'isAdmin' clearance.
 * Sensitive data operations are monitored via ActivityLog.
 */

// Personnel Registry: Retrieve all candidates and board members
// This powers the 'Authority Mgr' count on the Dashboard
router.get("/admin/all", 
    protect, 
    authorize("isAdmin"), 
    getAllMemberships
);

// Authority Sync: Modify permissions and grant access levels
// Level 0 (Master) typically required via controller-level checks
router.patch("/permissions/:id", 
    protect, 
    authorize("isAdmin"), 
    updateMemberPermissions
);

// Registry Purge: Remove a candidate or decommission a member
router.delete("/:id", 
    protect, 
    authorize("isAdmin"), 
    deleteMember
);

module.exports = router;