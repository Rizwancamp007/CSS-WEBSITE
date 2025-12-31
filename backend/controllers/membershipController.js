const Membership = require("../models/Membership");
const Admin = require("../models/Admin");
const ActivityLog = require("../models/ActivityLog");
const crypto = require("crypto");

/**
 * @helper Internal Audit Protocol
 * Hardened IP detection for production environments (Render/Vercel).
 */
const logAction = async (adminId, action, details, req) => {
    try {
        const user = await Admin.findById(adminId) || await Membership.findById(adminId);
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
        console.error("AUDIT_LOG_FAILURE:", err.message);
    }
};

// ==========================================
// 1. PUBLIC ENLISTMENT
// ==========================================

exports.applyForMembership = async (req, res) => {
    try {
        const { fullName, rollNo, department, semester, gmail, phoneNumber, applyingRole } = req.body;
        const normalizedRoll = rollNo?.toUpperCase().trim();
        const normalizedGmail = gmail?.toLowerCase().trim();

        const existing = await Membership.findOne({ 
            $or: [{ rollNo: normalizedRoll }, { gmail: normalizedGmail }] 
        });
        
        if (existing) {
            return res.status(400).json({ 
                success: false, 
                message: "Node Collision: Application already exists." 
            });
        }

        const application = await Membership.create({
            fullName, rollNo: normalizedRoll, department, semester,
            gmail: normalizedGmail, phoneNumber, applyingRole
        });

        res.status(201).json({ success: true, message: "Enlistment transmitted.", data: { id: application._id } });
    } catch (err) {
        res.status(500).json({ success: false, message: "Enlistment system failure." });
    }
};

// ==========================================
// 2. ADMINISTRATIVE REGISTRY
// ==========================================

exports.getAllMemberships = async (req, res) => {
    try {
        const memberships = await Membership.find().sort({ createdAt: -1 });
        res.json({ success: true, data: memberships });
    } catch (err) {
        res.status(500).json({ success: false, message: "Registry retrieval failed." });
    }
};

// ==========================================
// 3. LIFECYCLE & ACTIVATION (The Bug Fix)
// ==========================================

/**
 * @desc Public: Activate Board Account via Token
 * @protocol POST /api/memberships/activate-board
 * FIXED: Hashes token to match DB, validates expiry, updates credentials.
 */
exports.activateBoard = async (req, res) => {
    try {
        const { rollNo, gmail, password, token } = req.body;

        // 1. Hash incoming token
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        // 2. Locate node with triple-verification & token expiry check
        const member = await Membership.findOne({
            rollNo: rollNo.toUpperCase().trim(),
            gmail: gmail.toLowerCase().trim(),
            activationToken: hashedToken,
            activationExpire: { $gt: Date.now() },
            isActivated: false
        });

        if (!member) {
            return res.status(404).json({ 
                success: false, 
                message: "Uplink Denied: Invalid credentials or expired link." 
            });
        }

        // 3. Update credentials & activate
        member.password = password; 
        member.isActivated = true;
        member.activationToken = undefined;
        member.activationExpire = undefined;

        await member.save();
        await logAction(member._id, "BOARD_ACTIVATION", "Account successfully activated.", req);

        res.status(200).json({ success: true, message: "Identity Verified. Account Active." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Activation logic failure." });
    }
};

/**
 * @desc Admin: Toggle Membership Approval & Merge Permissions
 * FIXED: Preserves existing flags, avoids overwriting.
 */
exports.syncPermissions = async (req, res) => {
    try {
        const member = await Membership.findById(req.params.id);
        if (!member) return res.status(404).json({ success: false, message: "Member not found." });

        // Initial approval and token generation
        if (req.body.approved && !member.approved) {
            const rawToken = member.createActivationToken();
            member.approved = true;
            member.permissions = { ...member.permissions, isAdmin: true }; // Merge base admin access
            await member.save();
            
            // Token returned for admin usage (email sending optional)
            return res.json({ success: true, message: "Member approved. Activation token generated.", token: rawToken });
        }

        // Generic permission updates
        if (req.body.permissions) {
            member.permissions = { ...member.permissions, ...req.body.permissions };
        }

        await member.save();
        res.json({ success: true, data: member });
    } catch (err) {
        res.status(500).json({ success: false, message: "Sync operation failed." });
    }
};

/**
 * @desc Admin: Delete Member
 */
exports.deleteMember = async (req, res) => {
    try {
        const target = await Membership.findById(req.params.id);
        if (!target) return res.status(404).json({ success: false, message: "Node not found." });

        const identity = `${target.fullName} (${target.rollNo})`;
        await target.deleteOne();
        await logAction(req.user.id, "MEMBERSHIP_PURGE", `Permanently removed: ${identity}`, req);

        res.json({ success: true, message: "Record purged." });
    } catch (err) {
        res.status(500).json({ success: false, message: "Wipe failure." });
    }
};
