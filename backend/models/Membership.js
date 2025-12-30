const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

/**
 * @description Society Membership & Executive Board Schema
 * Manages the transition from public applicant to authorized administrative node.
 * Hardened with Role-Based Access Control (RBAC) and secure activation protocols.
 */
const membershipSchema = new mongoose.Schema({
  // --- CORE IDENTITY ---
  fullName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  rollNo: { 
    type: String, 
    required: true, 
    unique: true, 
    uppercase: true,
    trim: true 
  },
  department: { 
    type: String, 
    required: true,
    trim: true 
  },
  semester: { 
    type: String, 
    required: true 
  },
  gmail: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  phoneNumber: { 
    type: String, 
    required: true,
    trim: true 
  },

  // --- ADMINISTRATIVE TRANSITION ---
  applyingRole: { 
    type: String, 
    required: true 
  }, 
  role: { 
    type: String, 
    default: "Applicant" // Transitions to "Executive Board" on approval
  },
  approved: { 
    type: Boolean, 
    default: false 
  },
  
  // --- SECURITY INFRASTRUCTURE ---
  isActivated: { 
    type: Boolean, 
    default: false 
  },
  activationToken: { 
    type: String 
  },
  password: { 
    type: String,
    select: false // Protected: Must use .select("+password") in controllers to verify
  },

  // --- BRUTE-FORCE SHIELD ---
  loginAttempts: { 
    type: Number, 
    default: 0 
  },
  lockUntil: { 
    type: Number 
  },

  // --- CLEARANCE LEVEL VERSIONING ---
  tokenVersion: {
    type: Number,
    default: 0
  },

  // --- PERMISSION MATRIX (RBAC) ---
  permissions: {
    isAdmin: { type: Boolean, default: false },
    canManageEvents: { type: Boolean, default: false },
    canManageAnnouncements: { type: Boolean, default: false },
    canViewRegistrations: { type: Boolean, default: false },
    canManageTeams: { type: Boolean, default: false },
    canExportData: { type: Boolean, default: false }
  }
}, { 
  timestamps: true 
});

/**
 * @section Security Methods
 */

/**
 * @description Secure Activation Logic
 * Generates a one-time token for the board member to set their password.
 */
membershipSchema.methods.createActivationToken = function() {
  const token = crypto.randomBytes(32).toString("hex");
  // Store hashed version for security, return plain version for the link
  this.activationToken = crypto.createHash("sha256").update(token).digest("hex");
  return token; 
};

/**
 * @description Identity Verification Protocol
 * Compares plain text attempt with stored cryptographic hash.
 */
membershipSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * @section Middlewares
 */
membershipSchema.pre("save", async function (next) {
  // 1. Password Encryption Sequence
  if (this.password && this.isModified("password")) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.tokenVersion += 1; // Invalidate current sessions
  }
  
  // 2. Automated Role Transition
  if (this.approved && this.role === "Applicant") {
    this.role = "Executive Board";
  }

  next();
});

/**
 * @section Indexing
 */
membershipSchema.index({ rollNo: 1, gmail: 1 });
membershipSchema.index({ approved: 1, isActivated: 1 });

module.exports = mongoose.model("Membership", membershipSchema);