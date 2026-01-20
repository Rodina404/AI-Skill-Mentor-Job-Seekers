const mongoose = require("mongoose");
const { Schema } = mongoose;
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: [isEmail, 'Please enter a valid email'],
    trim: true,
    index: true, // Index for fast login/lookup
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Minimum password length is 8 characters'],
    select: false, // Security: Never return the password hash by default
  },
  role: {
    type: String,
    enum: {
      values: USER_ROLES,
      message: 'Role must be one of: job_seeker, recruiter, admin',
    },
    required: true,
    index: true, // Index for role-based queries
  },
  isActive: {
    type: Boolean,
    default: true, // Soft delete mechanism
  },
  // Reference to the specific profile model (polymorphic reference)
  profileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true,
  },
}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Security: Hash password before saving (pre-save hook)
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
// Security: Method to compare password for login
userSchema.methods.comparePassword = async function(candidatePassword) {
  // 'this.password' is available here because we explicitly select it in the login controller
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);