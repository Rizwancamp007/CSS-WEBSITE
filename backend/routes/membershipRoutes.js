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
 * Open frequency for students to join the society.
 */

// Deployment of a new candidacy application: POST /api/memberships
router.post("/", applyForMembership);

// Terminal Activation: Handshake for newly approved board members
// PRODUCTION SYNC: Standardized path for ActivateAccount.jsx
router.post("/activate-board", setupAdminPassword);


/**
 * @section Administrative Command (High Clearance)
 * Requires [protect] verification and [isAdmin] RBAC clearance.
 */

// Personnel Registry: GET /api/memberships/admin/all
// PRODUCTION SYNC: Placed above parameterized routes
router.get("/admin/all", 
    protect, 
    authorize("isAdmin"), 
    getAllMemberships
);

// Authority Sync: PATCH /api/memberships/permissions/:id
// Integrated with forensic logging in adminController
router.patch("/permissions/:id", 
    protect, 
    authorize("isAdmin"), 
    updateMemberPermissions
);

// Registry Purge: DELETE /api/memberships/:id
router.delete("/:id", 
    protect, 
    authorize("isAdmin"), 
    deleteMember
);

module.exports = router;