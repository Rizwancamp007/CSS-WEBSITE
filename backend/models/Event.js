const mongoose = require("mongoose");

/**
 * @description Mission Control: Event Schema
 * Manages society activities, technical symposiums, and elite hackathons.
 * Integrated with capacity management and automated status transitions.
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

  // Visual asset link
  image: { 
    type: String, 
    default: "/assets/images/placeholder.jpg" 
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

  // AUTHOR IDENTITY (Polymorphic)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

/**
 * @section Virtual Logic
 * Dynamically calculates if slots are available without a separate DB query.
 */
eventSchema.virtual('isFull').get(function() {
  if (this.maxParticipants === 0) return false;
  return this.registrationCount >= this.maxParticipants;
});

/**
 * @section Automation Middleware
 * Ensures the status is synchronized with the temporal dimension before saving.
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
// Optimized for "Upcoming Events" feed on Home/Events pages
eventSchema.index({ date: 1, status: 1 });
// Optimized for Admin Archive views
eventSchema.index({ isArchived: 1, createdAt: -1 });

module.exports = mongoose.model("Event", eventSchema);