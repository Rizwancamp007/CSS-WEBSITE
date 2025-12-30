const Admin = require("../models/Admin");
const Membership = require("../models/Membership");
const Contact = require("../models/Contact");
const ActivityLog = require("../models/ActivityLog");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

/**
 * @helper Internal Audit Protocol
 * Records administrative actions with forensic detail.
 * Hardened for proxied cloud hosting (Render/Vercel).
 */
const logAdminAction = async (adminId, action, details, req) => {
    try {
        const user = await Admin.findById(adminId) || await Membership.findById(adminId);
        const email = user ? (user.email || user.gmail) : "UNKNOWN_OPERATOR";

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
        console.error("AUDIT_LOG_ERROR:", err.message);
    }
};

/**
 * @helper JWT Generator
 */
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { 
        expiresIn: process.env.TOKEN_EXPIRE || "3h" 
    });
};

// ==========================================
// 1. AUTHENTICATION & LOGIN
// ==========================================

exports.adminLogin = async (req, res) => {
    const email = req.body.email?.toLowerCase().trim();
    const { password } = req.body;

    try {
        // Search Hierarchy: Check Primary Admins first
        let user = await Admin.findOne({ email }).select("+password");
        let isMembershipAccount = false;

        if (!user) {
            // Fallback: Search Society Board Members (using gmail field)
            user = await Membership.findOne({ gmail: email }).select("+password");
            isMembershipAccount = true;
        }

        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: "Security Alert: Identity unrecognized on this frequency." 
            });
        }

        // BRUTE-FORCE SHIELD
        if (user.lockUntil && user.lockUntil > Date.now()) {
            return res.status(423).json({ 
                success: false, 
                message: "Uplink Locked: Excessive failures. Retry shortly." 
            });
        }

        // BOARD SPECIFIC VALIDATION
        if (isMembershipAccount) {
            if (!user.approved) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Access Denied: Membership node not yet approved." 
                });
            }
            if (!user.isActivated) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Access Denied: Account node not activated." 
                });
            }
        }

        if (await user.matchPassword(password)) {
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();

            // RBAC ENFORCEMENT
            if (isMembershipAccount && !user.permissions?.isAdmin) {
                return res.status(403).json({ 
                    success: false, 
                    message: "Clearance Level Zero Required: Admin privileges not detected." 
                });
            }

            await logAdminAction(user._id, "LOGIN", "Mainframe uplink established successfully.", req);

            // RESPONSE: Normalized user object for Frontend consistency
            res.json({
                success: true,
                user: {
                    id: user._id,
                    fullName: user.fullName || "Master Admin",
                    email: user.email || user.gmail,
                    permissions: user.permissions || { isAdmin: true }
                },
                token: generateToken(user._id),
            });
        } else {
            // INCREMENT LOGIN FAILURES
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = Date.now() + 30 * 60 * 1000; 
            }
            await user.save();
            res.status(401).json({ 
                success: false, 
                message: "Authentication Failed: Invalid Access Key." 
            });
        }
    } catch (error) {
        console.error("LOGIN_ERROR:", error);
        res.status(500).json({ success: false, message: "Internal Systems Error." });
    }
};

// ==========================================
// 2. SECURITY & PROFILE MANAGEMENT
// ==========================================

/**
 * @desc Get Current Profile
 * FIXED: Bridges the gap between DB fields and Frontend expectations.
 */
exports.getAdminProfile = async (req, res) => {
    try {
        // req.user is populated by 'protect' middleware which already finds Admin or Member
        if (!req.user) return res.status(404).json({ success: false, message: "Node unreachable." });
        
        // NORMALIZATION: Ensuring keys match the Login response exactly
        const normalizedUser = {
            id: req.user._id,
            fullName: req.user.fullName || "Master Admin",
            email: req.user.email || req.user.gmail, // Critical bridge for logout loop
            permissions: req.user.permissions || { isAdmin: true }
        };

        res.json({ 
            success: true, 
            data: normalizedUser 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Data retrieval failed." });
    }
};

exports.changePassword = async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const user = await Admin.findById(req.user.id).select("+password") || 
                     await Membership.findById(req.user.id).select("+password");

        if (!user) return res.status(404).json({ success: false, message: "Node identification lost." });

        const isMatch = await user.matchPassword(oldPassword);
        if (!isMatch) return res.status(401).json({ success: false, message: "Current key invalid." });

        user.password = newPassword; 
        await user.save(); 

        await logAdminAction(user._id, "SECURITY_UPDATE", "Access credentials modified.", req);
        res.json({ success: true, message: "Security protocols updated." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Encryption sequence failure." });
    }
};

// ==========================================
// 3. AUTHORITY & SECURITY AUDIT
// ==========================================

exports.updateMemberPermissions = async (req, res) => {
    try {
        const { approved, permissions, role } = req.body;
        const member = await Membership.findById(req.params.id);

        if (!member) return res.status(404).json({ success: false, message: "Node not found." });

        let clearToken = null;
        if (approved && !member.approved && !member.isActivated) {
            clearToken = member.createActivationToken();
        }

        member.approved = approved;
        member.permissions = permissions;
        member.role = role;

        await member.save();
        await logAdminAction(req.user.id, "AUTHORITY_SYNC", `Permissions synced for node: ${member.gmail}`, req);

        res.json({ 
            success: true, 
            message: "Clearance level synchronized.", 
            activationLink: clearToken ? `/setup-board-password?token=${clearToken}` : null 
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Authority synchronization failed." });
    }
};

exports.getActivityLogs = async (req, res) => {
    try {
        const logs = await ActivityLog.find().sort({ createdAt: -1 }).limit(200);
        res.json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: "Audit retrieval failure." });
    }
};

// ==========================================
// 4. COMMUNICATIONS & ACTIVATION
// ==========================================

exports.submitPublicMessage = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        await Contact.create({ name, email, subject, message });
        res.status(201).json({ success: true, message: "Transmission received." });
    } catch (error) {
        res.status(400).json({ success: false, message: "Transmission failed." });
    }
};

exports.getMessages = async (req, res) => {
    try {
        const messages = await Contact.find({ isArchived: false }).sort({ createdAt: -1 });
        res.json({ success: true, data: messages });
    } catch (error) {
        res.status(500).json({ success: false, message: "Inquiry fetch failure." });
    }
};

exports.markMessageRead = async (req, res) => {
    try {
        await Contact.findByIdAndUpdate(req.params.id, { isRead: true });
        await logAdminAction(req.user.id, "INQUIRY_PROTOCOL", `Marked inquiry ${req.params.id} read.`, req);
        res.json({ success: true, message: "Status updated." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Update failure." });
    }
};

exports.setupAdminPassword = async (req, res) => {
    const { rollNo, gmail, password, token } = req.body;
    try {
        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
        const member = await Membership.findOne({ 
            rollNo: rollNo?.toUpperCase().trim(), 
            gmail: gmail?.toLowerCase().trim(), 
            approved: true,
            activationToken: hashedToken,
            isActivated: false 
        });

        if (!member) return res.status(404).json({ success: false, message: "Activation token invalid." });

        member.password = password; 
        member.isActivated = true;
        member.activationToken = undefined;
        member.activationExpire = undefined;
        await member.save();

        res.json({ success: true, message: "Node Activation Complete." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Activation failure." });
    }
};