const recruiterProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // 1:1 relationship with User
    index: true,
  },
  companyName: { type: String, trim: true, required: true },
  contactName: { type: String, trim: true, required: true },
  phone: { type: String, trim: true },
  industry: { type: String, trim: true },
}, {
  timestamps: true,
});

const RecruiterProfile = mongoose.model('RecruiterProfile', recruiterProfileSchema);
