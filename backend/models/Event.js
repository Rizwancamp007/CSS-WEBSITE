const mongoose = require("mongoose");

/**
 * @description Mission Control: Event Schema
 * Manages society activities with automated status transitions and capacity safeguards.
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

  // Visual asset link - Standardized for cloud/local storage
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
    default: 0 // 0 represents unlimited uplink slots
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
  isArchived: { 
    type: Boolean, 
    default: false 
  },

  // AUTHOR IDENTITY (Polymorphic Refined)
  // Ensures populate() works for both Master Admin and Executive Board members
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
 */
eventSchema.pre('save', function(next) {
  const now = new Date();
  
  // Auto-transition to 'completed' if the date has passed
  if (this.date < now && this.status !== 'cancelled') {
    this.status = 'completed';
  }

  // Force close registration if capacity is reached
  if (this.maxParticipants > 0 && this.registrationCount >= this.maxParticipants) {
    this.registrationOpen = false;
  }
  
  next();
});

/**
 * @section Performance & Intelligence Indexing
 */
eventSchema.index({ date: 1, status: 1 });
eventSchema.index({ isArchived: 1, createdAt: -1 });

module.exports = mongoose.model("Event", eventSchema);