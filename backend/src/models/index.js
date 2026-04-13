// AUTH
const AuthSession = require("./auth/authSession.model");
const EmailVerificationToken = require("./auth/emailVerificationToken.model");
const PasswordResetToken = require("./auth/passwordResetToken.model");
const LoginAttempt = require("./auth/loginAttempt.model");
const AccountLock = require("./auth/accountLock.model");

// USERS
const User = require("./users/user.model");

// PROFILES
const JobSeekerProfile = require("./users/jobSeekerProfile.model");
const RecruiterProfile = require("./users/recruiterProfile.model");
const AdminProfile = require("./users/adminProfile.model");

// RESUME
const Resume = require("./ai/resume.model");
const ReadinessScore = require("./ai/readinessScore.model");


// SKILLS
const Skill = require("./skills/skill.model");
const UserSkill = require("./skills/userSkill.model");
const SkillGap = require("./skills/skillGap.model");

// JOBS
const JobPosting = require("./jobs/jobPosting.model");
const JobApplication = require("./jobs/jobApplication.model");
const CandidateMatch = require("./jobs/candidateMatch.model");

// RECOMMENDATIONS
const CourseRecommendation = require("./recommendations/courseRecommendation.model");
const LearningProgress = require("./recommendations/learningProgress.model");

// MARKET
const MarketSkillData = require("./market/marketSkillData.model");

// AUDIT / AI
const AuditLog = require("./audit/auditLog.model");
const ModelAudit = require("./audit/modelAudit.model");

// RBAC
const Role = require("./rbac/role.model");
const Permission = require("./rbac/permission.model");
const RolePermission = require("./rbac/rolePermission.model");

// NOTIFICATIONS
const Notification = require("./notifications/notification.model");

module.exports = {
  // auth
  AuthSession,
  EmailVerificationToken,
  PasswordResetToken,
  LoginAttempt,
  AccountLock,

  // user & profiles
  User,
  JobSeekerProfile,
  RecruiterProfile,
  AdminProfile,

  // resume/skills
  Resume,
  Skill,
  UserSkill,
  SkillGap,
  ReadinessScore,

  // jobs
  JobPosting,
  JobApplication,
  CandidateMatch,

  // recommendations
  CourseRecommendation,
  LearningProgress,

  // market
  MarketSkillData,

  // audit/ai
  AuditLog,
  ModelAudit,

  // rbac
  Role,
  Permission,
  RolePermission,

  // notifications
  Notification,
  
};
