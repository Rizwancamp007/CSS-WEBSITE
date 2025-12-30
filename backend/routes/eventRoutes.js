const express = require("express");
const router = express.Router();
const { 
    createEvent, 
    getEvents, 
    getAdminEvents, // Fixed: Linked missing administrative fetch
    updateEvent, 
    deleteEvent 
} = require("../controllers/eventController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @section Public Access Protocol
 * Open frequency for students to view the mission roster.
 */
// GET /api/events -> Fetches only active, unarchived mission nodes
router.get("/", getEvents);


/**
 * @section Administrative Command (Restricted)
 * All endpoints below require [protect] verification and [canManageEvents] clearance.
 */

// Deployment of a new mission node
router.post("/", 
    protect, 
    authorize("canManageEvents"), 
    createEvent
);

// Retrieve full mission ledger for Dashboard oversight (Includes archived)
// This route powers the 'Missions' counter in your Admin Analytics
router.get("/admin/all", 
    protect, 
    authorize("canManageEvents"), 
    getAdminEvents
);

// Synchronization of mission parameters (Title, Date, Capacity)
router.put("/:id", 
    protect, 
    authorize("canManageEvents"), 
    updateEvent
);

// Permanent removal of mission data from mainframe
router.delete("/:id", 
    protect, 
    authorize("canManageEvents"), 
    deleteEvent
);

module.exports = router;