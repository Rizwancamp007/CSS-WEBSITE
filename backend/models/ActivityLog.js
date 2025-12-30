const mongoose = require("mongoose");

/**
 * @description System Audit Trail Schema (The Black Box)
 * Records all high-clearance operations. Designed for forensic security 
 * and operational transparency.
 */
const activityLogSchema = new mongoose.Schema({
  // OPERATOR IDENTITY
  // Polymorphic ID supporting both Master Admin and Society Board collections
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  
  // Human-readable identifier (Preserved even if account is deleted)
  adminEmail: { 
    type: String, 
    required: true,
    lowercase: true,
    trim: true
  },

  // OPERATION METADATA
  action: { 
    type: String, 
    required: true,
    uppercase: true // Standardizes "LOGIN" vs "login"
  },

  // Logic Classification (Enables targeted auditing)
  category: {
    type: String,
    enum: ['SECURITY', 'EVENT_MGMT', 'CONTENT', 'USER_MGMT', 'SYSTEM'],
    default: 'SYSTEM'
  },

  details: { 
    type: String, 
    required: true 
  },

  // NETWORK FORENSICS
  ipAddress: { 
    type: String,
    default: "0.0.0.0"
  },
  
  userAgent: { 
    type: String 
  }
}, { 
  // Disable updates to logs for data integrity (Logs should only be Created/Read)
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false
});

/**
 * @section Performance & Intelligence Indexing
 * Optimized for the Admin Logs dashboard to fetch recent data instantly.
 */
// Rapid retrieval of the most recent security events
activityLogSchema.index({ createdAt: -1 });

// Efficient filtering by specific administrator
activityLogSchema.index({ adminEmail: 1 });

// Filtering by action type (e.g., viewing all "PASSWORD_CHANGE" actions)
activityLogSchema.index({ action: 1 });

module.exports = mongoose.model("ActivityLog", activityLogSchema);