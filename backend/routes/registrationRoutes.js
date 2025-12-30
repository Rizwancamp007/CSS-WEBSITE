const express = require("express");
const router = express.Router();
const { 
    createRegistration, 
    getAllRegistrations,
    exportRegistrations,
    deleteRegistration // Synchronized with hardened controller
} = require("../controllers/registrationController");
const { protect, authorize } = require("../middleware/authMiddleware");

/**
 * @section Public Enrollment Frequency
 * Open frequency for students to register for active missions.
 */
// POST /api/register -> Initial registration submission
router.post("/", createRegistration);


/**
 * @section Administrative Oversight (Restricted)
 * Endpoints require specific clearance levels to access student PII 
 * (Personally Identifiable Information).
 */

// Registry Access: View all participant entries
// Powers the 'Registrations' count on the Dashboard
router.get("/all", 
    protect, 
    authorize("canViewRegistrations"), 
    getAllRegistrations
);

// Data Extraction: Generate CSV/Excel ledger
// Higher clearance [canExportData] required for bulk data handling
router.get("/export", 
    protect, 
    authorize("canExportData"), 
    exportRegistrations
);

// Record Purge: Remove a specific enrollment entry
// Logic includes automated registrationCount decrement in the controller
router.delete("/:id", 
    protect, 
    authorize("canViewRegistrations"), 
    deleteRegistration
);

module.exports = router;