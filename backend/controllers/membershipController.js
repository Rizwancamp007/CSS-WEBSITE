const Membership = require("../models/Membership");
const Admin = require("../models/Admin");
const ActivityLog = require("../models/ActivityLog");

/**
 * @helper Internal Audit Protocol
 * Hardened IP detection for production environments (Render/Vercel).
 */
const logAction = async (adminId, action, details, req) => {
    try {
        const user = await Admin.findById(adminId) || await Membership.findById(adminId);
        const email = user ? (user.email || user.gmail) : "SYSTEM_NODE";

        // LIVE FIX: Improved IP detection for proxied cloud hosting
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
// 1. PUBLIC ENLISTMENT (Candidates)
// ==========================================

/**
 * @desc Public: Submit Membership Application
 * Normalized to prevent duplicate entries like '22-CS-01' and '22-cs-01'.
 */
exports.applyForMembership = async (req, res) => {
  try {
    const { fullName, rollNo, department, semester, gmail, phoneNumber, applyingRole } = req.body;

    const normalizedRoll = rollNo?.toUpperCase().trim();
    const normalizedGmail = gmail?.toLowerCase().trim();

    // Check for existing node to prevent database pollution
    const existing = await Membership.findOne({ 
        $or: [{ rollNo: normalizedRoll }, { gmail: normalizedGmail }] 
    });
    
    if (existing) {
        return res.status(400).json({ 
            success: false, 
            message: "Node Collision: Application already exists for this Roll Number or Email." 
        });
    }

    const application = await Membership.create({
      fullName,
      rollNo: normalizedRoll,
      department,
      semester,
      gmail: normalizedGmail,
      phoneNumber,
      applyingRole
    });

    res.status(201).json({ 
        success: true, 
        message: "Enlistment request transmitted for Executive review.",
        data: { id: application._id } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Enlistment system failure." });
  }
};

// ==========================================
// 2. ADMINISTRATIVE REGISTRY
// ==========================================

/**
 * @desc Admin: Get all applications
 */
exports.getAllMemberships = async (req, res) => {
  try {
    const memberships = await Membership.find().sort({ createdAt: -1 });
    
    // PRODUCTION STABILITY: Wrapped for Dashboard.jsx compatibility
    res.json({ 
        success: true, 
        data: memberships 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Personnel registry retrieval failed." });
  }
};

// ==========================================
// 3. LIFECYCLE MANAGEMENT
// ==========================================

/**
 * @desc Admin: Delete Member/Application
 */
exports.deleteMember = async (req, res) => {
  try {
    const target = await Membership.findById(req.params.id);
    if (!target) {
        return res.status(404).json({ success: false, message: "Node not found." });
    }

    const identity = `${target.fullName} (${target.rollNo})`;
    await target.deleteOne();

    await logAction(req.user.id, "MEMBERSHIP_PURGE", `Permanently removed node: ${identity}`, req);

    res.json({ success: true, message: "Record successfully purged from registry." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Wipe operation failure." });
  }
};