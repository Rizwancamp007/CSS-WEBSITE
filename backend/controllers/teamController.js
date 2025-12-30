const Team = require("../models/Team");
const Admin = require("../models/Admin");
const Membership = require("../models/Membership");
const ActivityLog = require("../models/ActivityLog");

/**
 * @helper Internal Audit Protocol
 * Captures forensic metadata optimized for Render/Vercel proxy environments.
 */
const logAction = async (adminId, action, details, req) => {
    try {
        const user = await Admin.findById(adminId) || await Membership.findById(adminId);
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
        console.error("LOG_FAILURE:", err.message);
    }
};

// ==========================================
// 1. CORE HIERARCHY OPERATIONS
// ==========================================

/**
 * @desc Appoint new team member
 */
exports.addTeamMember = async (req, res) => {
    try {
        const member = await Team.create({ 
            ...req.body, 
            createdBy: req.user.id 
        });

        await logAction(req.user.id, "TEAM_APPOINT", `Appointed ${member.name} as ${member.role}`, req);

        res.status(201).json({ 
            success: true, 
            data: member 
        });
    } catch (error) {
        res.status(400).json({ success: false, message: "Appointment sequence failed." });
    }
};

/**
 * @desc Modify existing member credentials
 */
exports.updateMember = async (req, res) => {
    try {
        const member = await Team.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!member) return res.status(404).json({ success: false, message: "Executive node not found." });

        await logAction(req.user.id, "TEAM_UPDATE", `Modified credentials for node: ${member.name}`, req);

        res.json({ success: true, data: member });
    } catch (error) {
        res.status(400).json({ success: false, message: "Update handshake rejected." });
    }
};

// ==========================================
// 2. PUBLIC & ADMIN REGISTRY
// ==========================================

/**
 * @desc Get Team (Public View)
 * Filters for active members only.
 */
exports.getTeam = async (req, res) => {
    try {
        const team = await Team.find({ isActive: true }).sort({ hierarchy: 1, name: 1 });
        res.json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: "Hierarchy retrieval failed." });
    }
};

/**
 * @desc Get All Team Members (Admin View)
 * PRODUCTION ADDITION: Required for Admin Dashboard to manage/restore archived members.
 */
exports.getAllTeamAdmin = async (req, res) => {
    try {
        const team = await Team.find().sort({ hierarchy: 1, name: 1 });
        res.json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: "Admin registry access failed." });
    }
};

// ==========================================
// 3. LIFECYCLE MANAGEMENT
// ==========================================

/**
 * @desc Decommission/Reactivate Member
 */
exports.toggleMemberStatus = async (req, res) => {
    try {
        const member = await Team.findById(req.params.id);
        if (!member) return res.status(404).json({ success: false, message: "Node not found." });

        member.isActive = !member.isActive;
        await member.save();

        const statusLabel = member.isActive ? "REACTIVATED" : "DECOMMISSIONED";
        await logAction(req.user.id, "TEAM_STATUS_TOGGLE", `${statusLabel} node: ${member.name}`, req);

        res.json({ 
            success: true, 
            message: `Member node ${statusLabel} successfully.`,
            data: member 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Status toggle failure." });
    }
};