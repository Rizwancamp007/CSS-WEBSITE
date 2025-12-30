const mongoose = require("mongoose");

/**
 * @description System Audit Trail Schema (The Black Box)
 * Records all high-clearance operations. Designed for forensic security 
 * and operational transparency.
 */
const activityLogSchema = new mongoose.Schema({
  // OPERATOR IDENTITY
  adminId: { 
    type: mongoose.Schema.Types.ObjectId, 
    required: true 
  },
  
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
    uppercase: true 
  },

  // Logic Classification (Aligned for Frontend Filtering)
  category: {
    type: String,
    enum: ['AUTH', 'EVENT', 'ANNOUNCEMENT', 'TEAM', 'MEMBERSHIP', 'SYSTEM'],
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
  // DATA INTEGRITY: Logs are immutable (Created and Read only)
  timestamps: { createdAt: true, updatedAt: false },
  versionKey: false
});

/**
 * @section Performance & Intelligence Indexing
 * Optimized for the Admin Logs dashboard.
 */
activityLogSchema.index({ createdAt: -1 });
activityLogSchema.index({ adminEmail: 1 });
activityLogSchema.index({ action: 1 });

// PRE-SAVE HOOK: Automatically assign category based on action prefix
activityLogSchema.pre('save', function(next) {
    const action = this.action;
    if (action.includes('LOGIN') || action.includes('SECURITY')) this.category = 'AUTH';
    else if (action.includes('EVENT')) this.category = 'EVENT';
    else if (action.includes('ANNOUNCEMENT')) this.category = 'ANNOUNCEMENT';
    else if (action.includes('TEAM')) this.category = 'TEAM';
    else if (action.includes('MEMBERSHIP') || action.includes('AUTHORITY')) this.category = 'MEMBERSHIP';
    next();
});

module.exports = mongoose.model("ActivityLog", activityLogSchema);