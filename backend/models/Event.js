const mongoose = require("mongoose");

/**
 * @description Mission Control: Event Schema
 * Hardened with automated lifecycle management and capacity safeguards.
 */
const eventSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true, 
    trim: true,
    maxlength: [100, "Mission title exceeds maximum buffer (100 chars)."]
  },
  
  date: { 
    type: Date, 
    required: true 
  },

  description: { 
    type: String, 
    required: true 
  },

  image: { 
    type: String, 
    default: "https://placehold.co/600x400/020617/FFD700?text=GCU+CSS+EVENT" 
  },

  location: { 
    type: String, 
    default: "GCU Lahore" 
  },

  // MISSION STATUS PROTOCOL
  status: { 
    type: String, 
    enum: ['upcoming', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },

  // CAPACITY & ENROLLMENT MANAGEMENT
  maxParticipants: { 
    type: Number, 
    default: 0 // 0 represents unlimited slots
  },

  registrationCount: { 
    type: Number, 
    default: 0,
    min: [0, "Count cannot drop below baseline."]
  },

  registrationOpen: { 
    type: Boolean, 
    default: true 
  },

  // LIFECYCLE MANAGEMENT
  // Archiving removes the node from the public main grid but preserves the entry link.
  isArchived: { 
    type: Boolean, 
    default: false 
  },

  // AUTHOR IDENTITY
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'creatorModel'
  },
  creatorModel: {
    type: String,
    required: true,
    enum: ['Admin', 'Membership'],
    default: 'Admin'
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * @section Virtual Logic
 */
eventSchema.virtual('isFull').get(function() {
  if (this.maxParticipants === 0) return false;
  return this.registrationCount >= this.maxParticipants;
});

/**
 * @section Automation Middleware
 * Hardened for lifecycle synchronization without blocking archived registrations.
 */
eventSchema.pre('save', function(next) {
  const now = new Date();
  
  // 1. Auto-transition to 'completed' if the date has passed
  if (this.date < now && this.status === 'upcoming') {
    this.status = 'completed';
  }

  // 2. Capacity Guard: Force close registration only if maxParticipants limit is strictly met
  if (this.maxParticipants > 0 && this.registrationCount >= this.maxParticipants) {
    this.registrationOpen = false;
  }

  // FIXED: Removed auto-lock on isArchived to support link-based registration bypass.
  
  next();
});

/**
 * @section Performance Indexing
 */
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ isArchived: 1, createdAt: -1 });

module.exports = mongoose.model("Event", eventSchema);