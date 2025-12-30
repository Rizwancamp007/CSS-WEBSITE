const express = require("express");
const router = express.Router();
const { 
    createAnnouncement, 
    getAnnouncements, 
    deleteAnnouncement,
    updateAnnouncement,
    archiveAnnouncement,
    getAdminAnnouncements
} = require("../controllers/announcementController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @section Public Access Protocol
 * Open frequency for students to receive the latest updates.
 */
// GET /api/announcements -> Fetches only active, unarchived broadcasts
router.get("/", getAnnouncements);


/**
 * @section Administrative Command (Restricted)
 * All endpoints below require active session verification and 
 * specific [canManageAnnouncements] clearance.
 */

// Deployment of new broadcast mission
router.post("/", 
    protect, 
    authorize("canManageAnnouncements"), 
    createAnnouncement
);

// Synchronization of existing broadcast parameters
router.put("/:id", 
    protect, 
    authorize("canManageAnnouncements"), 
    updateAnnouncement
);

// Toggle Archive status (Soft-delete protocol)
router.patch("/archive/:id", 
    protect, 
    authorize("canManageAnnouncements"), 
    archiveAnnouncement
);

// Retrieve full broadcast ledger (including archived nodes) for Dashboard management
router.get("/admin/all", 
    protect, 
    authorize("canManageAnnouncements"), 
    getAdminAnnouncements
);

// Permanent wipe of broadcast node from mainframe
router.delete("/:id", 
    protect, 
    authorize("canManageAnnouncements"), 
    deleteAnnouncement
);

module.exports = router;