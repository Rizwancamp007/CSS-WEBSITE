const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * @description Master Administrative Identity Schema
 * Hardened for Role-Based Access Control (RBAC) and Brute-force protection.
 * Central authority node for the Society Mainframe.
 */
const adminSchema = new mongoose.Schema({
  fullName: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true 
  },

  // --- SECURITY & BRUTE-FORCE SHIELD ---
  loginAttempts: { 
    type: Number, 
    default: 0 
  },
  lockUntil: { 
    type: Number 
  },
  
  // LEVEL 0 CLEARANCE
  // If true, the authorize middleware grants total access regardless of specific flags.
  isSuperAdmin: { 
    type: Boolean, 
    default: false 
  }, 

  // --- LIFECYCLE & FORENSICS ---
  isActive: { 
    type: Boolean, 
    default: true 
  }, 
  lastLogin: { 
    type: Date 
  },
  
  // SECURITY VERSIONING
  // Increments on password change to invalidate old JWT tokens.
  tokenVersion: {
    type: Number,
    default: 0
  },

  // --- PERMISSION MATRIX (RBAC) ---
  // Granular control for departmental administrators.
  permissions: {
    isAdmin: { 
      type: Boolean, 
      default: true 
    },
    canManageEvents: { 
      type: Boolean, 
      default: false 
    },
    canManageAnnouncements: { 
      type: Boolean, 
      default: false 
    },
    canViewRegistrations: { 
      type: Boolean, 
      default: false 
    },
    canManageTeams: { 
      type: Boolean, 
      default: false 
    },
    canExportData: { 
      type: Boolean, 
      default: false 
    }
  }
}, { 
  timestamps: true 
});

/**
 * @section Middlewares
 * Automatic encryption protocol. Ensures Access Keys are never stored in plain text.
 */
adminSchema.pre("save", async function (next) {
  // Only encrypt if password was modified
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(12); // Increased cost factor for industrial security
    this.password = await bcrypt.hash(this.password, salt);
    
    // Increment version to force logout on other devices
    this.tokenVersion += 1;
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * @section Verification Methods
 */
adminSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("Admin", adminSchema);