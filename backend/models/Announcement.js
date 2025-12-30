const mongoose = require("mongoose");

/**
 * @description Official Society Announcement Schema (The Broadcaster)
 * Handles institutional alerts, notices, and opportunities.
 * Hardened for polymorphic authorship and high-speed public retrieval.
 */
const announcementSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: [100, "Title sequence exceeds maximum buffer (100 chars)."]
  },
  
  description: { 
    type: String, 
    required: true 
  },

  // Manual date override for scheduled events, defaults to transmission time
  date: { 
    type: Date, 
    default: Date.now 
  },

  // Broadcast Classification
  type: { 
    type: String, 
    enum: ['Update', 'Notice', 'Opportunity'],
    required: true,
    default: 'Update' 
  },

  // URGENCY PROTOCOL
  // Allows pinning high-priority alerts to the top of the frontend feed
  priority: {
    type: String,
    enum: ['Normal', 'High', 'Critical'],
    default: 'Normal'
  },

  // LIFECYCLE MANAGEMENT
  // Soft-delete flag ensures historical data remains in DB but hidden from public
  isArchived: { 
    type: Boolean, 
    default: false 
  },

  // AUTHOR IDENTITY (Polymorphic)
  // Stores the ObjectId of either an Admin node or an Executive Board node
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
}, { 
  timestamps: true // Captures createdAt (Broadcast Time) and updatedAt
});

/**
 * @section Performance & Logic Indexing
 * Optimized for institutional-scale feed filtering and sorting.
 */

// Critical for "Latest News" sorting on Home and Announcement pages
announcementSchema.index({ createdAt: -1 });

// Optimizes public feed which filters out archived messages
announcementSchema.index({ isArchived: 1, priority: -1 });

// Text search indexing for "Search Announcements" feature on frontend
announcementSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model("Announcement", announcementSchema);