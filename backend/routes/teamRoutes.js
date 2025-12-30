const express = require("express");
const router = express.Router();
const { 
    addTeamMember, 
    getTeam, 
    updateMember, 
    removeMember 
} = require("../controllers/teamController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @section Public Registry Access
 * Frequency open to the public to view the Society Board and Executive hierarchy.
 */
// GET /api/team -> Fetches only active board members sorted by hierarchy
router.get("/", getTeam);


/**
 * @section Administrative Command (Restricted)
 * All endpoints below require active session verification and 
 * specific [canManageTeams] clearance.
 */

// Appointment: Add a new node to the leadership hierarchy
router.post("/", 
    protect, 
    authorize("canManageTeams"), 
    addTeamMember
);

// Synchronization: Update credentials or social uplinks for a board member
router.put("/:id", 
    protect, 
    authorize("canManageTeams"), 
    updateMember
);

// Decommission: Remove or deactivate a member node from the board
// Controller handles soft-delete via isActive flag to preserve audit history
router.delete("/:id", 
    protect, 
    authorize("canManageTeams"), 
    removeMember
);

module.exports = router;