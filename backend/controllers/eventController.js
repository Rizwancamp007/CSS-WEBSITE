const Event = require("../models/Event");
const ActivityLog = require("../models/ActivityLog");
const Admin = require("../models/Admin");
const Membership = require("../models/Membership");

/**
 * @helper Standardized Logging Protocol
 * Captured forensic metadata optimized for Render/Vercel proxy environments.
 */
const logAction = async (adminId, action, details, req) => {
    try {
        let user = await Admin.findById(adminId) || await Membership.findById(adminId);
        const email = user ? (user.email || user.gmail) : "SYSTEM_NODE";

        // LIVE FIX: Precise IP detection for proxied cloud hosting
        const ip = req.headers['x-forwarded-for']?.split(',')[0] || 
                   req.connection.remoteAddress || 
                   req.socket.remoteAddress;

        await ActivityLog.create({
            adminId,
            adminEmail: email,
            action: action.toUpperCase(),
            details,
            ipAddress: ip,
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
 */
exports.getEvents = async (req, res) => {
    try {
        // Only fetch non-archived events, sorted chronologically (soonest first)
        const events = await Event.find({ isArchived: false }).sort({ date: 1 });
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
 */
exports.getAdminEvents = async (req, res) => {
    try {
        // PRODUCTION UPGRADE: Populate creator details for Dashboard transparency
        const events = await Event.find()
            .populate('createdBy', 'fullName email gmail')
            .sort({ createdAt: -1 });
            
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