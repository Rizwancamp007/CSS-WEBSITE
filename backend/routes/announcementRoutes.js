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
 * Open frequency for students to receive active broadcasts.
 */
// GET /api/announcements
router.get("/", getAnnouncements);


/**
 * @section Administrative Command (Restricted)
 * All endpoints below require Level 1 identity protection and 
 * specific [canManageAnnouncements] RBAC clearance.
 */

// Deployment: POST /api/announcements
router.post("/", 
    protect, 
    authorize("canManageAnnouncements"), 
    createAnnouncement
);

// Registry Access: GET /api/announcements/admin/all
// PRODUCTION SYNC: Placed above /:id to prevent route clashing
router.get("/admin/all", 
    protect, 
    authorize("canManageAnnouncements"), 
    getAdminAnnouncements
);

// Synchronization: PUT /api/announcements/:id
router.put("/:id", 
    protect, 
    authorize("canManageAnnouncements"), 
    updateAnnouncement
);

// Archive Toggle: PATCH /api/announcements/archive/:id
router.patch("/archive/:id", 
    protect, 
    authorize("canManageAnnouncements"), 
    archiveAnnouncement
);

// Permanent Purge: DELETE /api/announcements/:id
router.delete("/:id", 
    protect, 
    authorize("canManageAnnouncements"), 
    deleteAnnouncement
);

module.exports = router;