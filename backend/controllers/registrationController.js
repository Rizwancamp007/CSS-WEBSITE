const Registration = require("../models/Registration");
const Event = require("../models/Event");
const Admin = require("../models/Admin");
const Membership = require("../models/Membership");
const ActivityLog = require("../models/ActivityLog");
const { Parser } = require("json2csv");

/**
 * @helper Internal Audit Protocol
 * Hardened for normalized identity (email/gmail bridge).
 */
const logAction = async (adminId, action, details, req) => {
    try {
        const user = await Admin.findById(adminId) || await Membership.findById(adminId);
        // SYNCED: Uses bridge logic for Member Admins
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
// 1. PUBLIC ENROLLMENT (Uplink)
// ==========================================

exports.createRegistration = async (req, res) => {
  try {
    const { name, rollNo, email, department, semester, eventId, phoneNumber } = req.body;

    if (!name || !rollNo || !email || !eventId) {
      return res.status(400).json({ success: false, message: "Missing required mission identifiers." });
    }

    const targetEvent = await Event.findById(eventId);
    if (!targetEvent) return res.status(404).json({ success: false, message: "Mission node not found." });
    
    /**
     * @protocol ARCHIVE_BYPASS
     * Even if isArchived is true, we allow registration if the link is active.
     * Only block if registrationOpen is explicitly set to false.
     */
    if (targetEvent.registrationOpen === false) {
       return res.status(400).json({ success: false, message: "Entry Suspended: This mission is no longer accepting uplinks." });
    }

    // Capacity Guard
    if (targetEvent.maxParticipants > 0 && targetEvent.registrationCount >= targetEvent.maxParticipants) {
      return res.status(400).json({ success: false, message: "Mission capacity reached. Registration closed." });
    }

    // Collision Prevention (Duplicate Check)
    const normalizedRoll = rollNo.toUpperCase().trim();
    const existing = await Registration.findOne({ rollNo: normalizedRoll, eventId });
    if (existing) {
        return res.status(400).json({ success: false, message: "This ID is already registered for this mission." });
    }

    // Record Persistence
    await Registration.create({
      name,
      rollNo: normalizedRoll,
      email: email.toLowerCase().trim(),
      phoneNumber,
      department,
      semester,
      eventId,
      eventName: targetEvent.title
    });

    // Update Global Counter (Atomic Sync)
    targetEvent.registrationCount += 1;
    await targetEvent.save();

    res.status(201).json({ success: true, message: "Enrollment confirmed. Welcome to the mission." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal enrollment system error." });
  }
};

// ==========================================
// 2. ADMINISTRATIVE LEDGER (Registry)
// ==========================================

exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    res.json({ success: true, data: registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: "Ledger synchronization failed." });
  }
};

/**
 * @desc Admin: Export Registry to CSV
 */
exports.exportRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().lean();
    if (registrations.length === 0) {
        return res.status(404).json({ success: false, message: "No data available for extraction." });
    }

    const fields = ['name', 'rollNo', 'email', 'phoneNumber', 'department', 'semester', 'eventName', 'createdAt'];
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(registrations);

    // Forensic logging of mass data extraction
    await logAction(req.user.id, "DATA_EXPORT", `Extracted ${registrations.length} participant records.`, req);

    res.header('Content-Type', 'text/csv');
    res.attachment(`CSS_Registry_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: "Data extraction failed." });
  }
};

// ==========================================
// 3. LIFECYCLE MANAGEMENT (Purge)
// ==========================================

exports.deleteRegistration = async (req, res) => {
    try {
        const entry = await Registration.findById(req.params.id);
        if (!entry) return res.status(404).json({ success: false, message: "Node not found." });

        // Atomic correction: reduce counter on the event safely
        const targetEvent = await Event.findById(entry.eventId);
        if (targetEvent && targetEvent.registrationCount > 0) {
            targetEvent.registrationCount -= 1;
            await targetEvent.save();
        }

        await logAction(req.user.id, "REGISTRATION_PURGE", `Deleted entry: ${entry.rollNo} from ${entry.eventName}`, req);
        await entry.deleteOne();

        res.json({ success: true, message: "Entry purged and counters adjusted." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Purge sequence failed." });
    }
};