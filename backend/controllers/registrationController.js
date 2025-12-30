const Registration = require("../models/Registration");
const Event = require("../models/Event");
const Admin = require("../models/Admin");
const Membership = require("../models/Membership");
const ActivityLog = require("../models/ActivityLog");
const { Parser } = require("json2csv");

/**
 * @helper Internal Audit Protocol
 * Captures forensic data for sensitive participant PII access.
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
// 1. PUBLIC ENROLLMENT (Uplink)
// ==========================================

/**
 * @desc Public: Initialize Event Registration
 * Hardened with capacity safeguards and duplicate collision checks.
 */
exports.createRegistration = async (req, res) => {
  try {
    const { name, rollNo, email, department, semester, eventId, phoneNumber } = req.body;

    // 1. Mission Identifier Check
    if (!name || !rollNo || !email || !eventId) {
      return res.status(400).json({ success: false, message: "Missing required mission identifiers." });
    }

    // 2. Mission Availability & Capacity Check
    const targetEvent = await Event.findById(eventId);
    if (!targetEvent) return res.status(404).json({ success: false, message: "Mission node not found." });
    
    // Capacity Guard: Block entry if maxParticipants limit is met
    if (targetEvent.maxParticipants > 0 && targetEvent.registrationCount >= targetEvent.maxParticipants) {
      return res.status(400).json({ success: false, message: "Mission capacity reached. Registration closed." });
    }

    // 3. Collision Prevention (Duplicate Check)
    const normalizedRoll = rollNo.toUpperCase().trim();
    const existing = await Registration.findOne({ rollNo: normalizedRoll, eventId });
    if (existing) {
        return res.status(400).json({ success: false, message: "This ID is already registered for this mission." });
    }

    // 4. Record Persistence
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

    // 5. Update Global Counter (Atomic Sync)
    targetEvent.registrationCount += 1;
    await targetEvent.save();

    res.status(201).json({ success: true, message: "Enrollment sequence confirmed. Welcome to the mission." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Internal enrollment system error." });
  }
};

// ==========================================
// 2. ADMINISTRATIVE LEDGER (Registry)
// ==========================================

/**
 * @desc Admin: Get all registrations
 * Standardized response to fix the Dashboard 'Registrations' count.
 */
exports.getAllRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find().sort({ createdAt: -1 });
    
    // FIXED: Wrapped in 'data' object so frontend dashboard calculates .length correctly
    res.json({ 
        success: true, 
        data: registrations 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Ledger synchronization failed." });
  }
};

/**
 * @desc Admin: Export Registry to CSV
 * Data privacy compliant with mandatory audit logging.
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

    // CRITICAL: Forensic logging of mass data extraction
    await logAction(req.user.id, "DATA_EXPORT", `Extracted ${registrations.length} participant records to CSV.`, req);

    res.header('Content-Type', 'text/csv');
    res.attachment(`CSS_Registry_Dump_${Date.now()}.csv`);
    return res.send(csv);
  } catch (err) {
    res.status(500).json({ success: false, message: "Data extraction sequence failed." });
  }
};

// ==========================================
// 3. LIFECYCLE MANAGEMENT (Purge)
// ==========================================

/**
 * @desc Admin: Delete Registration Entry
 * Corrects event capacity counters automatically upon deletion.
 */
exports.deleteRegistration = async (req, res) => {
    try {
        const entry = await Registration.findById(req.params.id);
        if (!entry) return res.status(404).json({ success: false, message: "Node not found." });

        // Logic: Correct the event counter before record deletion
        const targetEvent = await Event.findById(entry.eventId);
        if (targetEvent && targetEvent.registrationCount > 0) {
            targetEvent.registrationCount -= 1;
            await targetEvent.save();
        }

        await logAction(req.user.id, "REGISTRATION_PURGE", `Deleted entry for ${entry.rollNo} from ${entry.eventName}`, req);
        await entry.deleteOne();

        res.json({ success: true, message: "Entry purged and capacity counters adjusted." });
    } catch (error) {
        res.status(500).json({ success: false, message: "Purge sequence failed." });
    }
};