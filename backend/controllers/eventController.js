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
        // SECURITY FILTER: strictly exclude archived events from public view
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
 * @desc Admin: Get all events (Full History including Archived)
 */
exports.getAdminEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('createdBy', 'fullName email gmail')
            .sort({ createdAt: -1 });
            
        res.json({ success: true, data: events });
    } catch (error) {
        res.status(500).json({ success: false, message: "Administrative fetch failed." });
    }
};

// ==========================================
// 3. LIFECYCLE OPERATIONS
// ==========================================

/**
 * @desc Toggle Archive Status
 * @protocol PATCH /api/events/archive/:id
 */
exports.toggleArchiveEvent = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Node not found." });
        }

        // Flip the archival state
        event.isArchived = !event.isArchived;
        await event.save();

        const status = event.isArchived ? "ARCHIVED" : "RESTORED";
        await logAction(req.user.id, `EVENT_${status}`, `${status} mission: ${event.title}`, req);

        res.json({ success: true, data: event });
    } catch (error) {
        res.status(400).json({ success: false, message: "Archive protocol failed." });
    }
};

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
        
        await logAction(req.user.id, "EVENT_UPDATE", `Modified mission: ${event.title}`, req);
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

        await logAction(req.user.id, "EVENT_PURGE", `Permanently wiped: ${title}`, req);
        res.json({ success: true, message: "Node successfully purged." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Purge sequence failed." });
    }
};