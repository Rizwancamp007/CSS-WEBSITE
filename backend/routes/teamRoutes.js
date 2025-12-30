const express = require("express");
const router = express.Router();
const { 
    addTeamMember, 
    getTeam, 
    getAllTeamAdmin, // PRODUCTION SYNC: Added for dashboard management
    updateMember, 
    toggleMemberStatus // PRODUCTION SYNC: Standardized with controller
} = require("../controllers/teamController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @section Public Registry Access
 * Frequency open to the public to view the Society Board hierarchy.
 */
// GET /api/team -> Fetches only isActive: true members
router.get("/", getTeam);


/**
 * @section Administrative Command (Restricted)
 * Requires [protect] verification and [canManageTeams] RBAC clearance.
 */

// Appointment: POST /api/team
router.post("/", 
    protect, 
    authorize("canManageTeams"), 
    addTeamMember
);

// Full Registry: GET /api/team/admin/all
// PRODUCTION SYNC: Required to see both active and decommissioned members
router.get("/admin/all", 
    protect, 
    authorize("canManageTeams"), 
    getAllTeamAdmin
);

// Synchronization: PUT /api/team/:id
router.put("/:id", 
    protect, 
    authorize("canManageTeams"), 
    updateMember
);

// Status Toggle: PATCH /api/team/status/:id
// PRODUCTION SYNC: Changed from DELETE to PATCH for better soft-delete control
router.patch("/status/:id", 
    protect, 
    authorize("canManageTeams"), 
    toggleMemberStatus
);

module.exports = router;