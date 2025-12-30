const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * @description Public User Identity Schema (General Student Body)
 * Purposefully isolated from the Administrative (Admin/Membership) nodes.
 * Enforces a fixed-role policy to prevent unauthorized privilege escalation.
 */
const userSchema = new mongoose.Schema({
  // CORE IDENTITY
  name: { 
    type: String, 
    required: [true, "Identification name is required."], 
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "Digital uplink address (Email) is required."], 
    unique: true, 
    lowercase: true, 
    trim: true 
  },
  password: { 
    type: String, 
    required: true,
    select: false // Hardened: Prevents password hash leakage in public queries
  },

  // HARDENED ROLE SEGREGATION
  // This model is strictly for the student body. Clearance levels can 
  // ONLY be granted via the Admin or Membership models.
  role: { 
    type: String, 
    enum: ["student"], 
    default: "student",
    immutable: true // Prevents role modification after creation
  },

  // SECURITY STATUS
  isVerified: { 
    type: Boolean, 
    default: false 
  },

  // SECURITY VERSIONING
  // Increments on password reset to invalidate active JWT sessions
  tokenVersion: {
    type: Number,
    default: 0
  }
}, { 
  timestamps: true 
});

/**
 * @section Middlewares
 * Standardized encryption protocol for student access keys.
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    this.tokenVersion += 1; // Force re-authentication on all devices
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * @section Methods
 * Identity verification handshake.
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * @section Intelligence Indexing
 * Optimized for login performance and duplicate prevention.
 */
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);