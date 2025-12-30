const mongoose = require("mongoose");

/**
 * @description External Communication (Inquiry) Schema
 * Hardened for high-volume intake and multi-admin handling.
 * Captures external signals and tracks the internal resolution protocol.
 */
const contactSchema = new mongoose.Schema({
  // SENDER IDENTITY
  name: { 
    type: String, 
    required: true, 
    trim: true 
  },
  email: { 
    type: String, 
    required: true, 
    lowercase: true,
    trim: true
  },

  // DATA PAYLOAD
  subject: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [150, "Subject exceeds maximum buffer limit."]
  },
  message: { 
    type: String, 
    required: true 
  },

  // INBOX PROTOCOL
  isRead: { 
    type: Boolean, 
    default: false 
  },
  // Soft-delete to keep inquiry history but remove from active view
  isArchived: { 
    type: Boolean, 
    default: false 
  },
  priority: { 
    type: String, 
    enum: ['low', 'normal', 'high'], 
    default: 'normal' 
  },

  // RESOLUTION TRACKING
  // Stores the ObjectId of the admin/member node who addressed the inquiry
  handledBy: { 
    type: mongoose.Schema.Types.ObjectId 
  },
  // Optional: Stores the summary of the response sent to the user
  responsePayload: {
    type: String,
    trim: true
  },
  handledAt: {
    type: Date
  }
}, { 
  timestamps: true // Captures createdAt (Intake Time) and updatedAt
});

/**
 * @section Performance & Logic Indexing
 * Optimized for the Inquiry Inbox and Admin Dashboard metrics.
 */

// Sorting by most recent inquiries
contactSchema.index({ createdAt: -1 });

// Dashboard Metrics: Counting unread/non-archived messages
contactSchema.index({ isRead: 1, isArchived: 1 });

// Search optimization for names and subjects
contactSchema.index({ name: 'text', subject: 'text' });

module.exports = mongoose.model("Contact", contactSchema);