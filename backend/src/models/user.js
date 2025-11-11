
const mongoose = require('mongoose');

// Define User Schema
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['viewer', 'editor', 'admin'],
      default: 'viewer',
    },
    tenantId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure unique index on email (database-level)
userSchema.index({ email: 1 }, { unique: true });

// Hide sensitive/internal fields when converting to JSON or plain objects
function omitPrivate(doc, ret) {
  if (ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.__v;
    delete ret.password; // never expose password hash
  }
  return ret;
}

userSchema.set('toJSON', {
  transform: omitPrivate,
});

userSchema.set('toObject', {
  transform: omitPrivate,
});

// Export model (use capitalized name 'User')
module.exports = mongoose.models.User || mongoose.model('User', userSchema);

