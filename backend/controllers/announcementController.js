const Announcement = require("../models/Announcement");
const Admin = require("../models/Admin");
const Membership = require("../models/Membership");
const ActivityLog = require("../models/ActivityLog");

/**
 * @helper Internal Audit Protocol
 * Records broadcast modifications. Standardized for human-readable audit trails.
 */
const logAction = async (adminId, action, details, req) => {
    try {
        const user = await Admin.findById(adminId) || await Membership.findById(adminId);
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
        console.error("LOG_FAILURE:", err.message);
    }
};

// --- 1. CORE BROADCAST OPERATIONS ---

/**
 * @desc Create new announcement
 */
exports.createAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.create({ 
            ...req.body, 
            createdBy: req.user.id 
        });

        await logAction(req.user.id, "ANNOUNCEMENT_CREATE", `Deployed broadcast: ${announcement.title}`, req);

        res.status(201).json({ 
            success: true, 
            data: announcement 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: "Failed to initialize broadcast mission." });
    }
};

/**
 * @desc Update existing announcement node
 */
exports.updateAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );
        
        if (!announcement) {
            return res.status(404).json({ success: false, message: "Broadcast node not found." });
        }

        await logAction(req.user.id, "ANNOUNCEMENT_UPDATE", `Modified broadcast: ${announcement.title}`, req);

        res.json({ success: true, data: announcement });
    } catch (error) {
        res.status(400).json({ success: false, message: "Protocol update rejected." });
    }
};

/**
 * @desc Toggle Archive status (Soft-delete protocol)
 */
exports.archiveAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: "Node unreachable." });
        }

        announcement.isArchived = !announcement.isArchived;
        await announcement.save();

        const statusLabel = announcement.isArchived ? "ARCHIVED" : "RESTORED";
        await logAction(req.user.id, "ANNOUNCEMENT_STATUS", `Set status to ${statusLabel} for: ${announcement.title}`, req);

        res.json({ 
            success: true, 
            isArchived: announcement.isArchived,
            data: announcement 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Archive handshake failure." });
    }
};

// --- 2. REGISTRY & FEED ACCESS ---

/**
 * @desc Public Feed Access (Unarchived Only)
 * Optimized for frontend feed rendering.
 */
exports.getAnnouncements = async (req, res) => {
    try {
        const list = await Announcement.find({ isArchived: false }).sort({ createdAt: -1 });
        res.json({ success: true, data: list });
    } catch (error) {
        res.status(500).json({ success: false, message: "Mission feed inaccessible." });
    }
};

/**
 * @desc Admin Ledger Access (Full History)
 * Essential for Dashboard 'News & Alerts' total count.
 */
exports.getAdminAnnouncements = async (req, res) => {
    try {
        const list = await Announcement.find().sort({ createdAt: -1 });
        res.json({ success: true, data: list });
    } catch (error) {
        res.status(500).json({ success: false, message: "Admin registry access failed." });
    }
};

// --- 3. LIFECYCLE MANAGEMENT ---

/**
 * @desc Permanent purge of announcement data
 */
exports.deleteAnnouncement = async (req, res) => {
    try {
        const announcement = await Announcement.findById(req.params.id);
        if (!announcement) {
            return res.status(404).json({ success: false, message: "Target already purged." });
        }

        await logAction(req.user.id, "ANNOUNCEMENT_PURGE", `Permanently wiped broadcast: ${announcement.title}`, req);
        
        await announcement.deleteOne();
        res.json({ success: true, message: "Node successfully purged from mainframe." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Purge sequence failed." });
    }
};