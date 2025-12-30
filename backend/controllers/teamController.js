const Team = require("../models/Team");
const Admin = require("../models/Admin");
const Membership = require("../models/Membership");
const ActivityLog = require("../models/ActivityLog");

/**
 * @helper Internal Audit Protocol
 * Records every modification to the Society's leadership hierarchy.
 * Captures forensic metadata for accountability.
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

// ==========================================
// 1. CORE HIERARCHY OPERATIONS
// ==========================================

/**
 * @desc Appoint new team member
 */
exports.addTeamMember = async (req, res) => {
    try {
        // Enforce ownership link to the creating admin/member
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
        res.status(400).json({ success: false, message: "Appointment sequence failed: " + error.message });
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
 * Filters for active members and sorts by hierarchy (Rank 1 -> Rank 99)
 */
exports.getTeam = async (req, res) => {
    try {
        const team = await Team.find({ isActive: true }).sort({ hierarchy: 1, name: 1 });
        
        // FIXED: Standardized response ensures counts populate on Admin Dashboard
        res.json({ success: true, data: team });
    } catch (error) {
        res.status(500).json({ success: false, message: "Hierarchy retrieval failed." });
    }
};

// ==========================================
// 3. LIFECYCLE MANAGEMENT
// ==========================================

/**
 * @desc Decommission Member
 * Uses Soft-Delete logic to hide from site but preserve record in DB for archives.
 */
exports.removeMember = async (req, res) => {
    try {
        const member = await Team.findById(req.params.id);
        if (!member) return res.status(404).json({ success: false, message: "Node already decommissioned." });

        const identity = `${member.name} (${member.role})`;
        
        // SOFT DELETE: We toggle isActive to false. 
        // This ensures the member doesn't appear on /team but stays in our DB logs.
        member.isActive = false;
        await member.save();

        await logAction(req.user.id, "TEAM_REMOVAL", `Decommissioned node from active board: ${identity}`, req);

        res.json({ success: true, message: "Member node decommissioned from active board." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Removal sequence failure." });
    }
};