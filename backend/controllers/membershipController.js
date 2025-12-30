const Membership = require("../models/Membership");
const Admin = require("../models/Admin");
const ActivityLog = require("../models/ActivityLog");

/**
 * @helper Internal Audit Protocol
 * Captures the operator identity for the membership registry logs.
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
        console.error("AUDIT_LOG_FAILURE:", err.message);
    }
};

// ==========================================
// 1. PUBLIC ENLISTMENT (Candidates)
// ==========================================

/**
 * @desc Public: Submit Membership Application
 * Hardened with case-normalization to prevent identifier bypass.
 */
exports.applyForMembership = async (req, res) => {
  try {
    const { fullName, rollNo, department, semester, gmail, phoneNumber, applyingRole } = req.body;

    // Normalization: Prevent bypass via '22-CS-01' vs '22-cs-01'
    const normalizedRoll = rollNo?.toUpperCase().trim();
    const normalizedGmail = gmail?.toLowerCase().trim();

    // Collision Check: Prevent duplicate entries in the database
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
 * @desc Admin: Get all applications (Approved or Pending)
 * Standardized response to fix the Dashboard 'Authority Mgr' count.
 */
exports.getAllMemberships = async (req, res) => {
  try {
    // Fetch full history sorted by most recent
    const memberships = await Membership.find().sort({ createdAt: -1 });
    
    // FIXED: Wrapped in data object for frontend dashboard compatibility
    // This allows dashboard.jsx to access result.data.length correctly
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
 * Logs the purge action to the Audit Trail.
 */
exports.deleteMember = async (req, res) => {
  try {
    const target = await Membership.findById(req.params.id);
    if (!target) {
        return res.status(404).json({ success: false, message: "Node not found." });
    }

    const identity = `${target.fullName} (${target.rollNo})`;
    await target.deleteOne();

    // CRITICAL: Forensic logging of the wipe operation
    await logAction(req.user.id, "MEMBERSHIP_PURGE", `Permanently removed node: ${identity}`, req);

    res.json({ success: true, message: "Record successfully purged from registry." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Wipe operation failure." });
  }
};