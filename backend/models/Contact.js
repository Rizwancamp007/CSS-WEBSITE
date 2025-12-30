const mongoose = require("mongoose");

/**
 * @description External Communication (Inquiry) Schema
 * Handles the intake of public messages and tracks internal resolution status.
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
  isArchived: { 
    type: Boolean, 
    default: false 
  },
  priority: { 
    type: String, 
    enum: ['low', 'normal', 'high'], 
    default: 'normal' 
  },

  // RESOLUTION TRACKING (Polymorphic Refined)
  // Allows the dashboard to populate the name of the Admin OR Member who handled it
  handledBy: { 
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'handlerModel' 
  },
  handlerModel: {
    type: String,
    enum: ['Admin', 'Membership'],
    default: 'Admin'
  },
  responsePayload: {
    type: String,
    trim: true
  },
  handledAt: {
    type: Date
  }
}, { 
  timestamps: true 
});

/**
 * @section Performance & Logic Indexing
 */
contactSchema.index({ createdAt: -1 });
contactSchema.index({ isRead: 1, isArchived: 1 });
contactSchema.index({ name: 'text', subject: 'text' });

// AUTO-STATUS PROTOCOL: 
// Automatically sets handledAt when handledBy is assigned
contactSchema.pre('save', function(next) {
    if (this.isModified('handledBy') && this.handledBy) {
        this.handledAt = Date.now();
        this.isRead = true; // If handled, it must be read.
    }
    next();
});

module.exports = mongoose.model("Contact", contactSchema);