const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * @description Master Administrative Identity Schema
 * Hardened for Role-Based Access Control (RBAC) and Brute-force protection.
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
    required: true,
    select: false // CRITICAL: Prevents password leakage in general API responses
  },

  // --- SECURITY & BRUTE-FORCE SHIELD ---
  loginAttempts: { 
    type: Number, 
    default: 0 
  },
  lockUntil: { 
    type: Number 
  },
  
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
  
  tokenVersion: {
    type: Number,
    default: 0
  },

  // --- PERMISSION MATRIX (RBAC) ---
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
 * Automatic encryption protocol.
 */
adminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    
    // Security logic: Incrementing version invalidates existing tokens
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