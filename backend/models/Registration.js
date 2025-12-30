const mongoose = require("mongoose");

/**
 * @description Mission Enrollment Schema (The Participant Ledger)
 * Manages student sign-ups for events, symposiums, and hackathons.
 * Hardened for attendance analytics and duplicate prevention.
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
  // Direct link to the Event node
  eventId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Event', 
    required: true 
  },
  // Redundant data storage for high-speed dashboard rendering without joins
  eventName: { 
    type: String, 
    required: true,
    trim: true 
  },

  // PARTICIPATION STATUS
  message: { 
    type: String,
    trim: true 
  },
  
  // Attendance Protocol (For generating certificates or post-event metrics)
  attended: { 
    type: Boolean, 
    default: false 
  },

  // Enrollment State (Future-proofing for waitlists/cancellations)
  status: {
    type: String,
    enum: ['Confirmed', 'Waitlisted', 'Cancelled'],
    default: 'Confirmed'
  }
}, { 
  timestamps: true // Captures 'createdAt' as the registration timestamp
});

/**
 * @section Intelligence & Forensic Indexing
 * Optimized for duplicate prevention and rapid export.
 */

// CRITICAL: Prevents a student from registering twice for the same event
RegistrationSchema.index({ rollNo: 1, eventId: 1 }, { unique: true });

// Optimizes the 'Export to CSV' and Attendance List sorting
RegistrationSchema.index({ eventId: 1, rollNo: 1 });

// Optimizes search by email for helpdesk inquiries
RegistrationSchema.index({ email: 1 });

module.exports = mongoose.model("Registration", RegistrationSchema);