const Event = require("../models/Event");
const ActivityLog = require("../models/ActivityLog");
const Admin = require("../models/Admin");
const Membership = require("../models/Membership");

/**
 * @helper Standardized Logging Protocol
 * Hardened to capture forensic metadata for every event modification.
 */
const logAction = async (adminId, action, details, req) => {
    try {
        // Multi-collection identity lookup for the operator
        let user = await Admin.findById(adminId) || await Membership.findById(adminId);
        const email = user ? (user.email || user.gmail) : "SYSTEM_NODE";

        await ActivityLog.create({
            adminId,
            adminEmail: email,
            action: action.toUpperCase(),
            details,
            ipAddress: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            userAgent: req.headers["user-agent"]
        });
    } catch (err) { 
        console.error("LOGGING_CRITICAL_FAILURE:", err.message); 
    }
};

// ==========================================
// 1. PUBLIC MISSION DATA
// ==========================================

/**
 * @desc Public: Get all events (Active Only)
 * Used by the student-facing Events page.
 */
exports.getEvents = async (req, res) => {
    try {
        // Only fetch non-archived events, sorted chronologically
        const events = await Event.find({ isArchived: false }).sort({ date: 1 });
        
        // HARDENED: Explicit success flag for frontend consistency
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: "Mission registry inaccessible." });
    }
};

// ==========================================
// 2. ADMINISTRATIVE LEDGER
// ==========================================

/**
 * @desc Admin: Get all events (Full History)
 * Essential for the Admin Dashboard 'Missions' analytics.
 */
exports.getAdminEvents = async (req, res) => {
    try {
        const events = await Event.find().sort({ createdAt: -1 });
        
        // FIXED: Standardized wrapper allows Dashboard to read 'data.length'
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: "Administrative fetch sequence failed." });
    }
};

// ==========================================
// 3. LIFECYCLE OPERATIONS
// ==========================================

/**
 * @desc Deploy new event node
 */
exports.createEvent = async (req, res) => {
    try {
        // Create event and link the creator's ID (Polymorphic)
        const event = await Event.create({ 
            ...req.body, 
            createdBy: req.user.id 
        });

        await logAction(req.user.id, "EVENT_CREATE", `Deployed mission node: ${event.title}`, req);
        
        res.status(201).json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: "Mission initialization failure." });
    }
};

/**
 * @desc Modify mission parameters
 */
exports.updateEvent = async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!event) {
            return res.status(404).json({ success: false, message: "Event node not found." });
        }
        
        await logAction(req.user.id, "EVENT_UPDATE", `Modified mission parameters for: ${event.title}`, req);
        
        res.json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: "Protocol update rejected." });
    }
};

/**
 * @desc Permanent purge of mission data
 */
exports.deleteEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Event already purged." });
        }

        const title = event.title;
        await event.deleteOne();

        await logAction(req.user.id, "EVENT_PURGE", `Permanently wiped mission node: ${title}`, req);
        
        res.json({ success: true, message: "Node successfully purged from mainframe." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Purge sequence failed." });
    }
};