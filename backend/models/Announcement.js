const mongoose = require("mongoose");

/**
 * @description Official Society Announcement Schema (The Broadcaster)
 * Handles institutional alerts, notices, and opportunities.
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

  date: { 
    type: Date, 
    default: Date.now 
  },

  type: { 
    type: String, 
    enum: ['Update', 'Notice', 'Opportunity'],
    required: true,
    default: 'Update' 
  },

  priority: {
    type: String,
    enum: ['Normal', 'High', 'Critical'],
    default: 'Normal'
  },

  isArchived: { 
    type: Boolean, 
    default: false 
  },

  /**
   * AUTHOR IDENTITY (Polymorphic Ref)
   * Added 'refPath' logic. This is the "Ironclad" way to tell Mongoose 
   * to look in either the 'Admin' or 'Membership' collection depending on who posted.
   */
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'creatorModel' // Dynamic reference
  },
  creatorModel: {
    type: String,
    required: true,
    enum: ['Admin', 'Membership'],
    default: 'Admin'
  }
}, { 
  timestamps: true 
});

/**
 * @section Performance & Logic Indexing
 */
announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ isArchived: 1, priority: -1 });
announcementSchema.index({ title: 'text', description: 'text' });

module.exports = mongoose.model("Announcement", announcementSchema);