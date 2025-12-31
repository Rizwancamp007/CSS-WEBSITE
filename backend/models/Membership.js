const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

const membershipSchema = new mongoose.Schema({
  fullName: { type: String, required: true, trim: true },
  rollNo: { type: String, required: true, unique: true, uppercase: true, trim: true },
  department: { type: String, required: true, trim: true },
  semester: { type: String, required: true },
  gmail: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phoneNumber: { type: String, required: true, trim: true },

  applyingRole: { type: String, required: true }, 
  role: { type: String, default: "Applicant" },
  approved: { type: Boolean, default: false },

  isActivated: { type: Boolean, default: false },
  activationToken: { type: String },
  activationExpire: { type: Date },
  password: { type: String, select: false },

  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Number },
  tokenVersion: { type: Number, default: 0 },

  permissions: {
    isAdmin: { type: Boolean, default: false },
    canManageEvents: { type: Boolean, default: false },
    canManageAnnouncements: { type: Boolean, default: false },
    canViewRegistrations: { type: Boolean, default: false },
    canManageTeams: { type: Boolean, default: false },
    canExportData: { type: Boolean, default: false }
  }
}, { timestamps: true });

// ===== Methods =====
membershipSchema.methods.createActivationToken = function() {
  const token = crypto.randomBytes(32).toString("hex");
  this.activationToken = crypto.createHash("sha256").update(token).digest("hex");
  this.activationExpire = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token; 
};

membershipSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// ===== Pre-save Middleware =====
membershipSchema.pre("save", async function(next) {
  if (this.password && this.isModified("password")) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    this.tokenVersion += 1; 
  }

  if (this.approved && this.role === "Applicant") {
    this.role = "Executive Board";
  }

  next();
});

// ===== Indexes =====
membershipSchema.index({ rollNo: 1, gmail: 1 });
membershipSchema.index({ approved: 1, isActivated: 1 });

module.exports = mongoose.model("Membership", membershipSchema);
