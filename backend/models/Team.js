const mongoose = require("mongoose");

/**
 * @description Society Personnel Schema (The Command Structure)
 * Manages the public display and internal hierarchy of the Executive Board.
 * Optimized for ranked retrieval and social uplink management.
 */
const teamSchema = new mongoose.Schema({
  // IDENTITY DATA
  name: { 
    type: String, 
    required: [true, "Identity name is required for board entry."], 
    trim: true 
  },
  role: { 
    type: String, 
    required: [true, "Official designation must be defined."], 
    trim: true 
  }, 
  image: { 
    type: String, 
    default: "/assets/images/placeholder-user.jpg" 
  },
  description: { 
    type: String, 
    default: "Dedicated member of the GCU Computer Science Society leadership terminal.",
    trim: true 
  },

  // ORGANIZATIONAL CLASSIFICATION
  // Defines the departmental node for the team member
  category: { 
    type: String, 
    enum: ['Executive', 'Management', 'Technical', 'Media', 'Advisory'], 
    default: 'Executive' 
  },

  // RANKING PROTOCOL
  // Determines display order (1 = Highest Rank/President, 99 = General Member)
  hierarchy: { 
    type: Number, 
    default: 10,
    min: [1, "Hierarchy cannot exceed level 1."],
    index: true 
  },

  // DIGITAL UPLINKS (Socials)
  socials: {
    instagram: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    twitter: { type: String, trim: true }
  },

  // LIFECYCLE & AUDIT
  // Soft-delete: Allows deactivating a node without wiping its mission history
  isActive: { 
    type: Boolean, 
    default: true 
  },

  // Polymorphic reference to the node creator (Admin or authorized Board Member)
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId,
    required: true
  }
}, { 
  timestamps: true // Tracks appointment (createdAt) and last credential update
});

/**
 * @section Intelligence Indexing
 * Ensures the personnel list renders instantly during high-traffic sessions.
 */
// Primary sorting for the Team Page
teamSchema.index({ hierarchy: 1, name: 1 });
// Filtering by active status and category
teamSchema.index({ isActive: 1, category: 1 });

module.exports = mongoose.model("Team", teamSchema);