const mongoose = require("mongoose");

/**
 * @description Society Personnel Schema (The Command Structure)
 * Manages the leadership hierarchy with ranked retrieval and social links.
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
    default: "https://placehold.co/400x400/020617/FFD700?text=CSS+LEADER" 
  },
  description: { 
    type: String, 
    default: "Dedicated member of the GCU Computer Science Society leadership terminal.",
    trim: true 
  },

  // ORGANIZATIONAL CLASSIFICATION
  category: { 
    type: String, 
    enum: ['Executive', 'Management', 'Technical', 'Media', 'Advisory'], 
    default: 'Executive' 
  },

  // RANKING PROTOCOL
  // 1 = President, 2 = VP, etc.
  hierarchy: { 
    type: Number, 
    default: 10,
    min: [1, "Hierarchy cannot exceed level 1."],
    index: true 
  },

  // DIGITAL UPLINKS
  socials: {
    instagram: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    twitter: { type: String, trim: true }
  },

  // LIFECYCLE & AUDIT
  isActive: { 
    type: Boolean, 
    default: true 
  },

  // AUTHOR IDENTITY (Polymorphic Refined)
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
  timestamps: true 
});

/**
 * @section Intelligence Indexing
 */
teamSchema.index({ hierarchy: 1, name: 1 });
teamSchema.index({ isActive: 1, category: 1 });

module.exports = mongoose.model("Team", teamSchema);