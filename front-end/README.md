
  # Professional AI Skill Mentor Website

  Run `npm run dev` to start the development server.

This project implements robust **frontend validation** across authentication, job posting, admin actions, and job listings. It ensures clean UX, prevents invalid actions, and maintains data integrity.

---

## 1️⃣ Authentication & Role-Based Validation

**✅ Validations implemented:**
- Wrapped the app with `AuthProvider`
- Enforced role-based access control
- Restricted Admin-only actions
- Protected routes based on user role

**📁 Where to find the code:**
- `context/AuthContext.tsx` or `providers/AuthProvider.tsx`
- `App.tsx` (where the provider wraps the app)
- `routes/ProtectedRoute.tsx` (if exists)

---

## 2️⃣ Login Component Validations

**✅ Validations implemented:**
- Email format validation
- Password required (cannot be empty)
- Inline error messages
- Real-time error clearing on input change
- Disabled submit button while loading
- Loading spinner during sign-in

**📁 Where to find the code:**
- `components/Auth/Login.tsx`
- Validation helpers: `utils/validation.ts → isValidEmail()`
- UI states: `useState(error)`, `useState(isLoading)`

---

## 3️⃣ SignUp Component Validations

**✅ Validations implemented:**
- Full name length validation (2–100 chars)
- Email format validation
- Strong password validation:
  - ≥ 8 characters
  - Uppercase & lowercase letters
  - Number
- Required checkbox for Terms & Conditions
- Role selection validation
- Inline field-level error messages
- Password helper text
- Disabled submit button + loading spinner

**📁 Where to find the code:**
- `components/Auth/SignUp.tsx`
- Validation helpers:
  - `utils/validation.ts → validateName(), validatePassword(), isValidEmail()`
- Checkbox & role logic inside component state

---

## 4️⃣ Job Posting Component Validations

**✅ Validations implemented:**
- Required fields: Job title, Company, Location
- Text length validation:
  - Description: 50–5000 chars
  - Requirements: 20–3000 chars
- Skills validation (at least one skill required)
- Character count feedback (live)
- Error summary panel on submit
- Auto-scroll to first error
- Real-time error clearing
- Disabled submit button + loading state

**📁 Where to find the code:**
- `components/Jobs/PostJob.tsx`
- Validation helpers: `utils/validation.ts → validateTextLength()`
- Scroll logic: `useRef()` + `scrollIntoView()`

---

## 5️⃣ Admin Dashboard Validations

**✅ Validations implemented:**
- Prevent re-approving already approved jobs
- Disabled “Approve” button for approved jobs
- Alert if approval is attempted again
- Valid tab navigation (no invalid states)

**📁 Where to find the code:**
- `components/Admin/AdminDashboard.tsx`
- State logic: `useState(approvedJobs)`
- Button disable logic: `disabled={job.isApproved}`

---

## 6️⃣ Jobs Listing & Filters Validation

**✅ Validations implemented:**
- Empty state handling when no jobs exist
- Conditional messaging when filters are active
- “Clear Filters” button shown only when needed
- Job count updates dynamically based on filters
- Search & filter input validation

**📁 Where to find the code:**
- `components/Jobs/JobsList.tsx`
- Filter logic: `useState(filters)`, `filteredJobs.length`

---

## 7️⃣ Validation Utilities (Centralized)

**✅ Validations implemented:**
- Email regex validation
- Password strength validation
- Name validation
- Text length validation
- Score range validation (0–100)
- Rating range validation (0–5)

**📁 Where to find the code:**
- `utils/validation.ts`

> This file ensures clean architecture, reusable validation, and production-ready design.

---

## 8️⃣ Global UX & Safety Validations

**✅ Validations implemented:**
- Disabled buttons prevent double submission
- Loading states prevent race conditions
- Inline error messages with icons
- Empty states with helpful guidance
- Navigation links fully functional
- Role-based UI visibility

**📁 Where to find the code:**
- Across all components using:
  - `isLoading`
  - `disabled`
  - Conditional rendering: `{condition && (...)}`

---

## 🔑 Short Summary

I implemented frontend validation across **authentication, job posting, admin actions, and filtering**. This includes:

- Input validation
- Role-based access control
- Disabled invalid actions
- Loading states
- Centralized validation utilities
- Clear UX feedback

All validations are **reusable**, handled both at field level and action level, preventing incorrect data and broken flows.
