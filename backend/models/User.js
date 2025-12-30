const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/**
 * @description Public User Identity Schema (General Student Body)
 * Purposefully isolated from Administrative nodes.
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
    select: false // Hardened: Prevents password hash leakage
  },

  // HARDENED ROLE SEGREGATION
  role: { 
    type: String, 
    enum: ["student"], 
    default: "student",
    immutable: true // "Airgap" security: role cannot be changed
  },

  // SECURITY STATUS
  isVerified: { 
    type: Boolean, 
    default: false 
  },

  // SECURITY VERSIONING
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
    // Standardizing salt rounds to 12 for production-grade security
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.tokenVersion += 1; 
    next();
  } catch (err) {
    next(err);
  }
});

/**
 * @section Methods
 */
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Use explicit select("+password") in controller to make this work
  return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * @section Intelligence Indexing
 */
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);