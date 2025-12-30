const express = require("express");
const router = express.Router();
const { 
    createEvent, 
    getEvents, 
    getAdminEvents, 
    updateEvent, 
    deleteEvent 
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @section Public Access Protocol
 * Open frequency for students to view the mission roster.
 */
// GET /api/events
router.get("/", getEvents);


/**
 * @section Administrative Command (Restricted)
 * Requires [protect] verification and [canManageEvents] RBAC clearance.
 */

// Deployment of a new mission node: POST /api/events
router.post("/", 
    protect, 
    authorize("canManageEvents"), 
    createEvent
);

// Retrieve full mission ledger: GET /api/events/admin/all
// PRODUCTION SYNC: Placed above /:id to prevent route clashing
router.get("/admin/all", 
    protect, 
    authorize("canManageEvents"), 
    getAdminEvents
);

// Synchronization of mission parameters: PUT /api/events/:id
router.put("/:id", 
    protect, 
    authorize("canManageEvents"), 
    updateEvent
);

// Permanent removal of mission data: DELETE /api/events/:id
router.delete("/:id", 
    protect, 
    authorize("canManageEvents"), 
    deleteEvent
);

module.exports = router;