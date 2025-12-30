const express = require("express");
const router = express.Router();
const { 
    createRegistration, 
    getAllRegistrations,
    exportRegistrations,
    deleteRegistration 
} = require("../controllers/registrationController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @section Public Enrollment Frequency
 * Open frequency for students to register for active missions.
 */
// Path: POST /api/register
router.post("/", createRegistration);


/**
 * @section Administrative Oversight (Restricted)
 * Strict RBAC enforcement for student PII access.
 */

// Data Extraction: GET /api/register/export
// PRODUCTION SYNC: Placed ABOVE /all and /:id to prevent routing collisions
router.get("/export", 
    protect, 
    authorize("canExportData"), 
    exportRegistrations
);

// Registry Access: GET /api/register/all
router.get("/all", 
    protect, 
    authorize("canViewRegistrations"), 
    getAllRegistrations
);

// Record Purge: DELETE /api/register/:id
// Controller automatically syncs the registrationCount on the Event model
router.delete("/:id", 
    protect, 
    authorize("canViewRegistrations"), 
    deleteRegistration
);

module.exports = router;