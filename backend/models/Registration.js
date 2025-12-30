const mongoose = require("mongoose");

/**
 * @description Mission Enrollment Schema (The Participant Ledger)
 * Manages student sign-ups for events with duplicate prevention and attendance tracking.
 */
const RegistrationSchema = new mongoose.Schema({
  // PARTICIPANT IDENTITY
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  rollNo: { 
    type: String, 
    required: true, 
    uppercase: true,
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true,
    trim: true 
  },
  phoneNumber: { 
    type: String, 
    required: true,
    trim: true 
  },

  // ACADEMIC CONTEXT
  department: { 
    type: String, 
    required: true,
    trim: true 
  },
  semester: { 
    type: String, 
    required: true 
  },

  // MISSION UPLINK
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  // Denormalized for speed - prevents unnecessary DB joins in large lists
  eventName: { 
    type: String, 
    required: true,
    trim: true 
  },

  message: { 
    type: String,
    trim: true 
  },
  
  attended: { 
    type: Boolean, 
    default: false 
  },

  status: {
    type: String,
    enum: ['Confirmed', 'Waitlisted', 'Cancelled'],
    default: 'Confirmed'
  }
}, { 
  timestamps: true 
});

/**
 * @section Intelligence & Forensic Indexing
 */

// LIVE FIX: Strict duplicate prevention at the Database level
RegistrationSchema.index({ rollNo: 1, eventId: 1 }, { unique: true });
RegistrationSchema.index({ eventId: 1, rollNo: 1 });
RegistrationSchema.index({ email: 1 });

/**
 * @section Pre-save Normalization
 */
RegistrationSchema.pre('save', function(next) {
    // Standardize Roll Numbers: Remove spaces and hyphens if necessary for uniform searching
    // Example: "22-CS-01" remains clean, but "22 CS 01" becomes "22-CS-01" logic can be added here
    this.rollNo = this.rollNo.replace(/\s+/g, '');
    next();
});

module.exports = mongoose.model("Registration", RegistrationSchema);