# AI Skill Mentor Frontend Component Map

Generated from the current working tree on 2026-06-14. Line citations refer to the current files, including uncommitted frontend changes.

## Scope And Routing Context

- Covered every source file under `Frontend-React/src/components/`, `Frontend-React/src/context/`, and `Frontend-React/src/api/`.
- `Frontend-React/src/pages/` does not exist; application pages are implemented in `src/components/` and selected by `App.tsx`.
- Also read all remaining `Frontend-React/src/` files for context. Files outside the requested per-file report scope:
  - `Frontend-React/src/App.tsx`
  - `Frontend-React/src/Attributions.md`
  - `Frontend-React/src/guidelines/Guidelines.md`
  - `Frontend-React/src/index.css`
  - `Frontend-React/src/main.tsx`
  - `Frontend-React/src/styles/globals.css`
  - `Frontend-React/src/utils/validation.ts`
- `App.tsx` protects routes by role: job seekers can access profile/history/saved jobs/courses/learning path/analysis/jobs; recruiters can access recruiter profile/job posting/jobs; admins can access admin/jobs. Public routes are home/login/signup/unauthorized.

## Reading Guide

- Every `onClick` and every API call has a line citation.
- "Fixed visible text" lists literal JSX text; dynamic array/object content is identified as dynamic rather than duplicated item-by-item.
- UI primitive modules expose reusable building blocks and normally have no fixed page text or application API calls.

## `Frontend-React/src/components/AdminDashboard.tsx`

1. **File:** `AdminDashboard.tsx` at `Frontend-React/src/components/AdminDashboard.tsx`
2. **Renders:** Admin dashboard with overview, user management, job review, and course management tabs.
   - Exports: `AdminDashboard`.
3. **Visible UI elements:**
   - `<button>` at [components/AdminDashboard.tsx:157](Frontend-React/src/components/AdminDashboard.tsx#L157): label/text **Overview**; onClick=`() => setActiveTab('overview')`. **onClick:** `() => setActiveTab('overview')` at [components/AdminDashboard.tsx:157](Frontend-React/src/components/AdminDashboard.tsx#L157).
   - `<button>` at [components/AdminDashboard.tsx:167](Frontend-React/src/components/AdminDashboard.tsx#L167): label/text **Users**; onClick=`() => setActiveTab('users')`. **onClick:** `() => setActiveTab('users')` at [components/AdminDashboard.tsx:167](Frontend-React/src/components/AdminDashboard.tsx#L167).
   - `<button>` at [components/AdminDashboard.tsx:177](Frontend-React/src/components/AdminDashboard.tsx#L177): label/text **Jobs**; onClick=`() => setActiveTab('jobs')`. **onClick:** `() => setActiveTab('jobs')` at [components/AdminDashboard.tsx:177](Frontend-React/src/components/AdminDashboard.tsx#L177).
   - `<button>` at [components/AdminDashboard.tsx:187](Frontend-React/src/components/AdminDashboard.tsx#L187): label/text **Courses**; onClick=`() => setActiveTab('courses')`. **onClick:** `() => setActiveTab('courses')` at [components/AdminDashboard.tsx:187](Frontend-React/src/components/AdminDashboard.tsx#L187).
   - `<button>` at [components/AdminDashboard.tsx:281](Frontend-React/src/components/AdminDashboard.tsx#L281): label/text **{handleAddUser} Add User**; onClick=`handleAddUser`. **onClick:** `handleAddUser` at [components/AdminDashboard.tsx:281](Frontend-React/src/components/AdminDashboard.tsx#L281).
   - `<button>` at [components/AdminDashboard.tsx:339](Frontend-React/src/components/AdminDashboard.tsx#L339): label/text **View**; onClick=`() => handleViewJob(job.title)`. **onClick:** `() => handleViewJob(job.title)` at [components/AdminDashboard.tsx:339](Frontend-React/src/components/AdminDashboard.tsx#L339).
   - `<button>` at [components/AdminDashboard.tsx:345](Frontend-React/src/components/AdminDashboard.tsx#L345): label/text **{isApproved} {isApproved ? 'Approved' : 'Approve'}**; disabled=`isApproved`; onClick=`() => handleApproveJob(job.title)`. **onClick:** `() => handleApproveJob(job.title)` at [components/AdminDashboard.tsx:345](Frontend-React/src/components/AdminDashboard.tsx#L345).
   - `<button>` at [components/AdminDashboard.tsx:369](Frontend-React/src/components/AdminDashboard.tsx#L369): label/text **{handleAddCourse} Add Course**; onClick=`handleAddCourse`. **onClick:** `handleAddCourse` at [components/AdminDashboard.tsx:369](Frontend-React/src/components/AdminDashboard.tsx#L369).
   - `<button>` at [components/AdminDashboard.tsx:389](Frontend-React/src/components/AdminDashboard.tsx#L389): label/text **(no fixed label)**; onClick=`() => setShowAddUserModal(false)`. **onClick:** `() => setShowAddUserModal(false)` at [components/AdminDashboard.tsx:389](Frontend-React/src/components/AdminDashboard.tsx#L389).
   - `<input>` at [components/AdminDashboard.tsx:398](Frontend-React/src/components/AdminDashboard.tsx#L398): label/text **{newUser.name}**; type=`text`; placeholder=`Full Name`; value=`newUser.name`; onChange=`(e) => setNewUser({ ...newUser, name: e.target.value })`.
   - `<input>` at [components/AdminDashboard.tsx:411](Frontend-React/src/components/AdminDashboard.tsx#L411): label/text **{newUser.email}**; type=`email`; placeholder=`email@example.com`; value=`newUser.email`; onChange=`(e) => setNewUser({ ...newUser, email: e.target.value })`.
   - `<select>` at [components/AdminDashboard.tsx:424](Frontend-React/src/components/AdminDashboard.tsx#L424): label/text **{newUser.role} Job Seeker Recruiter Administrator**; value=`newUser.role`; onChange=`(e) => setNewUser({ ...newUser, role: e.target.value })`.
   - `<button>` at [components/AdminDashboard.tsx:437](Frontend-React/src/components/AdminDashboard.tsx#L437): label/text **Cancel**; onClick=`() => setShowAddUserModal(false)`. **onClick:** `() => setShowAddUserModal(false)` at [components/AdminDashboard.tsx:437](Frontend-React/src/components/AdminDashboard.tsx#L437).
   - `<button>` at [components/AdminDashboard.tsx:443](Frontend-React/src/components/AdminDashboard.tsx#L443): label/text **{handleSaveUser} {isLoading} {isLoading ? ( <> <div className="w-5 h-5 border-2 border-white border-t-trans...} Saving... Save User**; disabled=`isLoading`; onClick=`handleSaveUser`. **onClick:** `handleSaveUser` at [components/AdminDashboard.tsx:443](Frontend-React/src/components/AdminDashboard.tsx#L443).
   - `<button>` at [components/AdminDashboard.tsx:471](Frontend-React/src/components/AdminDashboard.tsx#L471): label/text **(no fixed label)**; onClick=`() => setShowAddCourseModal(false)`. **onClick:** `() => setShowAddCourseModal(false)` at [components/AdminDashboard.tsx:471](Frontend-React/src/components/AdminDashboard.tsx#L471).
   - `<input>` at [components/AdminDashboard.tsx:478](Frontend-React/src/components/AdminDashboard.tsx#L478): label/text **{newCourse.title}**; type=`text`; placeholder=`Course Title`; value=`newCourse.title`; onChange=`(e) => setNewCourse({ ...newCourse, title: e.target.value })`.
   - `<input>` at [components/AdminDashboard.tsx:488](Frontend-React/src/components/AdminDashboard.tsx#L488): label/text **{newCourse.platform}**; type=`text`; placeholder=`e.g. Coursera, Udemy`; value=`newCourse.platform`; onChange=`(e) => setNewCourse({ ...newCourse, platform: e.target.value })`.
   - `<input>` at [components/AdminDashboard.tsx:498](Frontend-React/src/components/AdminDashboard.tsx#L498): label/text **{newCourse.duration}**; type=`text`; placeholder=`e.g. 4 weeks`; value=`newCourse.duration`; onChange=`(e) => setNewCourse({ ...newCourse, duration: e.target.value })`.
   - `<select>` at [components/AdminDashboard.tsx:508](Frontend-React/src/components/AdminDashboard.tsx#L508): label/text **{newCourse.level} Beginner Intermediate Advanced**; value=`newCourse.level`; onChange=`(e) => setNewCourse({ ...newCourse, level: e.target.value })`.
   - `<button>` at [components/AdminDashboard.tsx:520](Frontend-React/src/components/AdminDashboard.tsx#L520): label/text **Cancel**; onClick=`() => setShowAddCourseModal(false)`. **onClick:** `() => setShowAddCourseModal(false)` at [components/AdminDashboard.tsx:520](Frontend-React/src/components/AdminDashboard.tsx#L520).
   - `<button>` at [components/AdminDashboard.tsx:526](Frontend-React/src/components/AdminDashboard.tsx#L526): label/text **{handleSaveCourse} {isLoading} {isLoading ? ( <> <div className="w-5 h-5 border-2 border-white border-t-trans...} Saving... Save Course**; disabled=`isLoading`; onClick=`handleSaveCourse`. **onClick:** `handleSaveCourse` at [components/AdminDashboard.tsx:526](Frontend-React/src/components/AdminDashboard.tsx#L526).
   - Fixed visible text (51 literals): "Admin Dashboard" ([components/AdminDashboard.tsx:125](Frontend-React/src/components/AdminDashboard.tsx#L125)); "Manage users, jobs, and system performance" ([components/AdminDashboard.tsx:128](Frontend-React/src/components/AdminDashboard.tsx#L128)); "Overview" ([components/AdminDashboard.tsx:164](Frontend-React/src/components/AdminDashboard.tsx#L164)); "Users" ([components/AdminDashboard.tsx:174](Frontend-React/src/components/AdminDashboard.tsx#L174)); "Jobs" ([components/AdminDashboard.tsx:184](Frontend-React/src/components/AdminDashboard.tsx#L184)); "Courses" ([components/AdminDashboard.tsx:194](Frontend-React/src/components/AdminDashboard.tsx#L194)); "Recent Users" ([components/AdminDashboard.tsx:207](Frontend-React/src/components/AdminDashboard.tsx#L207)); "• Joined" ([components/AdminDashboard.tsx:222](Frontend-React/src/components/AdminDashboard.tsx#L222)); "Recent Jobs" ([components/AdminDashboard.tsx:231](Frontend-React/src/components/AdminDashboard.tsx#L231)); "applicants" ([components/AdminDashboard.tsx:240](Frontend-React/src/components/AdminDashboard.tsx#L240)); "Posted" ([components/AdminDashboard.tsx:244](Frontend-React/src/components/AdminDashboard.tsx#L244)); "System Alerts" ([components/AdminDashboard.tsx:254](Frontend-React/src/components/AdminDashboard.tsx#L254)); "All systems operational" ([components/AdminDashboard.tsx:261](Frontend-React/src/components/AdminDashboard.tsx#L261)); "Last checked: 2 minutes ago" ([components/AdminDashboard.tsx:262](Frontend-React/src/components/AdminDashboard.tsx#L262)); "User growth increased by 15% this week" ([components/AdminDashboard.tsx:268](Frontend-React/src/components/AdminDashboard.tsx#L268)); "1,234 new registrations" ([components/AdminDashboard.tsx:269](Frontend-React/src/components/AdminDashboard.tsx#L269)); "User Management" ([components/AdminDashboard.tsx:280](Frontend-React/src/components/AdminDashboard.tsx#L280)); "Add User" ([components/AdminDashboard.tsx:285](Frontend-React/src/components/AdminDashboard.tsx#L285)); "Name" ([components/AdminDashboard.tsx:293](Frontend-React/src/components/AdminDashboard.tsx#L293)); "Email" ([components/AdminDashboard.tsx:294](Frontend-React/src/components/AdminDashboard.tsx#L294)); "Role" ([components/AdminDashboard.tsx:295](Frontend-React/src/components/AdminDashboard.tsx#L295)); "Joined" ([components/AdminDashboard.tsx:296](Frontend-React/src/components/AdminDashboard.tsx#L296)); "Status" ([components/AdminDashboard.tsx:297](Frontend-React/src/components/AdminDashboard.tsx#L297)); "Job Management" ([components/AdminDashboard.tsx:325](Frontend-React/src/components/AdminDashboard.tsx#L325)); "• Posted" ([components/AdminDashboard.tsx:335](Frontend-React/src/components/AdminDashboard.tsx#L335)); "applicants • Status:" ([components/AdminDashboard.tsx:336](Frontend-React/src/components/AdminDashboard.tsx#L336)); "View" ([components/AdminDashboard.tsx:342](Frontend-React/src/components/AdminDashboard.tsx#L342)); "Course Management" ([components/AdminDashboard.tsx:368](Frontend-React/src/components/AdminDashboard.tsx#L368)); "Add Course" ([components/AdminDashboard.tsx:373](Frontend-React/src/components/AdminDashboard.tsx#L373)); "Manage and curate course recommendations for users." ([components/AdminDashboard.tsx:377](Frontend-React/src/components/AdminDashboard.tsx#L377)); "Add New User" ([components/AdminDashboard.tsx:388](Frontend-React/src/components/AdminDashboard.tsx#L388)); "Name" ([components/AdminDashboard.tsx:395](Frontend-React/src/components/AdminDashboard.tsx#L395)); "Email" ([components/AdminDashboard.tsx:408](Frontend-React/src/components/AdminDashboard.tsx#L408)); "Role" ([components/AdminDashboard.tsx:421](Frontend-React/src/components/AdminDashboard.tsx#L421)); "Job Seeker" ([components/AdminDashboard.tsx:429](Frontend-React/src/components/AdminDashboard.tsx#L429)); "Recruiter" ([components/AdminDashboard.tsx:430](Frontend-React/src/components/AdminDashboard.tsx#L430)); "Administrator" ([components/AdminDashboard.tsx:431](Frontend-React/src/components/AdminDashboard.tsx#L431)); "Cancel" ([components/AdminDashboard.tsx:440](Frontend-React/src/components/AdminDashboard.tsx#L440)); "Saving..." ([components/AdminDashboard.tsx:450](Frontend-React/src/components/AdminDashboard.tsx#L450)); "Save User" ([components/AdminDashboard.tsx:455](Frontend-React/src/components/AdminDashboard.tsx#L455)); "Add New Course" ([components/AdminDashboard.tsx:470](Frontend-React/src/components/AdminDashboard.tsx#L470)); "Title" ([components/AdminDashboard.tsx:477](Frontend-React/src/components/AdminDashboard.tsx#L477)); "Platform" ([components/AdminDashboard.tsx:487](Frontend-React/src/components/AdminDashboard.tsx#L487)); "Duration" ([components/AdminDashboard.tsx:497](Frontend-React/src/components/AdminDashboard.tsx#L497)); "Level" ([components/AdminDashboard.tsx:507](Frontend-React/src/components/AdminDashboard.tsx#L507)); "Beginner" ([components/AdminDashboard.tsx:513](Frontend-React/src/components/AdminDashboard.tsx#L513)); "Intermediate" ([components/AdminDashboard.tsx:514](Frontend-React/src/components/AdminDashboard.tsx#L514)); "Advanced" ([components/AdminDashboard.tsx:515](Frontend-React/src/components/AdminDashboard.tsx#L515)); "Cancel" ([components/AdminDashboard.tsx:523](Frontend-React/src/components/AdminDashboard.tsx#L523)); "Saving..." ([components/AdminDashboard.tsx:533](Frontend-React/src/components/AdminDashboard.tsx#L533)); "Save Course" ([components/AdminDashboard.tsx:538](Frontend-React/src/components/AdminDashboard.tsx#L538)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - `activeTab` / `setActiveTab` at [components/AdminDashboard.tsx:5](Frontend-React/src/components/AdminDashboard.tsx#L5), initial value `'overview'`. Re-renders are triggered at [components/AdminDashboard.tsx:158](Frontend-React/src/components/AdminDashboard.tsx#L158) with `'overview'`; [components/AdminDashboard.tsx:168](Frontend-React/src/components/AdminDashboard.tsx#L168) with `'users'`; [components/AdminDashboard.tsx:178](Frontend-React/src/components/AdminDashboard.tsx#L178) with `'jobs'`; [components/AdminDashboard.tsx:188](Frontend-React/src/components/AdminDashboard.tsx#L188) with `'courses'`.
   - `approvedJobs` / `setApprovedJobs` at [components/AdminDashboard.tsx:6](Frontend-React/src/components/AdminDashboard.tsx#L6), initial value `['Senior Software Engineer', 'Data Scientist']`. Re-renders are triggered at [components/AdminDashboard.tsx:66](Frontend-React/src/components/AdminDashboard.tsx#L66) with `[...approvedJobs, jobTitle]`.
   - `showAddUserModal` / `setShowAddUserModal` at [components/AdminDashboard.tsx:7](Frontend-React/src/components/AdminDashboard.tsx#L7), initial value `false`. Re-renders are triggered at [components/AdminDashboard.tsx:27](Frontend-React/src/components/AdminDashboard.tsx#L27) with `true`; [components/AdminDashboard.tsx:42](Frontend-React/src/components/AdminDashboard.tsx#L42) with `false`; [components/AdminDashboard.tsx:389](Frontend-React/src/components/AdminDashboard.tsx#L389) with `false`; [components/AdminDashboard.tsx:438](Frontend-React/src/components/AdminDashboard.tsx#L438) with `false`.
   - `showAddCourseModal` / `setShowAddCourseModal` at [components/AdminDashboard.tsx:8](Frontend-React/src/components/AdminDashboard.tsx#L8), initial value `false`. Re-renders are triggered at [components/AdminDashboard.tsx:73](Frontend-React/src/components/AdminDashboard.tsx#L73) with `true`; [components/AdminDashboard.tsx:88](Frontend-React/src/components/AdminDashboard.tsx#L88) with `false`; [components/AdminDashboard.tsx:471](Frontend-React/src/components/AdminDashboard.tsx#L471) with `false`; [components/AdminDashboard.tsx:521](Frontend-React/src/components/AdminDashboard.tsx#L521) with `false`.
   - `isLoading` / `setIsLoading` at [components/AdminDashboard.tsx:9](Frontend-React/src/components/AdminDashboard.tsx#L9), initial value `false`. Re-renders are triggered at [components/AdminDashboard.tsx:37](Frontend-React/src/components/AdminDashboard.tsx#L37) with `true`; [components/AdminDashboard.tsx:41](Frontend-React/src/components/AdminDashboard.tsx#L41) with `false`; [components/AdminDashboard.tsx:83](Frontend-React/src/components/AdminDashboard.tsx#L83) with `true`; [components/AdminDashboard.tsx:87](Frontend-React/src/components/AdminDashboard.tsx#L87) with `false`.
   - `showSuccess` / `setShowSuccess` at [components/AdminDashboard.tsx:10](Frontend-React/src/components/AdminDashboard.tsx#L10), initial value `false`. Re-renders are triggered at [components/AdminDashboard.tsx:44](Frontend-React/src/components/AdminDashboard.tsx#L44) with `true`; [components/AdminDashboard.tsx:47](Frontend-React/src/components/AdminDashboard.tsx#L47) with `false`; [components/AdminDashboard.tsx:54](Frontend-React/src/components/AdminDashboard.tsx#L54) with `true`; [components/AdminDashboard.tsx:55](Frontend-React/src/components/AdminDashboard.tsx#L55) with `false`; [components/AdminDashboard.tsx:61](Frontend-React/src/components/AdminDashboard.tsx#L61) with `true`; [components/AdminDashboard.tsx:62](Frontend-React/src/components/AdminDashboard.tsx#L62) with `false`; [components/AdminDashboard.tsx:68](Frontend-React/src/components/AdminDashboard.tsx#L68) with `true`; [components/AdminDashboard.tsx:69](Frontend-React/src/components/AdminDashboard.tsx#L69) with `false`; [components/AdminDashboard.tsx:90](Frontend-React/src/components/AdminDashboard.tsx#L90) with `true`; [components/AdminDashboard.tsx:93](Frontend-React/src/components/AdminDashboard.tsx#L93) with `false`.
   - `successMessage` / `setSuccessMessage` at [components/AdminDashboard.tsx:11](Frontend-React/src/components/AdminDashboard.tsx#L11), initial value `''`. Re-renders are triggered at [components/AdminDashboard.tsx:43](Frontend-React/src/components/AdminDashboard.tsx#L43) with `\`User "${newUser.name}" added successfully!\``; [components/AdminDashboard.tsx:53](Frontend-React/src/components/AdminDashboard.tsx#L53) with `\`Viewing details for: ${jobTitle}\``; [components/AdminDashboard.tsx:60](Frontend-React/src/components/AdminDashboard.tsx#L60) with `\`Job "${jobTitle}" is already approved!\``; [components/AdminDashboard.tsx:67](Frontend-React/src/components/AdminDashboard.tsx#L67) with `\`Job "${jobTitle}" has been approved and is now live!\``; [components/AdminDashboard.tsx:89](Frontend-React/src/components/AdminDashboard.tsx#L89) with `\`Course "${newCourse.title}" added successfully!\``.
   - `newUser` / `setNewUser` at [components/AdminDashboard.tsx:13](Frontend-React/src/components/AdminDashboard.tsx#L13), initial value `{ name: '', email: '', role: 'jobseeker', }`. Re-renders are triggered at [components/AdminDashboard.tsx:45](Frontend-React/src/components/AdminDashboard.tsx#L45) with `{ name: '', email: '', role: 'jobseeker' }`; [components/AdminDashboard.tsx:401](Frontend-React/src/components/AdminDashboard.tsx#L401) with `{ ...newUser, name: e.target.value }`; [components/AdminDashboard.tsx:414](Frontend-React/src/components/AdminDashboard.tsx#L414) with `{ ...newUser, email: e.target.value }`; [components/AdminDashboard.tsx:426](Frontend-React/src/components/AdminDashboard.tsx#L426) with `{ ...newUser, role: e.target.value }`.
   - `newCourse` / `setNewCourse` at [components/AdminDashboard.tsx:19](Frontend-React/src/components/AdminDashboard.tsx#L19), initial value `{ title: '', platform: '', duration: '', level: 'beginner', }`. Re-renders are triggered at [components/AdminDashboard.tsx:91](Frontend-React/src/components/AdminDashboard.tsx#L91) with `{ title: '', platform: '', duration: '', level: 'beginner' }`; [components/AdminDashboard.tsx:481](Frontend-React/src/components/AdminDashboard.tsx#L481) with `{ ...newCourse, title: e.target.value }`; [components/AdminDashboard.tsx:491](Frontend-React/src/components/AdminDashboard.tsx#L491) with `{ ...newCourse, platform: e.target.value }`; [components/AdminDashboard.tsx:501](Frontend-React/src/components/AdminDashboard.tsx#L501) with `{ ...newCourse, duration: e.target.value }`; [components/AdminDashboard.tsx:510](Frontend-React/src/components/AdminDashboard.tsx#L510) with `{ ...newCourse, level: e.target.value }`.
6. **Conditional rendering / auth / roles:**
   - [components/AdminDashboard.tsx:32](Frontend-React/src/components/AdminDashboard.tsx#L32): `!newUser.name || !newUser.email`.
   - [components/AdminDashboard.tsx:59](Frontend-React/src/components/AdminDashboard.tsx#L59): `approvedJobs.includes(jobTitle)`.
   - [components/AdminDashboard.tsx:132](Frontend-React/src/components/AdminDashboard.tsx#L132): `showSuccess`.
   - [components/AdminDashboard.tsx:201](Frontend-React/src/components/AdminDashboard.tsx#L201): `activeTab === 'overview'`.
   - [components/AdminDashboard.tsx:277](Frontend-React/src/components/AdminDashboard.tsx#L277): `activeTab === 'users'`.
   - [components/AdminDashboard.tsx:322](Frontend-React/src/components/AdminDashboard.tsx#L322): `activeTab === 'jobs'`.
   - [components/AdminDashboard.tsx:354](Frontend-React/src/components/AdminDashboard.tsx#L354): `isApproved`.
   - [components/AdminDashboard.tsx:365](Frontend-React/src/components/AdminDashboard.tsx#L365): `activeTab === 'courses'`.
   - [components/AdminDashboard.tsx:384](Frontend-React/src/components/AdminDashboard.tsx#L384): `showAddUserModal`.
   - [components/AdminDashboard.tsx:448](Frontend-React/src/components/AdminDashboard.tsx#L448): `isLoading`.
   - [components/AdminDashboard.tsx:466](Frontend-React/src/components/AdminDashboard.tsx#L466): `showAddCourseModal`.
   - [components/AdminDashboard.tsx:531](Frontend-React/src/components/AdminDashboard.tsx#L531): `isLoading`.
7. **Known errors / TODOs visible in code:**
   - [components/AdminDashboard.tsx:33](Frontend-React/src/components/AdminDashboard.tsx#L33): `alert('Please fill in all required fields');`.
   - [components/AdminDashboard.tsx:52](Frontend-React/src/components/AdminDashboard.tsx#L52): `// In production, this would navigate to a job details view`.
   - [components/AdminDashboard.tsx:79](Frontend-React/src/components/AdminDashboard.tsx#L79): `alert('Please fill in all required fields');`.

## `Frontend-React/src/components/AICapabilities.tsx`

1. **File:** `AICapabilities.tsx` at `Frontend-React/src/components/AICapabilities.tsx`
2. **Renders:** Landing-page section presenting the platform AI capability cards.
   - Exports: `AICapabilities`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text (11 literals): "Advanced AI Technology" ([components/AICapabilities.tsx:41](Frontend-React/src/components/AICapabilities.tsx#L41)); "Cutting-edge artificial intelligence that powers intelligent career development" ([components/AICapabilities.tsx:44](Frontend-React/src/components/AICapabilities.tsx#L44)); "Transparent & Explainable AI" ([components/AICapabilities.tsx:71](Frontend-React/src/components/AICapabilities.tsx#L71)); "99.2%" ([components/AICapabilities.tsx:80](Frontend-React/src/components/AICapabilities.tsx#L80)); "Skill Extraction Accuracy" ([components/AICapabilities.tsx:81](Frontend-React/src/components/AICapabilities.tsx#L81)); "1M+" ([components/AICapabilities.tsx:84](Frontend-React/src/components/AICapabilities.tsx#L84)); "Skills Analyzed" ([components/AICapabilities.tsx:85](Frontend-React/src/components/AICapabilities.tsx#L85)); "50k+" ([components/AICapabilities.tsx:88](Frontend-React/src/components/AICapabilities.tsx#L88)); "Courses Available" ([components/AICapabilities.tsx:89](Frontend-React/src/components/AICapabilities.tsx#L89)); "24/7" ([components/AICapabilities.tsx:92](Frontend-React/src/components/AICapabilities.tsx#L92)); "AI Support" ([components/AICapabilities.tsx:93](Frontend-React/src/components/AICapabilities.tsx#L93)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ChatHistorySidebar.tsx`

1. **File:** `ChatHistorySidebar.tsx` at `Frontend-React/src/components/ChatHistorySidebar.tsx`
2. **Renders:** Job-seeker history drawer for selecting prior analysis, job, and course activity.
   - Exports: `ChatHistorySidebar`.
3. **Visible UI elements:**
   - `<div>` at [components/ChatHistorySidebar.tsx:121](Frontend-React/src/components/ChatHistorySidebar.tsx#L121): label/text **{onClose}**; onClick=`onClose`. **onClick:** `onClose` at [components/ChatHistorySidebar.tsx:121](Frontend-React/src/components/ChatHistorySidebar.tsx#L121).
   - `<button>` at [components/ChatHistorySidebar.tsx:139](Frontend-React/src/components/ChatHistorySidebar.tsx#L139): label/text **{onClose}**; onClick=`onClose`. **onClick:** `onClose` at [components/ChatHistorySidebar.tsx:139](Frontend-React/src/components/ChatHistorySidebar.tsx#L139).
   - `<button>` at [components/ChatHistorySidebar.tsx:151](Frontend-React/src/components/ChatHistorySidebar.tsx#L151): label/text **All**; onClick=`() => setSelectedCategory('all')`. **onClick:** `() => setSelectedCategory('all')` at [components/ChatHistorySidebar.tsx:151](Frontend-React/src/components/ChatHistorySidebar.tsx#L151).
   - `<button>` at [components/ChatHistorySidebar.tsx:161](Frontend-React/src/components/ChatHistorySidebar.tsx#L161): label/text **Analysis**; onClick=`() => setSelectedCategory('analysis')`. **onClick:** `() => setSelectedCategory('analysis')` at [components/ChatHistorySidebar.tsx:161](Frontend-React/src/components/ChatHistorySidebar.tsx#L161).
   - `<button>` at [components/ChatHistorySidebar.tsx:171](Frontend-React/src/components/ChatHistorySidebar.tsx#L171): label/text **Jobs**; onClick=`() => setSelectedCategory('job')`. **onClick:** `() => setSelectedCategory('job')` at [components/ChatHistorySidebar.tsx:171](Frontend-React/src/components/ChatHistorySidebar.tsx#L171).
   - `<button>` at [components/ChatHistorySidebar.tsx:181](Frontend-React/src/components/ChatHistorySidebar.tsx#L181): label/text **Courses**; onClick=`() => setSelectedCategory('course')`. **onClick:** `() => setSelectedCategory('course')` at [components/ChatHistorySidebar.tsx:181](Frontend-React/src/components/ChatHistorySidebar.tsx#L181).
   - `<button>` at [components/ChatHistorySidebar.tsx:205](Frontend-React/src/components/ChatHistorySidebar.tsx#L205): label/text **{item.id} {item.title} {item.preview} {item.date} {item.score} %**; onClick=`() => onSelectItem(item)`. **onClick:** `() => onSelectItem(item)` at [components/ChatHistorySidebar.tsx:205](Frontend-React/src/components/ChatHistorySidebar.tsx#L205).
   - Fixed visible text (10 literals): "Activity History" ([components/ChatHistorySidebar.tsx:137](Frontend-React/src/components/ChatHistorySidebar.tsx#L137)); "All" ([components/ChatHistorySidebar.tsx:158](Frontend-React/src/components/ChatHistorySidebar.tsx#L158)); "Analysis" ([components/ChatHistorySidebar.tsx:168](Frontend-React/src/components/ChatHistorySidebar.tsx#L168)); "Jobs" ([components/ChatHistorySidebar.tsx:178](Frontend-React/src/components/ChatHistorySidebar.tsx#L178)); "Courses" ([components/ChatHistorySidebar.tsx:188](Frontend-React/src/components/ChatHistorySidebar.tsx#L188)); "No" ([components/ChatHistorySidebar.tsx:199](Frontend-React/src/components/ChatHistorySidebar.tsx#L199)); "history yet" ([components/ChatHistorySidebar.tsx:199](Frontend-React/src/components/ChatHistorySidebar.tsx#L199)); "Analyses" ([components/ChatHistorySidebar.tsx:250](Frontend-React/src/components/ChatHistorySidebar.tsx#L250)); "Jobs" ([components/ChatHistorySidebar.tsx:256](Frontend-React/src/components/ChatHistorySidebar.tsx#L256)); "Courses" ([components/ChatHistorySidebar.tsx:262](Frontend-React/src/components/ChatHistorySidebar.tsx#L262)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - `selectedCategory` / `setSelectedCategory` at [components/ChatHistorySidebar.tsx:20](Frontend-React/src/components/ChatHistorySidebar.tsx#L20), initial value `'all'`. Re-renders are triggered at [components/ChatHistorySidebar.tsx:152](Frontend-React/src/components/ChatHistorySidebar.tsx#L152) with `'all'`; [components/ChatHistorySidebar.tsx:162](Frontend-React/src/components/ChatHistorySidebar.tsx#L162) with `'analysis'`; [components/ChatHistorySidebar.tsx:172](Frontend-React/src/components/ChatHistorySidebar.tsx#L172) with `'job'`; [components/ChatHistorySidebar.tsx:182](Frontend-React/src/components/ChatHistorySidebar.tsx#L182) with `'course'`.
6. **Conditional rendering / auth / roles:**
   - [components/ChatHistorySidebar.tsx:120](Frontend-React/src/components/ChatHistorySidebar.tsx#L120): `isOpen`.
   - [components/ChatHistorySidebar.tsx:196](Frontend-React/src/components/ChatHistorySidebar.tsx#L196): `filteredItems.length === 0`.
   - [components/ChatHistorySidebar.tsx:199](Frontend-React/src/components/ChatHistorySidebar.tsx#L199): `selectedCategory === 'all'`.
   - [components/ChatHistorySidebar.tsx:229](Frontend-React/src/components/ChatHistorySidebar.tsx#L229): `item.score`.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/CourseRecommendations.tsx`

1. **File:** `CourseRecommendations.tsx` at `Frontend-React/src/components/CourseRecommendations.tsx`
2. **Renders:** Course catalog and enrollment/progress page for job seekers.
   - Exports: `CourseRecommendations`.
3. **Visible UI elements:**
   - `<button>` at [components/CourseRecommendations.tsx:156](Frontend-React/src/components/CourseRecommendations.tsx#L156): label/text **All Courses**; onClick=`() => setFilter('all')`. **onClick:** `() => setFilter('all')` at [components/CourseRecommendations.tsx:156](Frontend-React/src/components/CourseRecommendations.tsx#L156).
   - `<button>` at [components/CourseRecommendations.tsx:166](Frontend-React/src/components/CourseRecommendations.tsx#L166): label/text **My Enrolled**; onClick=`() => setFilter('enrolled')`. **onClick:** `() => setFilter('enrolled')` at [components/CourseRecommendations.tsx:166](Frontend-React/src/components/CourseRecommendations.tsx#L166).
   - `<button>` at [components/CourseRecommendations.tsx:176](Frontend-React/src/components/CourseRecommendations.tsx#L176): label/text **Beginner**; onClick=`() => setFilter('beginner')`. **onClick:** `() => setFilter('beginner')` at [components/CourseRecommendations.tsx:176](Frontend-React/src/components/CourseRecommendations.tsx#L176).
   - `<button>` at [components/CourseRecommendations.tsx:186](Frontend-React/src/components/CourseRecommendations.tsx#L186): label/text **Intermediate**; onClick=`() => setFilter('intermediate')`. **onClick:** `() => setFilter('intermediate')` at [components/CourseRecommendations.tsx:186](Frontend-React/src/components/CourseRecommendations.tsx#L186).
   - `<button>` at [components/CourseRecommendations.tsx:196](Frontend-React/src/components/CourseRecommendations.tsx#L196): label/text **Advanced**; onClick=`() => setFilter('advanced')`. **onClick:** `() => setFilter('advanced')` at [components/CourseRecommendations.tsx:196](Frontend-React/src/components/CourseRecommendations.tsx#L196).
   - `<button>` at [components/CourseRecommendations.tsx:297](Frontend-React/src/components/CourseRecommendations.tsx#L297): label/text **{course.status === 'Completed' ? ( <> <CheckCircle className="w-4 h-4" /> View...} View Certificate Continue Learning (+10% Progress)**; onClick=`() => handleContinueLearning(courseId, progress)`. **onClick:** `() => handleContinueLearning(courseId, progress)` at [components/CourseRecommendations.tsx:297](Frontend-React/src/components/CourseRecommendations.tsx#L297).
   - `<button>` at [components/CourseRecommendations.tsx:314](Frontend-React/src/components/CourseRecommendations.tsx#L314): label/text **{isEnrolling} {isEnrolling ? ( <> <div className="w-4 h-4 border-2 border-white border-t-tra...} Enrolling... Enroll Now**; disabled=`isEnrolling`; onClick=`() => handleEnroll(courseId)`. **onClick:** `() => handleEnroll(courseId)` at [components/CourseRecommendations.tsx:314](Frontend-React/src/components/CourseRecommendations.tsx#L314).
   - `<button>` at [components/CourseRecommendations.tsx:346](Frontend-React/src/components/CourseRecommendations.tsx#L346): label/text **Analyze My Skills**; onClick=`() => onNavigate('analysis')`. **onClick:** `() => onNavigate('analysis')` at [components/CourseRecommendations.tsx:346](Frontend-React/src/components/CourseRecommendations.tsx#L346).
   - Fixed visible text (23 literals): "My Courses" ([components/CourseRecommendations.tsx:112](Frontend-React/src/components/CourseRecommendations.tsx#L112)); "Track your enrolled courses and explore new learning opportunities" ([components/CourseRecommendations.tsx:115](Frontend-React/src/components/CourseRecommendations.tsx#L115)); "Error loading courses" ([components/CourseRecommendations.tsx:120](Frontend-React/src/components/CourseRecommendations.tsx#L120)); "Enrolled Courses" ([components/CourseRecommendations.tsx:130](Frontend-React/src/components/CourseRecommendations.tsx#L130)); "In Progress" ([components/CourseRecommendations.tsx:137](Frontend-React/src/components/CourseRecommendations.tsx#L137)); "Completed" ([components/CourseRecommendations.tsx:144](Frontend-React/src/components/CourseRecommendations.tsx#L144)); "Filter:" ([components/CourseRecommendations.tsx:153](Frontend-React/src/components/CourseRecommendations.tsx#L153)); "All Courses" ([components/CourseRecommendations.tsx:163](Frontend-React/src/components/CourseRecommendations.tsx#L163)); "My Enrolled" ([components/CourseRecommendations.tsx:173](Frontend-React/src/components/CourseRecommendations.tsx#L173)); "Beginner" ([components/CourseRecommendations.tsx:183](Frontend-React/src/components/CourseRecommendations.tsx#L183)); "Intermediate" ([components/CourseRecommendations.tsx:193](Frontend-React/src/components/CourseRecommendations.tsx#L193)); "Advanced" ([components/CourseRecommendations.tsx:203](Frontend-React/src/components/CourseRecommendations.tsx#L203)); "Loading courses..." ([components/CourseRecommendations.tsx:214](Frontend-React/src/components/CourseRecommendations.tsx#L214)); "Boost" ([components/CourseRecommendations.tsx:247](Frontend-React/src/components/CourseRecommendations.tsx#L247)); "Progress" ([components/CourseRecommendations.tsx:258](Frontend-React/src/components/CourseRecommendations.tsx#L258)); "students)" ([components/CourseRecommendations.tsx:275](Frontend-React/src/components/CourseRecommendations.tsx#L275)); "View Certificate" ([components/CourseRecommendations.tsx:303](Frontend-React/src/components/CourseRecommendations.tsx#L303)); "Continue Learning (+10% Progress)" ([components/CourseRecommendations.tsx:308](Frontend-React/src/components/CourseRecommendations.tsx#L308)); "Enrolling..." ([components/CourseRecommendations.tsx:321](Frontend-React/src/components/CourseRecommendations.tsx#L321)); "Enroll Now" ([components/CourseRecommendations.tsx:326](Frontend-React/src/components/CourseRecommendations.tsx#L326)); "Need Personalized Recommendations?" ([components/CourseRecommendations.tsx:342](Frontend-React/src/components/CourseRecommendations.tsx#L342)); "Our AI can analyze your skill gaps and recommend courses tailored to your career goals." ([components/CourseRecommendations.tsx:343](Frontend-React/src/components/CourseRecommendations.tsx#L343)); "Analyze My Skills" ([components/CourseRecommendations.tsx:349](Frontend-React/src/components/CourseRecommendations.tsx#L349)).
4. **API calls:**
   - [components/CourseRecommendations.tsx:26](Frontend-React/src/components/CourseRecommendations.tsx#L26): `coursesAPI.getCourses({}; token)` from `../api/courses.api`. Response is assigned to `data`; subsequent state updates in the same handler: `setCourses(data || []) @ L27`, `setError(err.message || 'Failed to fetch courses') @ L30`, `setIsLoading(false) @ L32`.
   - [components/CourseRecommendations.tsx:49](Frontend-React/src/components/CourseRecommendations.tsx#L49): `coursesAPI.enrollCourse(courseId; token)` from `../api/courses.api`. Response is awaited/returned without a named assignment; subsequent state updates in the same handler: `setEnrollingId(null) @ L55`.
   - [components/CourseRecommendations.tsx:68](Frontend-React/src/components/CourseRecommendations.tsx#L68): `coursesAPI.updateProgress(courseId; nextProgress; token)` from `../api/courses.api`. Response is awaited/returned without a named assignment.
5. **State and re-render triggers:**
   - `filter` / `setFilter` at [components/CourseRecommendations.tsx:10](Frontend-React/src/components/CourseRecommendations.tsx#L10), initial value `'all'`. Re-renders are triggered at [components/CourseRecommendations.tsx:157](Frontend-React/src/components/CourseRecommendations.tsx#L157) with `'all'`; [components/CourseRecommendations.tsx:167](Frontend-React/src/components/CourseRecommendations.tsx#L167) with `'enrolled'`; [components/CourseRecommendations.tsx:177](Frontend-React/src/components/CourseRecommendations.tsx#L177) with `'beginner'`; [components/CourseRecommendations.tsx:187](Frontend-React/src/components/CourseRecommendations.tsx#L187) with `'intermediate'`; [components/CourseRecommendations.tsx:197](Frontend-React/src/components/CourseRecommendations.tsx#L197) with `'advanced'`.
   - `courses` / `setCourses` at [components/CourseRecommendations.tsx:11](Frontend-React/src/components/CourseRecommendations.tsx#L11), initial value `[]`. Re-renders are triggered at [components/CourseRecommendations.tsx:27](Frontend-React/src/components/CourseRecommendations.tsx#L27) with `data || []`.
   - `isLoading` / `setIsLoading` at [components/CourseRecommendations.tsx:12](Frontend-React/src/components/CourseRecommendations.tsx#L12), initial value `true`. Re-renders are triggered at [components/CourseRecommendations.tsx:17](Frontend-React/src/components/CourseRecommendations.tsx#L17) with `true`; [components/CourseRecommendations.tsx:32](Frontend-React/src/components/CourseRecommendations.tsx#L32) with `false`.
   - `error` / `setError` at [components/CourseRecommendations.tsx:13](Frontend-React/src/components/CourseRecommendations.tsx#L13), initial value `null`. Re-renders are triggered at [components/CourseRecommendations.tsx:18](Frontend-React/src/components/CourseRecommendations.tsx#L18) with `null`; [components/CourseRecommendations.tsx:22](Frontend-React/src/components/CourseRecommendations.tsx#L22) with `'Session expired, please log in again'`; [components/CourseRecommendations.tsx:30](Frontend-React/src/components/CourseRecommendations.tsx#L30) with `err.message || 'Failed to fetch courses'`.
   - `enrollingId` / `setEnrollingId` at [components/CourseRecommendations.tsx:14](Frontend-React/src/components/CourseRecommendations.tsx#L14), initial value `null`. Re-renders are triggered at [components/CourseRecommendations.tsx:47](Frontend-React/src/components/CourseRecommendations.tsx#L47) with `courseId`; [components/CourseRecommendations.tsx:55](Frontend-React/src/components/CourseRecommendations.tsx#L55) with `null`.
   - Effect at [components/CourseRecommendations.tsx:36](Frontend-React/src/components/CourseRecommendations.tsx#L36) runs with dependencies `[]`; body starts `() => { fetchCourses(); }`.
6. **Conditional rendering / auth / roles:**
   - [components/CourseRecommendations.tsx:21](Frontend-React/src/components/CourseRecommendations.tsx#L21): `!token`.
   - [components/CourseRecommendations.tsx:42](Frontend-React/src/components/CourseRecommendations.tsx#L42): `!token`.
   - [components/CourseRecommendations.tsx:61](Frontend-React/src/components/CourseRecommendations.tsx#L61): `!token`.
   - [components/CourseRecommendations.tsx:118](Frontend-React/src/components/CourseRecommendations.tsx#L118): `error`.
   - [components/CourseRecommendations.tsx:211](Frontend-React/src/components/CourseRecommendations.tsx#L211): `isLoading`.
   - [components/CourseRecommendations.tsx:255](Frontend-React/src/components/CourseRecommendations.tsx#L255): `isEnrolled && progress > 0`.
   - [components/CourseRecommendations.tsx:296](Frontend-React/src/components/CourseRecommendations.tsx#L296): `isEnrolled`.
   - [components/CourseRecommendations.tsx:301](Frontend-React/src/components/CourseRecommendations.tsx#L301): `course.status === 'Completed'`.
   - [components/CourseRecommendations.tsx:319](Frontend-React/src/components/CourseRecommendations.tsx#L319): `isEnrolling`.
7. **Known errors / TODOs visible in code:**
   - [components/CourseRecommendations.tsx:18](Frontend-React/src/components/CourseRecommendations.tsx#L18): `setError(null);`.
   - [components/CourseRecommendations.tsx:22](Frontend-React/src/components/CourseRecommendations.tsx#L22): `setError('Session expired, please log in again');`.
   - [components/CourseRecommendations.tsx:29](Frontend-React/src/components/CourseRecommendations.tsx#L29): `console.error(err);`.
   - [components/CourseRecommendations.tsx:30](Frontend-React/src/components/CourseRecommendations.tsx#L30): `setError(err.message || 'Failed to fetch courses');`.
   - [components/CourseRecommendations.tsx:43](Frontend-React/src/components/CourseRecommendations.tsx#L43): `alert('Session expired, please log in again');`.
   - [components/CourseRecommendations.tsx:52](Frontend-React/src/components/CourseRecommendations.tsx#L52): `console.error(err);`.
   - [components/CourseRecommendations.tsx:53](Frontend-React/src/components/CourseRecommendations.tsx#L53): `alert(err.message || 'Enrollment failed');`.
   - [components/CourseRecommendations.tsx:62](Frontend-React/src/components/CourseRecommendations.tsx#L62): `alert('Session expired, please log in again');`.
   - [components/CourseRecommendations.tsx:71](Frontend-React/src/components/CourseRecommendations.tsx#L71): `console.error(err);`.
   - [components/CourseRecommendations.tsx:72](Frontend-React/src/components/CourseRecommendations.tsx#L72): `alert(err.message || 'Failed to update progress');`.

## `Frontend-React/src/components/CTA.tsx`

1. **File:** `CTA.tsx` at `Frontend-React/src/components/CTA.tsx`
2. **Renders:** Landing-page call-to-action section linking visitors to signup.
   - Exports: `CTA`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text (7 literals): "Ready to Transform Your Career?" ([components/CTA.tsx:13](Frontend-React/src/components/CTA.tsx#L13)); "Join thousands of professionals who are advancing their careers with AI-powered insights - completely free!" ([components/CTA.tsx:16](Frontend-React/src/components/CTA.tsx#L16)); "100% free - no payment required" ([components/CTA.tsx:23](Frontend-React/src/components/CTA.tsx#L23)); "Instant AI-powered skill analysis" ([components/CTA.tsx:27](Frontend-React/src/components/CTA.tsx#L27)); "Personalized course recommendations" ([components/CTA.tsx:31](Frontend-React/src/components/CTA.tsx#L31)); "Access to top job opportunities" ([components/CTA.tsx:35](Frontend-React/src/components/CTA.tsx#L35)); "Join thousands of professionals advancing their careers with AI" ([components/CTA.tsx:39](Frontend-React/src/components/CTA.tsx#L39)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/EditProfile.tsx`

1. **File:** `EditProfile.tsx` at `Frontend-React/src/components/EditProfile.tsx`
2. **Renders:** Authenticated profile-edit form for personal and location details.
   - Exports: `EditProfile`.
3. **Visible UI elements:**
   - `<form>` at [components/EditProfile.tsx:186](Frontend-React/src/components/EditProfile.tsx#L186): label/text **{handleSave} Full Name * {formData.name} {isLoading} {errors.name} Email Address {formData.email} {errors.email} Country {formData.country} {errors.country} City {formData.city} Profile updated successfully! {errors.noCh**; onSubmit=`handleSave`. **onSubmit:** `handleSave` at [components/EditProfile.tsx:186](Frontend-React/src/components/EditProfile.tsx#L186).
   - `<input>` at [components/EditProfile.tsx:193](Frontend-React/src/components/EditProfile.tsx#L193): label/text **{formData.name} {isLoading}**; type=`text`; placeholder=`Enter your full name`; value=`formData.name`; disabled=`isLoading`; onChange=`(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: undefined }); }`.
   - `<input>` at [components/EditProfile.tsx:221](Frontend-React/src/components/EditProfile.tsx#L221): label/text **{formData.email} {isLoading}**; type=`email`; placeholder=`your.email@example.com`; value=`formData.email`; disabled=`isLoading`; onChange=`(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }`.
   - `<input>` at [components/EditProfile.tsx:250](Frontend-React/src/components/EditProfile.tsx#L250): label/text **{formData.country} {isLoading}**; type=`text`; placeholder=`Country`; value=`formData.country`; disabled=`isLoading`; onChange=`(e) => { setFormData({ ...formData, country: e.target.value }); if (errors.country) setErrors({ ...errors, country: undefined }); }`.
   - `<input>` at [components/EditProfile.tsx:276](Frontend-React/src/components/EditProfile.tsx#L276): label/text **{formData.city} {isLoading}**; type=`text`; placeholder=`City`; value=`formData.city`; disabled=`isLoading`; onChange=`(e) => setFormData({ ...formData, city: e.target.value })`.
   - `<button>` at [components/EditProfile.tsx:303](Frontend-React/src/components/EditProfile.tsx#L303): label/text **{isLoading} {isLoading ? ( <> <div className="w-5 h-5 border-2 border-white border-t-trans...} Saving... Save Changes**; type=`submit`; disabled=`isLoading`.
   - `<button>` at [components/EditProfile.tsx:320](Frontend-React/src/components/EditProfile.tsx#L320): label/text **{handleCancel} {isLoading} Cancel**; type=`button`; disabled=`isLoading`; onClick=`handleCancel`. **onClick:** `handleCancel` at [components/EditProfile.tsx:320](Frontend-React/src/components/EditProfile.tsx#L320).
   - Fixed visible text (11 literals): "Loading profile details..." ([components/EditProfile.tsx:170](Frontend-React/src/components/EditProfile.tsx#L170)); "Edit Profile" ([components/EditProfile.tsx:179](Frontend-React/src/components/EditProfile.tsx#L179)); "Update your personal information" ([components/EditProfile.tsx:182](Frontend-React/src/components/EditProfile.tsx#L182)); "Full Name" ([components/EditProfile.tsx:188](Frontend-React/src/components/EditProfile.tsx#L188)); "Email Address" ([components/EditProfile.tsx:216](Frontend-React/src/components/EditProfile.tsx#L216)); "Country" ([components/EditProfile.tsx:245](Frontend-React/src/components/EditProfile.tsx#L245)); "City" ([components/EditProfile.tsx:273](Frontend-React/src/components/EditProfile.tsx#L273)); "Profile updated successfully!" ([components/EditProfile.tsx:291](Frontend-React/src/components/EditProfile.tsx#L291)); "Saving..." ([components/EditProfile.tsx:310](Frontend-React/src/components/EditProfile.tsx#L310)); "Save Changes" ([components/EditProfile.tsx:315](Frontend-React/src/components/EditProfile.tsx#L315)); "Cancel" ([components/EditProfile.tsx:326](Frontend-React/src/components/EditProfile.tsx#L326)).
4. **API calls:**
   - [components/EditProfile.tsx:51](Frontend-React/src/components/EditProfile.tsx#L51): `usersAPI.getProfile(userId; token)` from `../api/users.api`. Response is assigned to `prof`; subsequent state updates in the same handler: `setFormData(initData) @ L68`, `setOriginalData(initData) @ L69`, `setErrors({ noChanges: err.message || 'Failed to load profile data' }) @ L73`, `setIsFetching(false) @ L75`.
   - [components/EditProfile.tsx:139](Frontend-React/src/components/EditProfile.tsx#L139): `usersAPI.updateProfile(userId; profileData; token)` from `../api/users.api`. Response is awaited/returned without a named assignment; subsequent state updates in the same handler: `setShowSuccess(true) @ L147`, `setShowSuccess(false) @ L151`, `setErrors({ noChanges: err.message || 'Failed to save profile changes' }) @ L156`, `setIsLoading(false) @ L158`.
5. **State and re-render triggers:**
   - `formData` / `setFormData` at [components/EditProfile.tsx:12](Frontend-React/src/components/EditProfile.tsx#L12), initial value `{ name: '', email: '', country: '', city: '', }`. Re-renders are triggered at [components/EditProfile.tsx:68](Frontend-React/src/components/EditProfile.tsx#L68) with `initData`; [components/EditProfile.tsx:197](Frontend-React/src/components/EditProfile.tsx#L197) with `{ ...formData, name: e.target.value }`; [components/EditProfile.tsx:225](Frontend-React/src/components/EditProfile.tsx#L225) with `{ ...formData, email: e.target.value }`; [components/EditProfile.tsx:254](Frontend-React/src/components/EditProfile.tsx#L254) with `{ ...formData, country: e.target.value }`; [components/EditProfile.tsx:279](Frontend-React/src/components/EditProfile.tsx#L279) with `{ ...formData, city: e.target.value }`.
   - `originalData` / `setOriginalData` at [components/EditProfile.tsx:19](Frontend-React/src/components/EditProfile.tsx#L19), initial value `{ name: '', email: '', country: '', city: '', }`. Re-renders are triggered at [components/EditProfile.tsx:69](Frontend-React/src/components/EditProfile.tsx#L69) with `initData`.
   - `isLoading` / `setIsLoading` at [components/EditProfile.tsx:26](Frontend-React/src/components/EditProfile.tsx#L26), initial value `false`. Re-renders are triggered at [components/EditProfile.tsx:119](Frontend-React/src/components/EditProfile.tsx#L119) with `true`; [components/EditProfile.tsx:158](Frontend-React/src/components/EditProfile.tsx#L158) with `false`.
   - `isFetching` / `setIsFetching` at [components/EditProfile.tsx:27](Frontend-React/src/components/EditProfile.tsx#L27), initial value `true`. Re-renders are triggered at [components/EditProfile.tsx:75](Frontend-React/src/components/EditProfile.tsx#L75) with `false`.
   - `showSuccess` / `setShowSuccess` at [components/EditProfile.tsx:28](Frontend-React/src/components/EditProfile.tsx#L28), initial value `false`. Re-renders are triggered at [components/EditProfile.tsx:147](Frontend-React/src/components/EditProfile.tsx#L147) with `true`; [components/EditProfile.tsx:151](Frontend-React/src/components/EditProfile.tsx#L151) with `false`.
   - `errors` / `setErrors` at [components/EditProfile.tsx:29](Frontend-React/src/components/EditProfile.tsx#L29), initial value `{}`. Re-renders are triggered at [components/EditProfile.tsx:73](Frontend-React/src/components/EditProfile.tsx#L73) with `{ noChanges: err.message || 'Failed to load profile data' }`; [components/EditProfile.tsx:93](Frontend-React/src/components/EditProfile.tsx#L93) with `{ noChanges: 'No changes detected. Please update at least one field before saving.' }`; [components/EditProfile.tsx:113](Frontend-React/src/components/EditProfile.tsx#L113) with `newErrors`; [components/EditProfile.tsx:118](Frontend-React/src/components/EditProfile.tsx#L118) with `{}`; [components/EditProfile.tsx:156](Frontend-React/src/components/EditProfile.tsx#L156) with `{ noChanges: err.message || 'Failed to save profile changes' }`; [components/EditProfile.tsx:198](Frontend-React/src/components/EditProfile.tsx#L198) with `{ ...errors, name: undefined }`; [components/EditProfile.tsx:226](Frontend-React/src/components/EditProfile.tsx#L226) with `{ ...errors, email: undefined }`; [components/EditProfile.tsx:255](Frontend-React/src/components/EditProfile.tsx#L255) with `{ ...errors, country: undefined }`.
   - Effect at [components/EditProfile.tsx:37](Frontend-React/src/components/EditProfile.tsx#L37) runs with dependencies `[]`; body starts `() => { const fetchProfile = async () => { try { const token = localStorage.getItem('token'); if (!token) { alert('Session expired, please log in again'); onNavigate('login'); return; } const currentUserStr = localStorage.getItem('currentUser'); const curre...`.
6. **Conditional rendering / auth / roles:**
   - [components/EditProfile.tsx:41](Frontend-React/src/components/EditProfile.tsx#L41): `!token`.
   - [components/EditProfile.tsx:100](Frontend-React/src/components/EditProfile.tsx#L100): `!formData.name || formData.name.trim().length < 2`.
   - [components/EditProfile.tsx:108](Frontend-React/src/components/EditProfile.tsx#L108): `!formData.country || formData.country.trim().length === 0`.
   - [components/EditProfile.tsx:112](Frontend-React/src/components/EditProfile.tsx#L112): `Object.keys(newErrors).length > 0`.
   - [components/EditProfile.tsx:123](Frontend-React/src/components/EditProfile.tsx#L123): `!token`.
   - [components/EditProfile.tsx:198](Frontend-React/src/components/EditProfile.tsx#L198): `errors.name`.
   - [components/EditProfile.tsx:207](Frontend-React/src/components/EditProfile.tsx#L207): `errors.name`.
   - [components/EditProfile.tsx:226](Frontend-React/src/components/EditProfile.tsx#L226): `errors.email`.
   - [components/EditProfile.tsx:235](Frontend-React/src/components/EditProfile.tsx#L235): `errors.email`.
   - [components/EditProfile.tsx:255](Frontend-React/src/components/EditProfile.tsx#L255): `errors.country`.
   - [components/EditProfile.tsx:264](Frontend-React/src/components/EditProfile.tsx#L264): `errors.country`.
   - [components/EditProfile.tsx:288](Frontend-React/src/components/EditProfile.tsx#L288): `showSuccess`.
   - [components/EditProfile.tsx:295](Frontend-React/src/components/EditProfile.tsx#L295): `errors.noChanges`.
   - [components/EditProfile.tsx:308](Frontend-React/src/components/EditProfile.tsx#L308): `isLoading`.
7. **Known errors / TODOs visible in code:**
   - [components/EditProfile.tsx:42](Frontend-React/src/components/EditProfile.tsx#L42): `alert('Session expired, please log in again');`.
   - [components/EditProfile.tsx:72](Frontend-React/src/components/EditProfile.tsx#L72): `console.error(err);`.
   - [components/EditProfile.tsx:124](Frontend-React/src/components/EditProfile.tsx#L124): `alert('Session expired, please log in again');`.
   - [components/EditProfile.tsx:155](Frontend-React/src/components/EditProfile.tsx#L155): `console.error(err);`.

## `Frontend-React/src/components/Features.tsx`

1. **File:** `Features.tsx` at `Frontend-React/src/components/Features.tsx`
2. **Renders:** Landing-page feature-card section.
   - Exports: `Features`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text (2 literals): "Powerful Features for Career Growth" ([components/Features.tsx:41](Frontend-React/src/components/Features.tsx#L41)); "Comprehensive AI-powered tools designed to help you succeed in your career journey" ([components/Features.tsx:44](Frontend-React/src/components/Features.tsx#L44)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/figma/ImageWithFallback.tsx`

1. **File:** `ImageWithFallback.tsx` at `Frontend-React/src/components/figma/ImageWithFallback.tsx`
2. **Renders:** Reusable image wrapper that swaps to an inline fallback after load failure.
   - Exports: `ImageWithFallback`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - `didError` / `setDidError` at [components/figma/ImageWithFallback.tsx:7](Frontend-React/src/components/figma/ImageWithFallback.tsx#L7), initial value `false`. Re-renders are triggered at [components/figma/ImageWithFallback.tsx:10](Frontend-React/src/components/figma/ImageWithFallback.tsx#L10) with `true`.
6. **Conditional rendering / auth / roles:**
   - [components/figma/ImageWithFallback.tsx:15](Frontend-React/src/components/figma/ImageWithFallback.tsx#L15): `didError`.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/Footer.tsx`

1. **File:** `Footer.tsx` at `Frontend-React/src/components/Footer.tsx`
2. **Renders:** Site footer containing product, company, resource, and legal links.
   - Exports: `Footer`.
3. **Visible UI elements:**
   - `<a>` at [components/Footer.tsx:21](Frontend-React/src/components/Footer.tsx#L21): label/text **(no fixed label)**; href=`#`.
   - `<a>` at [components/Footer.tsx:24](Frontend-React/src/components/Footer.tsx#L24): label/text **(no fixed label)**; href=`#`.
   - `<a>` at [components/Footer.tsx:27](Frontend-React/src/components/Footer.tsx#L27): label/text **(no fixed label)**; href=`#`.
   - `<a>` at [components/Footer.tsx:30](Frontend-React/src/components/Footer.tsx#L30): label/text **(no fixed label)**; href=`#`.
   - `<a>` at [components/Footer.tsx:39](Frontend-React/src/components/Footer.tsx#L39): label/text **Features**; href=`#features`.
   - `<a>` at [components/Footer.tsx:40](Frontend-React/src/components/Footer.tsx#L40): label/text **Pricing**; href=`#`.
   - `<a>` at [components/Footer.tsx:41](Frontend-React/src/components/Footer.tsx#L41): label/text **Case Studies**; href=`#`.
   - `<a>` at [components/Footer.tsx:42](Frontend-React/src/components/Footer.tsx#L42): label/text **Reviews**; href=`#`.
   - `<a>` at [components/Footer.tsx:43](Frontend-React/src/components/Footer.tsx#L43): label/text **Updates**; href=`#`.
   - `<a>` at [components/Footer.tsx:50](Frontend-React/src/components/Footer.tsx#L50): label/text **About**; href=`#`.
   - `<a>` at [components/Footer.tsx:51](Frontend-React/src/components/Footer.tsx#L51): label/text **Careers**; href=`#`.
   - `<a>` at [components/Footer.tsx:52](Frontend-React/src/components/Footer.tsx#L52): label/text **Blog**; href=`#`.
   - `<a>` at [components/Footer.tsx:53](Frontend-React/src/components/Footer.tsx#L53): label/text **Press**; href=`#`.
   - `<a>` at [components/Footer.tsx:54](Frontend-React/src/components/Footer.tsx#L54): label/text **Contact**; href=`#`.
   - `<a>` at [components/Footer.tsx:61](Frontend-React/src/components/Footer.tsx#L61): label/text **Documentation**; href=`#`.
   - `<a>` at [components/Footer.tsx:62](Frontend-React/src/components/Footer.tsx#L62): label/text **Help Center**; href=`#`.
   - `<a>` at [components/Footer.tsx:63](Frontend-React/src/components/Footer.tsx#L63): label/text **API Reference**; href=`#`.
   - `<a>` at [components/Footer.tsx:64](Frontend-React/src/components/Footer.tsx#L64): label/text **Community**; href=`#`.
   - `<a>` at [components/Footer.tsx:65](Frontend-React/src/components/Footer.tsx#L65): label/text **Partners**; href=`#`.
   - `<a>` at [components/Footer.tsx:76](Frontend-React/src/components/Footer.tsx#L76): label/text **Privacy Policy**; href=`#`.
   - `<a>` at [components/Footer.tsx:77](Frontend-React/src/components/Footer.tsx#L77): label/text **Terms of Service**; href=`#`.
   - `<a>` at [components/Footer.tsx:78](Frontend-React/src/components/Footer.tsx#L78): label/text **Cookie Policy**; href=`#`.
   - Fixed visible text (24 literals): "AI Skill Mentor" ([components/Footer.tsx:13](Frontend-React/src/components/Footer.tsx#L13)); "Empowering careers through intelligent skill development and AI-driven insights." ([components/Footer.tsx:17](Frontend-React/src/components/Footer.tsx#L17)); "Product" ([components/Footer.tsx:37](Frontend-React/src/components/Footer.tsx#L37)); "Features" ([components/Footer.tsx:39](Frontend-React/src/components/Footer.tsx#L39)); "Pricing" ([components/Footer.tsx:40](Frontend-React/src/components/Footer.tsx#L40)); "Case Studies" ([components/Footer.tsx:41](Frontend-React/src/components/Footer.tsx#L41)); "Reviews" ([components/Footer.tsx:42](Frontend-React/src/components/Footer.tsx#L42)); "Updates" ([components/Footer.tsx:43](Frontend-React/src/components/Footer.tsx#L43)); "Company" ([components/Footer.tsx:48](Frontend-React/src/components/Footer.tsx#L48)); "About" ([components/Footer.tsx:50](Frontend-React/src/components/Footer.tsx#L50)); "Careers" ([components/Footer.tsx:51](Frontend-React/src/components/Footer.tsx#L51)); "Blog" ([components/Footer.tsx:52](Frontend-React/src/components/Footer.tsx#L52)); "Press" ([components/Footer.tsx:53](Frontend-React/src/components/Footer.tsx#L53)); "Contact" ([components/Footer.tsx:54](Frontend-React/src/components/Footer.tsx#L54)); "Resources" ([components/Footer.tsx:59](Frontend-React/src/components/Footer.tsx#L59)); "Documentation" ([components/Footer.tsx:61](Frontend-React/src/components/Footer.tsx#L61)); "Help Center" ([components/Footer.tsx:62](Frontend-React/src/components/Footer.tsx#L62)); "API Reference" ([components/Footer.tsx:63](Frontend-React/src/components/Footer.tsx#L63)); "Community" ([components/Footer.tsx:64](Frontend-React/src/components/Footer.tsx#L64)); "Partners" ([components/Footer.tsx:65](Frontend-React/src/components/Footer.tsx#L65)); "© 2025 AI Skill Mentor. All rights reserved." ([components/Footer.tsx:72](Frontend-React/src/components/Footer.tsx#L72)); "Privacy Policy" ([components/Footer.tsx:76](Frontend-React/src/components/Footer.tsx#L76)); "Terms of Service" ([components/Footer.tsx:77](Frontend-React/src/components/Footer.tsx#L77)); "Cookie Policy" ([components/Footer.tsx:78](Frontend-React/src/components/Footer.tsx#L78)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/Hero.tsx`

1. **File:** `Hero.tsx` at `Frontend-React/src/components/Hero.tsx`
2. **Renders:** Landing-page hero with signup and login calls to action.
   - Exports: `Hero`.
3. **Visible UI elements:**
   - `<button>` at [components/Hero.tsx:29](Frontend-React/src/components/Hero.tsx#L29): label/text **Get Started Free**; onClick=`() => onNavigate('signup')`. **onClick:** `() => onNavigate('signup')` at [components/Hero.tsx:29](Frontend-React/src/components/Hero.tsx#L29).
   - `<button>` at [components/Hero.tsx:36](Frontend-React/src/components/Hero.tsx#L36): label/text **Sign In**; onClick=`() => onNavigate('login')`. **onClick:** `() => onNavigate('login')` at [components/Hero.tsx:36](Frontend-React/src/components/Hero.tsx#L36).
   - Fixed visible text (18 literals): "AI-Powered Career Development" ([components/Hero.tsx:15](Frontend-React/src/components/Hero.tsx#L15)); "Transform Your Career with AI-Powered Skill Mentorship" ([components/Hero.tsx:18](Frontend-React/src/components/Hero.tsx#L18)); "Get Started Free" ([components/Hero.tsx:32](Frontend-React/src/components/Hero.tsx#L32)); "Sign In" ([components/Hero.tsx:39](Frontend-React/src/components/Hero.tsx#L39)); "10k+" ([components/Hero.tsx:46](Frontend-React/src/components/Hero.tsx#L46)); "Active Users" ([components/Hero.tsx:49](Frontend-React/src/components/Hero.tsx#L49)); "95%" ([components/Hero.tsx:52](Frontend-React/src/components/Hero.tsx#L52)); "Success Rate" ([components/Hero.tsx:55](Frontend-React/src/components/Hero.tsx#L55)); "500+" ([components/Hero.tsx:58](Frontend-React/src/components/Hero.tsx#L58)); "Partner Companies" ([components/Hero.tsx:61](Frontend-React/src/components/Hero.tsx#L61)); "JavaScript" ([components/Hero.tsx:79](Frontend-React/src/components/Hero.tsx#L79)); "Expert" ([components/Hero.tsx:80](Frontend-React/src/components/Hero.tsx#L80)); "Python" ([components/Hero.tsx:87](Frontend-React/src/components/Hero.tsx#L87)); "Advanced" ([components/Hero.tsx:88](Frontend-React/src/components/Hero.tsx#L88)); "Machine Learning" ([components/Hero.tsx:95](Frontend-React/src/components/Hero.tsx#L95)); "Intermediate" ([components/Hero.tsx:96](Frontend-React/src/components/Hero.tsx#L96)); "AI Recommendation:" ([components/Hero.tsx:105](Frontend-React/src/components/Hero.tsx#L105)); "Consider taking "Advanced ML Engineering" to boost your profile by 23%" ([components/Hero.tsx:105](Frontend-React/src/components/Hero.tsx#L105)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/History.tsx`

1. **File:** `History.tsx` at `Frontend-React/src/components/History.tsx`
2. **Renders:** Static job-seeker activity timeline and links back to analysis/courses.
   - Exports: `History`.
3. **Visible UI elements:**
   - `<button>` at [components/History.tsx:172](Frontend-React/src/components/History.tsx#L172): label/text **Analyze New Resume**; onClick=`() => onNavigate('analysis')`. **onClick:** `() => onNavigate('analysis')` at [components/History.tsx:172](Frontend-React/src/components/History.tsx#L172).
   - `<button>` at [components/History.tsx:178](Frontend-React/src/components/History.tsx#L178): label/text **Browse Courses**; onClick=`() => onNavigate('courses')`. **onClick:** `() => onNavigate('courses')` at [components/History.tsx:178](Frontend-React/src/components/History.tsx#L178).
   - Fixed visible text (10 literals): "Activity History" ([components/History.tsx:85](Frontend-React/src/components/History.tsx#L85)); "Track your learning journey and achievements" ([components/History.tsx:88](Frontend-React/src/components/History.tsx#L88)); "Resumes Analyzed" ([components/History.tsx:98](Frontend-React/src/components/History.tsx#L98)); "Courses Completed" ([components/History.tsx:106](Frontend-React/src/components/History.tsx#L106)); "+15%" ([components/History.tsx:112](Frontend-React/src/components/History.tsx#L112)); "Skill Improvement" ([components/History.tsx:114](Frontend-React/src/components/History.tsx#L114)); "Achievements" ([components/History.tsx:122](Frontend-React/src/components/History.tsx#L122)); "Activity Timeline" ([components/History.tsx:128](Frontend-React/src/components/History.tsx#L128)); "Analyze New Resume" ([components/History.tsx:175](Frontend-React/src/components/History.tsx#L175)); "Browse Courses" ([components/History.tsx:181](Frontend-React/src/components/History.tsx#L181)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - [components/History.tsx:135](Frontend-React/src/components/History.tsx#L135): `index !== historyItems.length - 1`.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/HowItWorks.tsx`

1. **File:** `HowItWorks.tsx` at `Frontend-React/src/components/HowItWorks.tsx`
2. **Renders:** Landing-page four-step workflow explanation.
   - Exports: `HowItWorks`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text (2 literals): "How It Works" ([components/HowItWorks.tsx:35](Frontend-React/src/components/HowItWorks.tsx#L35)); "Get started in minutes with our simple four-step process" ([components/HowItWorks.tsx:38](Frontend-React/src/components/HowItWorks.tsx#L38)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - [components/HowItWorks.tsx:46](Frontend-React/src/components/HowItWorks.tsx#L46): `index < steps.length - 1`.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/JobDetails.tsx`

1. **File:** `JobDetails.tsx` at `Frontend-React/src/components/JobDetails.tsx`
2. **Renders:** Job detail view with apply and save actions.
   - Exports: `JobDetails`.
3. **Visible UI elements:**
   - `<button>` at [components/JobDetails.tsx:89](Frontend-React/src/components/JobDetails.tsx#L89): label/text **Back to Jobs**; onClick=`() => onNavigate('jobs')`. **onClick:** `() => onNavigate('jobs')` at [components/JobDetails.tsx:89](Frontend-React/src/components/JobDetails.tsx#L89).
   - `<button>` at [components/JobDetails.tsx:158](Frontend-React/src/components/JobDetails.tsx#L158): label/text **{handleApply} {isApplying ? ( <> <div className="w-5 h-5 border-2 border-white border-t-tran...} Applying... Applied Apply Now**; disabled=`isApplying || hasApplied`; onClick=`handleApply`. **onClick:** `handleApply` at [components/JobDetails.tsx:158](Frontend-React/src/components/JobDetails.tsx#L158).
   - `<button>` at [components/JobDetails.tsx:180](Frontend-React/src/components/JobDetails.tsx#L180): label/text **{handleSave} {isSaving} {isSaving ? ( <div className="w-5 h-5 border-2 border-green-700 border-t-trans...} {isSaved ? 'Saved' : 'Save Job'}**; disabled=`isSaving`; onClick=`handleSave`. **onClick:** `handleSave` at [components/JobDetails.tsx:180](Frontend-React/src/components/JobDetails.tsx#L180).
   - Fixed visible text (20 literals): "Back to Jobs" ([components/JobDetails.tsx:93](Frontend-React/src/components/JobDetails.tsx#L93)); "applicants" ([components/JobDetails.tsx:125](Frontend-React/src/components/JobDetails.tsx#L125)); "Match Score" ([components/JobDetails.tsx:145](Frontend-React/src/components/JobDetails.tsx#L145)); "Application submitted successfully! The company will review your profile." ([components/JobDetails.tsx:153](Frontend-React/src/components/JobDetails.tsx#L153)); "Applying..." ([components/JobDetails.tsx:165](Frontend-React/src/components/JobDetails.tsx#L165)); "Applied" ([components/JobDetails.tsx:170](Frontend-React/src/components/JobDetails.tsx#L170)); "Apply Now" ([components/JobDetails.tsx:175](Frontend-React/src/components/JobDetails.tsx#L175)); "Job Description" ([components/JobDetails.tsx:205](Frontend-React/src/components/JobDetails.tsx#L205)); "Responsibilities" ([components/JobDetails.tsx:212](Frontend-React/src/components/JobDetails.tsx#L212)); "Requirements" ([components/JobDetails.tsx:224](Frontend-React/src/components/JobDetails.tsx#L224)); "Nice to Have" ([components/JobDetails.tsx:236](Frontend-React/src/components/JobDetails.tsx#L236)); "Benefits" ([components/JobDetails.tsx:250](Frontend-React/src/components/JobDetails.tsx#L250)); "About" ([components/JobDetails.tsx:262](Frontend-React/src/components/JobDetails.tsx#L262)); "is a leading technology company focused on innovation and excellence. We're committed to building products that make a difference." ([components/JobDetails.tsx:264](Frontend-React/src/components/JobDetails.tsx#L264)); "Company Size:" ([components/JobDetails.tsx:269](Frontend-React/src/components/JobDetails.tsx#L269)); "500-1000" ([components/JobDetails.tsx:270](Frontend-React/src/components/JobDetails.tsx#L270)); "Industry:" ([components/JobDetails.tsx:273](Frontend-React/src/components/JobDetails.tsx#L273)); "Technology" ([components/JobDetails.tsx:274](Frontend-React/src/components/JobDetails.tsx#L274)); "Founded:" ([components/JobDetails.tsx:277](Frontend-React/src/components/JobDetails.tsx#L277)); "2015" ([components/JobDetails.tsx:278](Frontend-React/src/components/JobDetails.tsx#L278)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - `isApplying` / `setIsApplying` at [components/JobDetails.tsx:10](Frontend-React/src/components/JobDetails.tsx#L10), initial value `false`. Re-renders are triggered at [components/JobDetails.tsx:65](Frontend-React/src/components/JobDetails.tsx#L65) with `true`; [components/JobDetails.tsx:70](Frontend-React/src/components/JobDetails.tsx#L70) with `false`.
   - `hasApplied` / `setHasApplied` at [components/JobDetails.tsx:11](Frontend-React/src/components/JobDetails.tsx#L11), initial value `false`. Re-renders are triggered at [components/JobDetails.tsx:71](Frontend-React/src/components/JobDetails.tsx#L71) with `true`.
   - `isSaved` / `setIsSaved` at [components/JobDetails.tsx:12](Frontend-React/src/components/JobDetails.tsx#L12), initial value `false`. Re-renders are triggered at [components/JobDetails.tsx:82](Frontend-React/src/components/JobDetails.tsx#L82) with `!isSaved`.
   - `isSaving` / `setIsSaving` at [components/JobDetails.tsx:13](Frontend-React/src/components/JobDetails.tsx#L13), initial value `false`. Re-renders are triggered at [components/JobDetails.tsx:76](Frontend-React/src/components/JobDetails.tsx#L76) with `true`; [components/JobDetails.tsx:81](Frontend-React/src/components/JobDetails.tsx#L81) with `false`.
6. **Conditional rendering / auth / roles:**
   - [components/JobDetails.tsx:150](Frontend-React/src/components/JobDetails.tsx#L150): `hasApplied`.
   - [components/JobDetails.tsx:163](Frontend-React/src/components/JobDetails.tsx#L163): `isApplying`.
   - [components/JobDetails.tsx:168](Frontend-React/src/components/JobDetails.tsx#L168): `hasApplied`.
   - [components/JobDetails.tsx:189](Frontend-React/src/components/JobDetails.tsx#L189): `isSaving`.
   - [components/JobDetails.tsx:194](Frontend-React/src/components/JobDetails.tsx#L194): `isSaved`.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/JobPosting.tsx`

1. **File:** `JobPosting.tsx` at `Frontend-React/src/components/JobPosting.tsx`
2. **Renders:** Recruiter form for creating a job posting.
   - Exports: `JobPosting`.
3. **Visible UI elements:**
   - `<form>` at [components/JobPosting.tsx:134](Frontend-React/src/components/JobPosting.tsx#L134): label/text **{handleSubmit} Job Title * {formData.title} {errors.title} Company Name * {formData.company} {errors.company} Location * {formData.location} {errors.location} Job Type * {formData.type} Full-time Part-time Contract Inter**; onSubmit=`handleSubmit`. **onSubmit:** `handleSubmit` at [components/JobPosting.tsx:134](Frontend-React/src/components/JobPosting.tsx#L134).
   - `<input>` at [components/JobPosting.tsx:140](Frontend-React/src/components/JobPosting.tsx#L140): label/text **{formData.title}**; type=`text`; placeholder=`e.g., Senior Software Engineer`; value=`formData.title`; onChange=`(e) => { setFormData({ ...formData, title: e.target.value }); clearFieldError('title'); }`.
   - `<input>` at [components/JobPosting.tsx:163](Frontend-React/src/components/JobPosting.tsx#L163): label/text **{formData.company}**; type=`text`; placeholder=`Your company name`; value=`formData.company`; onChange=`(e) => { setFormData({ ...formData, company: e.target.value }); clearFieldError('company'); }`.
   - `<input>` at [components/JobPosting.tsx:186](Frontend-React/src/components/JobPosting.tsx#L186): label/text **{formData.location}**; type=`text`; placeholder=`e.g., San Francisco, CA (Remote)`; value=`formData.location`; onChange=`(e) => { setFormData({ ...formData, location: e.target.value }); clearFieldError('location'); }`.
   - `<select>` at [components/JobPosting.tsx:212](Frontend-React/src/components/JobPosting.tsx#L212): label/text **{formData.type} Full-time Part-time Contract Internship**; value=`formData.type`; onChange=`(e) => setFormData({ ...formData, type: e.target.value })`.
   - `<select>` at [components/JobPosting.tsx:230](Frontend-React/src/components/JobPosting.tsx#L230): label/text **{formData.experience} Entry Level Mid Level Senior Level Lead/Principal**; value=`formData.experience`; onChange=`(e) => setFormData({ ...formData, experience: e.target.value })`.
   - `<input>` at [components/JobPosting.tsx:248](Frontend-React/src/components/JobPosting.tsx#L248): label/text **{formData.salary}**; type=`text`; placeholder=`e.g., $100k - $150k`; value=`formData.salary`; onChange=`(e) => setFormData({ ...formData, salary: e.target.value })`.
   - `<textarea>` at [components/JobPosting.tsx:263](Frontend-React/src/components/JobPosting.tsx#L263): label/text **{formData.description}**; placeholder=`Describe the role, responsibilities, and what makes this position exciting...`; value=`formData.description`; onChange=`(e) => { setFormData({ ...formData, description: e.target.value }); clearFieldError('description'); }`.
   - `<textarea>` at [components/JobPosting.tsx:290](Frontend-React/src/components/JobPosting.tsx#L290): label/text **{formData.requirements}**; placeholder=`List key requirements and qualifications (one per line)...`; value=`formData.requirements`; onChange=`(e) => { setFormData({ ...formData, requirements: e.target.value }); clearFieldError('requirements'); }`.
   - `<input>` at [components/JobPosting.tsx:317](Frontend-React/src/components/JobPosting.tsx#L317): label/text **{formData.skills}**; type=`text`; placeholder=`e.g., JavaScript, React, Node.js, AWS (comma separated)`; value=`formData.skills`; onChange=`(e) => { setFormData({ ...formData, skills: e.target.value }); clearFieldError('skills'); }`.
   - `<button>` at [components/JobPosting.tsx:347](Frontend-React/src/components/JobPosting.tsx#L347): label/text **{isLoading} Cancel**; type=`button`; disabled=`isLoading`; onClick=`() => onNavigate('recruiter-profile')`. **onClick:** `() => onNavigate('recruiter-profile')` at [components/JobPosting.tsx:347](Frontend-React/src/components/JobPosting.tsx#L347).
   - `<button>` at [components/JobPosting.tsx:355](Frontend-React/src/components/JobPosting.tsx#L355): label/text **{isLoading} {isLoading ? ( <> <div className="w-5 h-5 border-2 border-white border-t-trans...} Posting Job... Post Job**; type=`submit`; disabled=`isLoading`.
   - Fixed visible text (30 literals): "Post a New Job" ([components/JobPosting.tsx:111](Frontend-React/src/components/JobPosting.tsx#L111)); "Find the perfect candidates with AI-powered matching" ([components/JobPosting.tsx:114](Frontend-React/src/components/JobPosting.tsx#L114)); "Please correct the following errors:" ([components/JobPosting.tsx:122](Frontend-React/src/components/JobPosting.tsx#L122)); "Job Title *" ([components/JobPosting.tsx:137](Frontend-React/src/components/JobPosting.tsx#L137)); "Company Name *" ([components/JobPosting.tsx:162](Frontend-React/src/components/JobPosting.tsx#L162)); "Location *" ([components/JobPosting.tsx:183](Frontend-React/src/components/JobPosting.tsx#L183)); "Job Type *" ([components/JobPosting.tsx:209](Frontend-React/src/components/JobPosting.tsx#L209)); "Full-time" ([components/JobPosting.tsx:217](Frontend-React/src/components/JobPosting.tsx#L217)); "Part-time" ([components/JobPosting.tsx:218](Frontend-React/src/components/JobPosting.tsx#L218)); "Contract" ([components/JobPosting.tsx:219](Frontend-React/src/components/JobPosting.tsx#L219)); "Internship" ([components/JobPosting.tsx:220](Frontend-React/src/components/JobPosting.tsx#L220)); "Experience *" ([components/JobPosting.tsx:227](Frontend-React/src/components/JobPosting.tsx#L227)); "Entry Level" ([components/JobPosting.tsx:235](Frontend-React/src/components/JobPosting.tsx#L235)); "Mid Level" ([components/JobPosting.tsx:236](Frontend-React/src/components/JobPosting.tsx#L236)); "Senior Level" ([components/JobPosting.tsx:237](Frontend-React/src/components/JobPosting.tsx#L237)); "Lead/Principal" ([components/JobPosting.tsx:238](Frontend-React/src/components/JobPosting.tsx#L238)); "Salary Range" ([components/JobPosting.tsx:245](Frontend-React/src/components/JobPosting.tsx#L245)); "Optional - helps attract candidates" ([components/JobPosting.tsx:256](Frontend-React/src/components/JobPosting.tsx#L256)); "Job Description *" ([components/JobPosting.tsx:262](Frontend-React/src/components/JobPosting.tsx#L262)); "characters (minimum 50, maximum 5000)" ([components/JobPosting.tsx:281](Frontend-React/src/components/JobPosting.tsx#L281)); "Requirements *" ([components/JobPosting.tsx:289](Frontend-React/src/components/JobPosting.tsx#L289)); "characters (minimum 20, maximum 3000)" ([components/JobPosting.tsx:308](Frontend-React/src/components/JobPosting.tsx#L308)); "Required Skills *" ([components/JobPosting.tsx:316](Frontend-React/src/components/JobPosting.tsx#L316)); "AI will use these skills to match with candidates" ([components/JobPosting.tsx:333](Frontend-React/src/components/JobPosting.tsx#L333)); "💡" ([components/JobPosting.tsx:339](Frontend-React/src/components/JobPosting.tsx#L339)); "Tip:" ([components/JobPosting.tsx:340](Frontend-React/src/components/JobPosting.tsx#L340)); "Our AI will automatically match your job with qualified candidates based on their skill profiles and readiness scores." ([components/JobPosting.tsx:340](Frontend-React/src/components/JobPosting.tsx#L340)); "Cancel" ([components/JobPosting.tsx:352](Frontend-React/src/components/JobPosting.tsx#L352)); "Posting Job..." ([components/JobPosting.tsx:362](Frontend-React/src/components/JobPosting.tsx#L362)); "Post Job" ([components/JobPosting.tsx:366](Frontend-React/src/components/JobPosting.tsx#L366)).
4. **API calls:**
   - [components/JobPosting.tsx:87](Frontend-React/src/components/JobPosting.tsx#L87): `jobsAPI.createJob(jobData; token)` from `../api/jobs.api`. Response is awaited/returned without a named assignment; subsequent state updates in the same handler: `setIsLoading(false) @ L89`, `setIsLoading(false) @ L93`, `setErrors({ submit: err.message || 'Failed to post job' }) @ L94`.
5. **State and re-render triggers:**
   - `formData` / `setFormData` at [components/JobPosting.tsx:11](Frontend-React/src/components/JobPosting.tsx#L11), initial value `{ title: '', company: '', location: '', type: 'full-time', experience: 'mid', salary: '', description: '', requirements: '', skills: '', }`. Re-renders are triggered at [components/JobPosting.tsx:144](Frontend-React/src/components/JobPosting.tsx#L144) with `{ ...formData, title: e.target.value }`; [components/JobPosting.tsx:167](Frontend-React/src/components/JobPosting.tsx#L167) with `{ ...formData, company: e.target.value }`; [components/JobPosting.tsx:190](Frontend-React/src/components/JobPosting.tsx#L190) with `{ ...formData, location: e.target.value }`; [components/JobPosting.tsx:214](Frontend-React/src/components/JobPosting.tsx#L214) with `{ ...formData, type: e.target.value }`; [components/JobPosting.tsx:232](Frontend-React/src/components/JobPosting.tsx#L232) with `{ ...formData, experience: e.target.value }`; [components/JobPosting.tsx:251](Frontend-React/src/components/JobPosting.tsx#L251) with `{ ...formData, salary: e.target.value }`; [components/JobPosting.tsx:266](Frontend-React/src/components/JobPosting.tsx#L266) with `{ ...formData, description: e.target.value }`; [components/JobPosting.tsx:293](Frontend-React/src/components/JobPosting.tsx#L293) with `{ ...formData, requirements: e.target.value }`; [components/JobPosting.tsx:321](Frontend-React/src/components/JobPosting.tsx#L321) with `{ ...formData, skills: e.target.value }`.
   - `errors` / `setErrors` at [components/JobPosting.tsx:22](Frontend-React/src/components/JobPosting.tsx#L22), initial value `{}`. Re-renders are triggered at [components/JobPosting.tsx:58](Frontend-React/src/components/JobPosting.tsx#L58) with `newErrors`; [components/JobPosting.tsx:63](Frontend-React/src/components/JobPosting.tsx#L63) with `{}`; [components/JobPosting.tsx:94](Frontend-React/src/components/JobPosting.tsx#L94) with `{ submit: err.message || 'Failed to post job' }`; [components/JobPosting.tsx:103](Frontend-React/src/components/JobPosting.tsx#L103) with `newErrors`.
   - `isLoading` / `setIsLoading` at [components/JobPosting.tsx:23](Frontend-React/src/components/JobPosting.tsx#L23), initial value `false`. Re-renders are triggered at [components/JobPosting.tsx:64](Frontend-React/src/components/JobPosting.tsx#L64) with `true`; [components/JobPosting.tsx:89](Frontend-React/src/components/JobPosting.tsx#L89) with `false`; [components/JobPosting.tsx:93](Frontend-React/src/components/JobPosting.tsx#L93) with `false`.
6. **Conditional rendering / auth / roles:**
   - [components/JobPosting.tsx:32](Frontend-React/src/components/JobPosting.tsx#L32): `titleError`.
   - [components/JobPosting.tsx:35](Frontend-React/src/components/JobPosting.tsx#L35): `companyError`.
   - [components/JobPosting.tsx:38](Frontend-React/src/components/JobPosting.tsx#L38): `locationError`.
   - [components/JobPosting.tsx:42](Frontend-React/src/components/JobPosting.tsx#L42): `descriptionError`.
   - [components/JobPosting.tsx:47](Frontend-React/src/components/JobPosting.tsx#L47): `requirementsError`.
   - [components/JobPosting.tsx:53](Frontend-React/src/components/JobPosting.tsx#L53): `formData.skills.split(',').filter(s => s.trim()).length === 0`.
   - [components/JobPosting.tsx:57](Frontend-React/src/components/JobPosting.tsx#L57): `Object.keys(newErrors).length > 0`.
   - [components/JobPosting.tsx:82](Frontend-React/src/components/JobPosting.tsx#L82): `!token`.
   - [components/JobPosting.tsx:100](Frontend-React/src/components/JobPosting.tsx#L100): `errors[field]`.
   - [components/JobPosting.tsx:117](Frontend-React/src/components/JobPosting.tsx#L117): `Object.keys(errors).length > 0`.
   - [components/JobPosting.tsx:154](Frontend-React/src/components/JobPosting.tsx#L154): `errors.title`.
   - [components/JobPosting.tsx:176](Frontend-React/src/components/JobPosting.tsx#L176): `errors.company`.
   - [components/JobPosting.tsx:200](Frontend-React/src/components/JobPosting.tsx#L200): `errors.location`.
   - [components/JobPosting.tsx:277](Frontend-React/src/components/JobPosting.tsx#L277): `errors.description`.
   - [components/JobPosting.tsx:304](Frontend-React/src/components/JobPosting.tsx#L304): `errors.requirements`.
   - [components/JobPosting.tsx:330](Frontend-React/src/components/JobPosting.tsx#L330): `errors.skills`.
   - [components/JobPosting.tsx:360](Frontend-React/src/components/JobPosting.tsx#L360): `isLoading`.
7. **Known errors / TODOs visible in code:**
   - [components/JobPosting.tsx:83](Frontend-React/src/components/JobPosting.tsx#L83): `alert('Session expired, please log in again');`.
   - [components/JobPosting.tsx:90](Frontend-React/src/components/JobPosting.tsx#L90): `alert('Job posted successfully! Candidates will be matched based on their skills and readiness scores.');`.

## `Frontend-React/src/components/JobsListing.tsx`

1. **File:** `JobsListing.tsx` at `Frontend-React/src/components/JobsListing.tsx`
2. **Renders:** Searchable/filterable job listing enriched with match scores and saved-job actions.
   - Exports: `JobsListing`.
3. **Visible UI elements:**
   - `<input>` at [components/JobsListing.tsx:153](Frontend-React/src/components/JobsListing.tsx#L153): label/text **{searchTerm}**; type=`text`; placeholder=`Search jobs, companies, or skills...`; value=`searchTerm`; onChange=`(e) => setSearchTerm(e.target.value)`.
   - `<select>` at [components/JobsListing.tsx:163](Frontend-React/src/components/JobsListing.tsx#L163): label/text **{filterType} All Types Full-time Part-time Contract Remote**; value=`filterType`; onChange=`(e) => setFilterType(e.target.value)`.
   - `<button>` at [components/JobsListing.tsx:286](Frontend-React/src/components/JobsListing.tsx#L286): label/text **View Details**; onClick=`() => { localStorage.setItem('latestJobId', job.id); onNavigate('job-details'); }`. **onClick:** `() => { localStorage.setItem('latestJobId', job.id); onNavigate('job-details'); }` at [components/JobsListing.tsx:286](Frontend-React/src/components/JobsListing.tsx#L286).
   - `<button>` at [components/JobsListing.tsx:295](Frontend-React/src/components/JobsListing.tsx#L295): label/text **{isSaving ? 'Saving...' : isSaved ? 'Saved' : 'Save Job'}**; disabled=`isSaving || isSaved`; onClick=`() => handleSaveJob(job.id)`. **onClick:** `() => handleSaveJob(job.id)` at [components/JobsListing.tsx:295](Frontend-React/src/components/JobsListing.tsx#L295).
   - `<button>` at [components/JobsListing.tsx:324](Frontend-React/src/components/JobsListing.tsx#L324): label/text **Clear Filters**; onClick=`() => { setSearchTerm(''); setFilterType('all'); }`. **onClick:** `() => { setSearchTerm(''); setFilterType('all'); }` at [components/JobsListing.tsx:324](Frontend-React/src/components/JobsListing.tsx#L324).
   - Fixed visible text (19 literals): "Available Jobs" ([components/JobsListing.tsx:142](Frontend-React/src/components/JobsListing.tsx#L142)); "Discover opportunities matched to your skills" ([components/JobsListing.tsx:145](Frontend-React/src/components/JobsListing.tsx#L145)); "All Types" ([components/JobsListing.tsx:168](Frontend-React/src/components/JobsListing.tsx#L168)); "Full-time" ([components/JobsListing.tsx:169](Frontend-React/src/components/JobsListing.tsx#L169)); "Part-time" ([components/JobsListing.tsx:170](Frontend-React/src/components/JobsListing.tsx#L170)); "Contract" ([components/JobsListing.tsx:171](Frontend-React/src/components/JobsListing.tsx#L171)); "Remote" ([components/JobsListing.tsx:172](Frontend-React/src/components/JobsListing.tsx#L172)); "Error loading jobs" ([components/JobsListing.tsx:180](Frontend-React/src/components/JobsListing.tsx#L180)); "Available Jobs" ([components/JobsListing.tsx:191](Frontend-React/src/components/JobsListing.tsx#L191)); "Avg. Match Score" ([components/JobsListing.tsx:200](Frontend-React/src/components/JobsListing.tsx#L200)); "New This Week" ([components/JobsListing.tsx:205](Frontend-React/src/components/JobsListing.tsx#L205)); "Remote Jobs" ([components/JobsListing.tsx:212](Frontend-React/src/components/JobsListing.tsx#L212)); "Loading jobs..." ([components/JobsListing.tsx:221](Frontend-React/src/components/JobsListing.tsx#L221)); "Match" ([components/JobsListing.tsx:247](Frontend-React/src/components/JobsListing.tsx#L247)); "Posted" ([components/JobsListing.tsx:279](Frontend-React/src/components/JobsListing.tsx#L279)); "applicants" ([components/JobsListing.tsx:281](Frontend-React/src/components/JobsListing.tsx#L281)); "View Details" ([components/JobsListing.tsx:292](Frontend-React/src/components/JobsListing.tsx#L292)); "No jobs found" ([components/JobsListing.tsx:317](Frontend-React/src/components/JobsListing.tsx#L317)); "Clear Filters" ([components/JobsListing.tsx:330](Frontend-React/src/components/JobsListing.tsx#L330)).
4. **API calls:**
   - [components/JobsListing.tsx:33](Frontend-React/src/components/JobsListing.tsx#L33): `fetch(\`${API_BASE_URL}/matches\`; { headers: { 'Authorization': \`Bearer ${token}\` } })` from `browser Fetch API`. Response is assigned to `matchesRes`; subsequent state updates in the same handler: `setJobs(mapped) @ L78`, `setSavedJobs(savedJobsRes.map((sj: any) => sj.job_id || sj.id)) @ L88`, `setError(err.message || 'Failed to fetch jobs') @ L97`, `setIsLoading(false) @ L99`.
   - [components/JobsListing.tsx:41](Frontend-React/src/components/JobsListing.tsx#L41): `jobsAPI.getAllJobs({}; token)` from `../api/jobs.api`. Response is assigned to `jobsRes`; subsequent state updates in the same handler: `setJobs(mapped) @ L78`, `setSavedJobs(savedJobsRes.map((sj: any) => sj.job_id || sj.id)) @ L88`, `setError(err.message || 'Failed to fetch jobs') @ L97`, `setIsLoading(false) @ L99`.
   - [components/JobsListing.tsx:86](Frontend-React/src/components/JobsListing.tsx#L86): `usersAPI.getSavedJobs(userId; token)` from `../api/users.api`. Response is assigned to `savedJobsRes`; subsequent state updates in the same handler: `setSavedJobs(savedJobsRes.map((sj: any) => sj.job_id || sj.id)) @ L88`, `setError(err.message || 'Failed to fetch jobs') @ L97`, `setIsLoading(false) @ L99`.
   - [components/JobsListing.tsx:120](Frontend-React/src/components/JobsListing.tsx#L120): `usersAPI.saveJob(userId; jobId; token)` from `../api/users.api`. Response is awaited/returned without a named assignment; subsequent state updates in the same handler: `setSavedJobs(prev => [...prev, jobId]) @ L121`, `setSavingJobId(null) @ L126`.
5. **State and re-render triggers:**
   - `searchTerm` / `setSearchTerm` at [components/JobsListing.tsx:11](Frontend-React/src/components/JobsListing.tsx#L11), initial value `''`. Re-renders are triggered at [components/JobsListing.tsx:156](Frontend-React/src/components/JobsListing.tsx#L156) with `e.target.value`; [components/JobsListing.tsx:326](Frontend-React/src/components/JobsListing.tsx#L326) with `''`.
   - `filterType` / `setFilterType` at [components/JobsListing.tsx:12](Frontend-React/src/components/JobsListing.tsx#L12), initial value `'all'`. Re-renders are triggered at [components/JobsListing.tsx:165](Frontend-React/src/components/JobsListing.tsx#L165) with `e.target.value`; [components/JobsListing.tsx:327](Frontend-React/src/components/JobsListing.tsx#L327) with `'all'`.
   - `savedJobs` / `setSavedJobs` at [components/JobsListing.tsx:13](Frontend-React/src/components/JobsListing.tsx#L13), initial value `[]`. Re-renders are triggered at [components/JobsListing.tsx:88](Frontend-React/src/components/JobsListing.tsx#L88) with `savedJobsRes.map((sj: any) => sj.job_id || sj.id)`; [components/JobsListing.tsx:121](Frontend-React/src/components/JobsListing.tsx#L121) with `prev => [...prev, jobId]`.
   - `savingJobId` / `setSavingJobId` at [components/JobsListing.tsx:14](Frontend-React/src/components/JobsListing.tsx#L14), initial value `null`. Re-renders are triggered at [components/JobsListing.tsx:114](Frontend-React/src/components/JobsListing.tsx#L114) with `jobId`; [components/JobsListing.tsx:126](Frontend-React/src/components/JobsListing.tsx#L126) with `null`.
   - `jobs` / `setJobs` at [components/JobsListing.tsx:15](Frontend-React/src/components/JobsListing.tsx#L15), initial value `[]`. Re-renders are triggered at [components/JobsListing.tsx:78](Frontend-React/src/components/JobsListing.tsx#L78) with `mapped`.
   - `isLoading` / `setIsLoading` at [components/JobsListing.tsx:16](Frontend-React/src/components/JobsListing.tsx#L16), initial value `true`. Re-renders are triggered at [components/JobsListing.tsx:20](Frontend-React/src/components/JobsListing.tsx#L20) with `true`; [components/JobsListing.tsx:99](Frontend-React/src/components/JobsListing.tsx#L99) with `false`.
   - `error` / `setError` at [components/JobsListing.tsx:17](Frontend-React/src/components/JobsListing.tsx#L17), initial value `null`. Re-renders are triggered at [components/JobsListing.tsx:21](Frontend-React/src/components/JobsListing.tsx#L21) with `null`; [components/JobsListing.tsx:27](Frontend-React/src/components/JobsListing.tsx#L27) with `'Session expired, please log in again'`; [components/JobsListing.tsx:97](Frontend-React/src/components/JobsListing.tsx#L97) with `err.message || 'Failed to fetch jobs'`.
   - Effect at [components/JobsListing.tsx:103](Frontend-React/src/components/JobsListing.tsx#L103) runs with dependencies `[]`; body starts `() => { fetchJobs(); }`.
6. **Conditional rendering / auth / roles:**
   - [components/JobsListing.tsx:26](Frontend-React/src/components/JobsListing.tsx#L26): `!token`.
   - [components/JobsListing.tsx:84](Frontend-React/src/components/JobsListing.tsx#L84): `userId`.
   - [components/JobsListing.tsx:109](Frontend-React/src/components/JobsListing.tsx#L109): `!token`.
   - [components/JobsListing.tsx:178](Frontend-React/src/components/JobsListing.tsx#L178): `error`.
   - [components/JobsListing.tsx:186](Frontend-React/src/components/JobsListing.tsx#L186): `!isLoading`.
   - [components/JobsListing.tsx:196](Frontend-React/src/components/JobsListing.tsx#L196): `filteredJobs.length > 0`.
   - [components/JobsListing.tsx:218](Frontend-React/src/components/JobsListing.tsx#L218): `isLoading`.
   - [components/JobsListing.tsx:300](Frontend-React/src/components/JobsListing.tsx#L300): `isSaving`.
   - [components/JobsListing.tsx:311](Frontend-React/src/components/JobsListing.tsx#L311): `!isLoading && filteredJobs.length === 0`.
   - [components/JobsListing.tsx:319](Frontend-React/src/components/JobsListing.tsx#L319): `searchTerm || filterType !== 'all'`.
   - [components/JobsListing.tsx:323](Frontend-React/src/components/JobsListing.tsx#L323): `searchTerm || filterType !== 'all'`.
7. **Known errors / TODOs visible in code:**
   - [components/JobsListing.tsx:21](Frontend-React/src/components/JobsListing.tsx#L21): `setError(null);`.
   - [components/JobsListing.tsx:27](Frontend-React/src/components/JobsListing.tsx#L27): `setError('Session expired, please log in again');`.
   - [components/JobsListing.tsx:91](Frontend-React/src/components/JobsListing.tsx#L91): `console.error("Failed to load saved jobs:", err);`.
   - [components/JobsListing.tsx:96](Frontend-React/src/components/JobsListing.tsx#L96): `console.error(err);`.
   - [components/JobsListing.tsx:97](Frontend-React/src/components/JobsListing.tsx#L97): `setError(err.message || 'Failed to fetch jobs');`.
   - [components/JobsListing.tsx:110](Frontend-React/src/components/JobsListing.tsx#L110): `alert('Session expired, please log in again');`.
   - [components/JobsListing.tsx:123](Frontend-React/src/components/JobsListing.tsx#L123): `console.error(err);`.
   - [components/JobsListing.tsx:124](Frontend-React/src/components/JobsListing.tsx#L124): `alert(err.message || 'Failed to save job');`.

## `Frontend-React/src/components/LearningPath.tsx`

1. **File:** `LearningPath.tsx` at `Frontend-React/src/components/LearningPath.tsx`
2. **Renders:** Job-seeker roadmap page showing expandable learning phases.
   - Exports: `LearningPath`.
3. **Visible UI elements:**
   - `<button>` at [components/LearningPath.tsx:146](Frontend-React/src/components/LearningPath.tsx#L146): label/text **Go to Resume Upload**; onClick=`() => onNavigate('analysis')`. **onClick:** `() => onNavigate('analysis')` at [components/LearningPath.tsx:146](Frontend-React/src/components/LearningPath.tsx#L146).
   - `<button>` at [components/LearningPath.tsx:162](Frontend-React/src/components/LearningPath.tsx#L162): label/text **Back to Analysis**; onClick=`() => onNavigate('analysis')`. **onClick:** `() => onNavigate('analysis')` at [components/LearningPath.tsx:162](Frontend-React/src/components/LearningPath.tsx#L162).
   - `<div>` at [components/LearningPath.tsx:208](Frontend-React/src/components/LearningPath.tsx#L208): label/text **{phase.title} {phase.duration} {phase.difficulty} {phase.readinessGain} Readiness**; onClick=`() => setExpandedPhase(expandedPhase === index ? null : index)`. **onClick:** `() => setExpandedPhase(expandedPhase === index ? null : index)` at [components/LearningPath.tsx:208](Frontend-React/src/components/LearningPath.tsx#L208).
   - `<button>` at [components/LearningPath.tsx:290](Frontend-React/src/components/LearningPath.tsx#L290): label/text **View Course Details**; onClick=`() => onNavigate('courses')`. **onClick:** `() => onNavigate('courses')` at [components/LearningPath.tsx:290](Frontend-React/src/components/LearningPath.tsx#L290).
   - `<button>` at [components/LearningPath.tsx:315](Frontend-React/src/components/LearningPath.tsx#L315): label/text **Start Phase 1**; onClick=`() => onNavigate('courses')`. **onClick:** `() => onNavigate('courses')` at [components/LearningPath.tsx:315](Frontend-React/src/components/LearningPath.tsx#L315).
   - `<button>` at [components/LearningPath.tsx:321](Frontend-React/src/components/LearningPath.tsx#L321): label/text **Go to Profile**; onClick=`() => onNavigate('profile')`. **onClick:** `() => onNavigate('profile')` at [components/LearningPath.tsx:321](Frontend-React/src/components/LearningPath.tsx#L321).
   - Fixed visible text (18 literals): "Generating your career roadmap..." ([components/LearningPath.tsx:135](Frontend-React/src/components/LearningPath.tsx#L135)); "Roadmap Generation Failed" ([components/LearningPath.tsx:144](Frontend-React/src/components/LearningPath.tsx#L144)); "Go to Resume Upload" ([components/LearningPath.tsx:149](Frontend-React/src/components/LearningPath.tsx#L149)); "Back to Analysis" ([components/LearningPath.tsx:166](Frontend-React/src/components/LearningPath.tsx#L166)); "Your personalized learning roadmap to achieve your career goals" ([components/LearningPath.tsx:172](Frontend-React/src/components/LearningPath.tsx#L172)); "Target Role" ([components/LearningPath.tsx:181](Frontend-React/src/components/LearningPath.tsx#L181)); "Est. Duration" ([components/LearningPath.tsx:186](Frontend-React/src/components/LearningPath.tsx#L186)); "Readiness Boost" ([components/LearningPath.tsx:191](Frontend-React/src/components/LearningPath.tsx#L191)); "Learning Phases" ([components/LearningPath.tsx:196](Frontend-React/src/components/LearningPath.tsx#L196)); "Readiness" ([components/LearningPath.tsx:228](Frontend-React/src/components/LearningPath.tsx#L228)); "AI Insight:" ([components/LearningPath.tsx:244](Frontend-React/src/components/LearningPath.tsx#L244)); "Skills You'll Learn" ([components/LearningPath.tsx:251](Frontend-React/src/components/LearningPath.tsx#L251)); "Courses in This Phase" ([components/LearningPath.tsx:269](Frontend-React/src/components/LearningPath.tsx#L269)); "View Course Details" ([components/LearningPath.tsx:293](Frontend-React/src/components/LearningPath.tsx#L293)); "Ready to Start Your Journey?" ([components/LearningPath.tsx:310](Frontend-React/src/components/LearningPath.tsx#L310)); "Begin with Phase 1 and progress through the structured curriculum designed specifically for your career goals." ([components/LearningPath.tsx:311](Frontend-React/src/components/LearningPath.tsx#L311)); "Start Phase 1" ([components/LearningPath.tsx:318](Frontend-React/src/components/LearningPath.tsx#L318)); "Go to Profile" ([components/LearningPath.tsx:324](Frontend-React/src/components/LearningPath.tsx#L324)).
4. **API calls:**
   - [components/LearningPath.tsx:31](Frontend-React/src/components/LearningPath.tsx#L31): `fetch(\`${API_BASE_URL}/matches\`; { headers: { 'Authorization': \`Bearer ${token}\`, } })` from `browser Fetch API`. Response is assigned to `response`; subsequent state updates in the same handler: `setLearningPath({ title: \`${targetRole} Career Path\`, targetRole, duration: \`${rawRoadmap.length} weeks\`, readine...) @ L80`, `setError(err.message || 'Failed to generate learning path') @ L108`, `setIsLoading(false) @ L110`.
   - [components/LearningPath.tsx:52](Frontend-React/src/components/LearningPath.tsx#L52): `resumeAPI.getRoadmap(analysisId; token)` from `../api/resume.api`. Response is assigned to `pathData`; subsequent state updates in the same handler: `setLearningPath({ title: \`${targetRole} Career Path\`, targetRole, duration: \`${rawRoadmap.length} weeks\`, readine...) @ L80`, `setError(err.message || 'Failed to generate learning path') @ L108`, `setIsLoading(false) @ L110`.
5. **State and re-render triggers:**
   - `expandedPhase` / `setExpandedPhase` at [components/LearningPath.tsx:10](Frontend-React/src/components/LearningPath.tsx#L10), initial value `0`. Re-renders are triggered at [components/LearningPath.tsx:210](Frontend-React/src/components/LearningPath.tsx#L210) with `expandedPhase === index ? null : index`.
   - `learningPath` / `setLearningPath` at [components/LearningPath.tsx:11](Frontend-React/src/components/LearningPath.tsx#L11), initial value `null`. Re-renders are triggered at [components/LearningPath.tsx:80](Frontend-React/src/components/LearningPath.tsx#L80) with `{ title: \`${targetRole} Career Path\`, targetRole, duration: \`${rawRoadmap.length} weeks\`, readinessBoost: '+25%', phases: mappedPhases.le...`.
   - `isLoading` / `setIsLoading` at [components/LearningPath.tsx:12](Frontend-React/src/components/LearningPath.tsx#L12), initial value `true`. Re-renders are triggered at [components/LearningPath.tsx:16](Frontend-React/src/components/LearningPath.tsx#L16) with `true`; [components/LearningPath.tsx:110](Frontend-React/src/components/LearningPath.tsx#L110) with `false`.
   - `error` / `setError` at [components/LearningPath.tsx:13](Frontend-React/src/components/LearningPath.tsx#L13), initial value `null`. Re-renders are triggered at [components/LearningPath.tsx:17](Frontend-React/src/components/LearningPath.tsx#L17) with `null`; [components/LearningPath.tsx:21](Frontend-React/src/components/LearningPath.tsx#L21) with `'Session expired, please log in again'`; [components/LearningPath.tsx:108](Frontend-React/src/components/LearningPath.tsx#L108) with `err.message || 'Failed to generate learning path'`.
   - Effect at [components/LearningPath.tsx:114](Frontend-React/src/components/LearningPath.tsx#L114) runs with dependencies `[]`; body starts `() => { fetchLearningPath(); }`.
6. **Conditional rendering / auth / roles:**
   - [components/LearningPath.tsx:20](Frontend-React/src/components/LearningPath.tsx#L20): `!token`.
   - [components/LearningPath.tsx:38](Frontend-React/src/components/LearningPath.tsx#L38): `matches && matches.length > 0`.
   - [components/LearningPath.tsx:131](Frontend-React/src/components/LearningPath.tsx#L131): `isLoading`.
   - [components/LearningPath.tsx:140](Frontend-React/src/components/LearningPath.tsx#L140): `error || !learningPath`.
   - [components/LearningPath.tsx:239](Frontend-React/src/components/LearningPath.tsx#L239): `expandedPhase === index`.
   - [components/LearningPath.tsx:242](Frontend-React/src/components/LearningPath.tsx#L242): `phase.explanation`.
7. **Known errors / TODOs visible in code:**
   - [components/LearningPath.tsx:17](Frontend-React/src/components/LearningPath.tsx#L17): `setError(null);`.
   - [components/LearningPath.tsx:21](Frontend-React/src/components/LearningPath.tsx#L21): `setError('Session expired, please log in again');`.
   - [components/LearningPath.tsx:48](Frontend-React/src/components/LearningPath.tsx#L48): `throw new Error("No resume analysis found. Please upload and analyze your resume first.");`.
   - [components/LearningPath.tsx:107](Frontend-React/src/components/LearningPath.tsx#L107): `console.error(err);`.
   - [components/LearningPath.tsx:108](Frontend-React/src/components/LearningPath.tsx#L108): `setError(err.message || 'Failed to generate learning path');`.

## `Frontend-React/src/components/Login.tsx`

1. **File:** `Login.tsx` at `Frontend-React/src/components/Login.tsx`
2. **Renders:** Sign-in form.
   - Exports: `Login`.
3. **Visible UI elements:**
   - `<form>` at [components/Login.tsx:66](Frontend-React/src/components/Login.tsx#L66): label/text **{handleSubmit} Email Address {email} {errors.email} Password {password} {errors.password} Remember me Forgot password? {isLoading} {isLoading ? ( <> <div className="w-5 h-5 border-2 border-white border-t-trans...} Signin**; onSubmit=`handleSubmit`. **onSubmit:** `handleSubmit` at [components/Login.tsx:66](Frontend-React/src/components/Login.tsx#L66).
   - `<input>` at [components/Login.tsx:71](Frontend-React/src/components/Login.tsx#L71): label/text **{email}**; type=`email`; placeholder=`you@example.com`; value=`email`; onChange=`(e) => { setEmail(e.target.value); if (errors.email) setErrors({ ...errors, email: undefined }); }`.
   - `<input>` at [components/Login.tsx:97](Frontend-React/src/components/Login.tsx#L97): label/text **{password}**; type=`password`; placeholder=`Enter your password`; value=`password`; onChange=`(e) => { setPassword(e.target.value); if (errors.password) setErrors({ ...errors, password: undefined }); }`.
   - `<input>` at [components/Login.tsx:121](Frontend-React/src/components/Login.tsx#L121): label/text **(no fixed label)**; type=`checkbox`.
   - `<button>` at [components/Login.tsx:124](Frontend-React/src/components/Login.tsx#L124): label/text **Forgot password?**; type=`button`.
   - `<button>` at [components/Login.tsx:129](Frontend-React/src/components/Login.tsx#L129): label/text **{isLoading} {isLoading ? ( <> <div className="w-5 h-5 border-2 border-white border-t-trans...} Signing In... Sign In**; type=`submit`; disabled=`isLoading`.
   - `<button>` at [components/Login.tsx:151](Frontend-React/src/components/Login.tsx#L151): label/text **Sign up for free**; onClick=`() => onNavigate('signup')`. **onClick:** `() => onNavigate('signup')` at [components/Login.tsx:151](Frontend-React/src/components/Login.tsx#L151).
   - Fixed visible text (17 literals): "Welcome Back" ([components/Login.tsx:52](Frontend-React/src/components/Login.tsx#L52)); "Sign in to continue your learning journey" ([components/Login.tsx:55](Frontend-React/src/components/Login.tsx#L55)); "Email Address" ([components/Login.tsx:68](Frontend-React/src/components/Login.tsx#L68)); "Password" ([components/Login.tsx:94](Frontend-React/src/components/Login.tsx#L94)); "Remember me" ([components/Login.tsx:122](Frontend-React/src/components/Login.tsx#L122)); "Forgot password?" ([components/Login.tsx:124](Frontend-React/src/components/Login.tsx#L124)); "Signing In..." ([components/Login.tsx:136](Frontend-React/src/components/Login.tsx#L136)); "Sign In" ([components/Login.tsx:140](Frontend-React/src/components/Login.tsx#L140)); "Don't have an account?" ([components/Login.tsx:149](Frontend-React/src/components/Login.tsx#L149)); "Sign up for free" ([components/Login.tsx:154](Frontend-React/src/components/Login.tsx#L154)); "Test Credentials:" ([components/Login.tsx:162](Frontend-React/src/components/Login.tsx#L162)); "Admin:" ([components/Login.tsx:164](Frontend-React/src/components/Login.tsx#L164)); "aya@gmail.com / AY7114_AY" ([components/Login.tsx:164](Frontend-React/src/components/Login.tsx#L164)); "Job Seeker:" ([components/Login.tsx:165](Frontend-React/src/components/Login.tsx#L165)); "ayya@gmail.com / AY7114_AY" ([components/Login.tsx:165](Frontend-React/src/components/Login.tsx#L165)); "Recruiter:" ([components/Login.tsx:166](Frontend-React/src/components/Login.tsx#L166)); "ayyya@gmail.com / AY7114_AY" ([components/Login.tsx:166](Frontend-React/src/components/Login.tsx#L166)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - `email` / `setEmail` at [components/Login.tsx:12](Frontend-React/src/components/Login.tsx#L12), initial value `''`. Re-renders are triggered at [components/Login.tsx:75](Frontend-React/src/components/Login.tsx#L75) with `e.target.value`.
   - `password` / `setPassword` at [components/Login.tsx:13](Frontend-React/src/components/Login.tsx#L13), initial value `''`. Re-renders are triggered at [components/Login.tsx:101](Frontend-React/src/components/Login.tsx#L101) with `e.target.value`.
   - `errors` / `setErrors` at [components/Login.tsx:14](Frontend-React/src/components/Login.tsx#L14), initial value `{}`. Re-renders are triggered at [components/Login.tsx:25](Frontend-React/src/components/Login.tsx#L25) with `{ email: emailError || undefined, password: passwordError || undefined, }`; [components/Login.tsx:33](Frontend-React/src/components/Login.tsx#L33) with `{}`; [components/Login.tsx:41](Frontend-React/src/components/Login.tsx#L41) with `{ general: error instanceof Error ? error.message : 'Login failed. Please check your credentials.' }`; [components/Login.tsx:76](Frontend-React/src/components/Login.tsx#L76) with `{ ...errors, email: undefined }`; [components/Login.tsx:102](Frontend-React/src/components/Login.tsx#L102) with `{ ...errors, password: undefined }`.
   - `isLoading` / `setIsLoading` at [components/Login.tsx:15](Frontend-React/src/components/Login.tsx#L15), initial value `false`. Re-renders are triggered at [components/Login.tsx:34](Frontend-React/src/components/Login.tsx#L34) with `true`; [components/Login.tsx:40](Frontend-React/src/components/Login.tsx#L40) with `false`.
6. **Conditional rendering / auth / roles:**
   - [components/Login.tsx:24](Frontend-React/src/components/Login.tsx#L24): `emailError || passwordError`.
   - [components/Login.tsx:59](Frontend-React/src/components/Login.tsx#L59): `errors.general`.
   - [components/Login.tsx:76](Frontend-React/src/components/Login.tsx#L76): `errors.email`.
   - [components/Login.tsx:85](Frontend-React/src/components/Login.tsx#L85): `errors.email`.
   - [components/Login.tsx:102](Frontend-React/src/components/Login.tsx#L102): `errors.password`.
   - [components/Login.tsx:111](Frontend-React/src/components/Login.tsx#L111): `errors.password`.
   - [components/Login.tsx:134](Frontend-React/src/components/Login.tsx#L134): `isLoading`.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/Navigation.tsx`

1. **File:** `Navigation.tsx` at `Frontend-React/src/components/Navigation.tsx`
2. **Renders:** Responsive, auth-aware, role-aware global navigation.
   - Exports: `Navigation`.
3. **Visible UI elements:**
   - `<button>` at [components/Navigation.tsx:72](Frontend-React/src/components/Navigation.tsx#L72): label/text **AI Skill Mentor**; onClick=`() => handleNavigation('home')`. **onClick:** `() => handleNavigation('home')` at [components/Navigation.tsx:72](Frontend-React/src/components/Navigation.tsx#L72).
   - `<button>` at [components/Navigation.tsx:87](Frontend-React/src/components/Navigation.tsx#L87): label/text **{item.page} {item.label}**; onClick=`() => handleNavigation(item.page)`. **onClick:** `() => handleNavigation(item.page)` at [components/Navigation.tsx:87](Frontend-React/src/components/Navigation.tsx#L87).
   - `<button>` at [components/Navigation.tsx:100](Frontend-React/src/components/Navigation.tsx#L100): label/text **{onToggleSidebar} History**; onClick=`onToggleSidebar`. **onClick:** `onToggleSidebar` at [components/Navigation.tsx:100](Frontend-React/src/components/Navigation.tsx#L100).
   - `<button>` at [components/Navigation.tsx:111](Frontend-React/src/components/Navigation.tsx#L111): label/text **Sign In**; onClick=`() => handleNavigation('login')`. **onClick:** `() => handleNavigation('login')` at [components/Navigation.tsx:111](Frontend-React/src/components/Navigation.tsx#L111).
   - `<button>` at [components/Navigation.tsx:117](Frontend-React/src/components/Navigation.tsx#L117): label/text **Sign Up**; onClick=`() => handleNavigation('signup')`. **onClick:** `() => handleNavigation('signup')` at [components/Navigation.tsx:117](Frontend-React/src/components/Navigation.tsx#L117).
   - `<button>` at [components/Navigation.tsx:126](Frontend-React/src/components/Navigation.tsx#L126): label/text **{user.name}**; onClick=`() => setShowUserMenu(!showUserMenu)`. **onClick:** `() => setShowUserMenu(!showUserMenu)` at [components/Navigation.tsx:126](Frontend-React/src/components/Navigation.tsx#L126).
   - `<button>` at [components/Navigation.tsx:144](Frontend-React/src/components/Navigation.tsx#L144): label/text **My Profile**; onClick=`() => handleNavigation('profile')`. **onClick:** `() => handleNavigation('profile')` at [components/Navigation.tsx:144](Frontend-React/src/components/Navigation.tsx#L144).
   - `<button>` at [components/Navigation.tsx:151](Frontend-React/src/components/Navigation.tsx#L151): label/text **Saved Jobs**; onClick=`() => handleNavigation('saved-jobs')`. **onClick:** `() => handleNavigation('saved-jobs')` at [components/Navigation.tsx:151](Frontend-React/src/components/Navigation.tsx#L151).
   - `<button>` at [components/Navigation.tsx:162](Frontend-React/src/components/Navigation.tsx#L162): label/text **Company Profile**; onClick=`() => handleNavigation('recruiter-profile')`. **onClick:** `() => handleNavigation('recruiter-profile')` at [components/Navigation.tsx:162](Frontend-React/src/components/Navigation.tsx#L162).
   - `<button>` at [components/Navigation.tsx:172](Frontend-React/src/components/Navigation.tsx#L172): label/text **Admin Dashboard**; onClick=`() => handleNavigation('admin')`. **onClick:** `() => handleNavigation('admin')` at [components/Navigation.tsx:172](Frontend-React/src/components/Navigation.tsx#L172).
   - `<button>` at [components/Navigation.tsx:182](Frontend-React/src/components/Navigation.tsx#L182): label/text **{handleLogout} Logout**; onClick=`handleLogout`. **onClick:** `handleLogout` at [components/Navigation.tsx:182](Frontend-React/src/components/Navigation.tsx#L182).
   - `<button>` at [components/Navigation.tsx:197](Frontend-React/src/components/Navigation.tsx#L197): label/text **{isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}**; onClick=`() => setIsOpen(!isOpen)`. **onClick:** `() => setIsOpen(!isOpen)` at [components/Navigation.tsx:197](Frontend-React/src/components/Navigation.tsx#L197).
   - `<button>` at [components/Navigation.tsx:212](Frontend-React/src/components/Navigation.tsx#L212): label/text **{item.page} {item.label}**; onClick=`() => handleNavigation(item.page)`. **onClick:** `() => handleNavigation(item.page)` at [components/Navigation.tsx:212](Frontend-React/src/components/Navigation.tsx#L212).
   - `<button>` at [components/Navigation.tsx:224](Frontend-React/src/components/Navigation.tsx#L224): label/text **History**; onClick=`() => { onToggleSidebar(); setIsOpen(false); }`. **onClick:** `() => { onToggleSidebar(); setIsOpen(false); }` at [components/Navigation.tsx:224](Frontend-React/src/components/Navigation.tsx#L224).
   - `<button>` at [components/Navigation.tsx:237](Frontend-React/src/components/Navigation.tsx#L237): label/text **Sign In**; onClick=`() => handleNavigation('login')`. **onClick:** `() => handleNavigation('login')` at [components/Navigation.tsx:237](Frontend-React/src/components/Navigation.tsx#L237).
   - `<button>` at [components/Navigation.tsx:243](Frontend-React/src/components/Navigation.tsx#L243): label/text **Sign Up**; onClick=`() => handleNavigation('signup')`. **onClick:** `() => handleNavigation('signup')` at [components/Navigation.tsx:243](Frontend-React/src/components/Navigation.tsx#L243).
   - `<button>` at [components/Navigation.tsx:260](Frontend-React/src/components/Navigation.tsx#L260): label/text **My Profile**; onClick=`() => handleNavigation('profile')`. **onClick:** `() => handleNavigation('profile')` at [components/Navigation.tsx:260](Frontend-React/src/components/Navigation.tsx#L260).
   - `<button>` at [components/Navigation.tsx:266](Frontend-React/src/components/Navigation.tsx#L266): label/text **Saved Jobs**; onClick=`() => handleNavigation('saved-jobs')`. **onClick:** `() => handleNavigation('saved-jobs')` at [components/Navigation.tsx:266](Frontend-React/src/components/Navigation.tsx#L266).
   - `<button>` at [components/Navigation.tsx:276](Frontend-React/src/components/Navigation.tsx#L276): label/text **Company Profile**; onClick=`() => handleNavigation('recruiter-profile')`. **onClick:** `() => handleNavigation('recruiter-profile')` at [components/Navigation.tsx:276](Frontend-React/src/components/Navigation.tsx#L276).
   - `<button>` at [components/Navigation.tsx:285](Frontend-React/src/components/Navigation.tsx#L285): label/text **Admin Dashboard**; onClick=`() => handleNavigation('admin')`. **onClick:** `() => handleNavigation('admin')` at [components/Navigation.tsx:285](Frontend-React/src/components/Navigation.tsx#L285).
   - `<button>` at [components/Navigation.tsx:293](Frontend-React/src/components/Navigation.tsx#L293): label/text **{handleLogout} Logout**; onClick=`handleLogout`. **onClick:** `handleLogout` at [components/Navigation.tsx:293](Frontend-React/src/components/Navigation.tsx#L293).
   - Fixed visible text (17 literals): "AI Skill Mentor" ([components/Navigation.tsx:79](Frontend-React/src/components/Navigation.tsx#L79)); "History" ([components/Navigation.tsx:105](Frontend-React/src/components/Navigation.tsx#L105)); "Sign In" ([components/Navigation.tsx:114](Frontend-React/src/components/Navigation.tsx#L114)); "Sign Up" ([components/Navigation.tsx:120](Frontend-React/src/components/Navigation.tsx#L120)); "My Profile" ([components/Navigation.tsx:148](Frontend-React/src/components/Navigation.tsx#L148)); "Saved Jobs" ([components/Navigation.tsx:155](Frontend-React/src/components/Navigation.tsx#L155)); "Company Profile" ([components/Navigation.tsx:166](Frontend-React/src/components/Navigation.tsx#L166)); "Admin Dashboard" ([components/Navigation.tsx:176](Frontend-React/src/components/Navigation.tsx#L176)); "Logout" ([components/Navigation.tsx:186](Frontend-React/src/components/Navigation.tsx#L186)); "History" ([components/Navigation.tsx:230](Frontend-React/src/components/Navigation.tsx#L230)); "Sign In" ([components/Navigation.tsx:240](Frontend-React/src/components/Navigation.tsx#L240)); "Sign Up" ([components/Navigation.tsx:246](Frontend-React/src/components/Navigation.tsx#L246)); "My Profile" ([components/Navigation.tsx:263](Frontend-React/src/components/Navigation.tsx#L263)); "Saved Jobs" ([components/Navigation.tsx:269](Frontend-React/src/components/Navigation.tsx#L269)); "Company Profile" ([components/Navigation.tsx:279](Frontend-React/src/components/Navigation.tsx#L279)); "Admin Dashboard" ([components/Navigation.tsx:288](Frontend-React/src/components/Navigation.tsx#L288)); "Logout" ([components/Navigation.tsx:296](Frontend-React/src/components/Navigation.tsx#L296)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - `isOpen` / `setIsOpen` at [components/Navigation.tsx:13](Frontend-React/src/components/Navigation.tsx#L13), initial value `false`. Re-renders are triggered at [components/Navigation.tsx:18](Frontend-React/src/components/Navigation.tsx#L18) with `false`; [components/Navigation.tsx:199](Frontend-React/src/components/Navigation.tsx#L199) with `!isOpen`; [components/Navigation.tsx:227](Frontend-React/src/components/Navigation.tsx#L227) with `false`.
   - `showUserMenu` / `setShowUserMenu` at [components/Navigation.tsx:14](Frontend-React/src/components/Navigation.tsx#L14), initial value `false`. Re-renders are triggered at [components/Navigation.tsx:19](Frontend-React/src/components/Navigation.tsx#L19) with `false`; [components/Navigation.tsx:127](Frontend-React/src/components/Navigation.tsx#L127) with `!showUserMenu`.
6. **Conditional rendering / auth / roles:**
   - [components/Navigation.tsx:29](Frontend-React/src/components/Navigation.tsx#L29): `!isAuthenticated || !user`.
   - [components/Navigation.tsx:99](Frontend-React/src/components/Navigation.tsx#L99): `isAuthenticated && hasRole('jobseeker') && onToggleSidebar`.
   - [components/Navigation.tsx:109](Frontend-React/src/components/Navigation.tsx#L109): `!isAuthenticated`.
   - [components/Navigation.tsx:134](Frontend-React/src/components/Navigation.tsx#L134): `showUserMenu`.
   - [components/Navigation.tsx:142](Frontend-React/src/components/Navigation.tsx#L142): `hasRole('jobseeker')`.
   - [components/Navigation.tsx:161](Frontend-React/src/components/Navigation.tsx#L161): `hasRole('recruiter')`.
   - [components/Navigation.tsx:171](Frontend-React/src/components/Navigation.tsx#L171): `hasRole('admin')`.
   - [components/Navigation.tsx:202](Frontend-React/src/components/Navigation.tsx#L202): `isOpen`.
   - [components/Navigation.tsx:208](Frontend-React/src/components/Navigation.tsx#L208): `isOpen`.
   - [components/Navigation.tsx:223](Frontend-React/src/components/Navigation.tsx#L223): `isAuthenticated && hasRole('jobseeker') && onToggleSidebar`.
   - [components/Navigation.tsx:235](Frontend-React/src/components/Navigation.tsx#L235): `!isAuthenticated`.
   - [components/Navigation.tsx:258](Frontend-React/src/components/Navigation.tsx#L258): `hasRole('jobseeker')`.
   - [components/Navigation.tsx:275](Frontend-React/src/components/Navigation.tsx#L275): `hasRole('recruiter')`.
   - [components/Navigation.tsx:284](Frontend-React/src/components/Navigation.tsx#L284): `hasRole('admin')`.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/RecruiterProfile.tsx`

1. **File:** `RecruiterProfile.tsx` at `Frontend-React/src/components/RecruiterProfile.tsx`
2. **Renders:** Recruiter dashboard for jobs, applicants, candidates, profile editing, and job management.
   - Exports: `RecruiterProfile`.
3. **Visible UI elements:**
   - `<button>` at [components/RecruiterProfile.tsx:225](Frontend-React/src/components/RecruiterProfile.tsx#L225): label/text **{handleEditProfile} Edit Profile**; onClick=`handleEditProfile`. **onClick:** `handleEditProfile` at [components/RecruiterProfile.tsx:225](Frontend-React/src/components/RecruiterProfile.tsx#L225).
   - `<button>` at [components/RecruiterProfile.tsx:249](Frontend-React/src/components/RecruiterProfile.tsx#L249): label/text **Post New Job**; onClick=`() => onNavigate('job-posting')`. **onClick:** `() => onNavigate('job-posting')` at [components/RecruiterProfile.tsx:249](Frontend-React/src/components/RecruiterProfile.tsx#L249).
   - `<button>` at [components/RecruiterProfile.tsx:270](Frontend-React/src/components/RecruiterProfile.tsx#L270): label/text **View All**; onClick=`() => onNavigate('jobs')`. **onClick:** `() => onNavigate('jobs')` at [components/RecruiterProfile.tsx:270](Frontend-React/src/components/RecruiterProfile.tsx#L270).
   - `<button>` at [components/RecruiterProfile.tsx:294](Frontend-React/src/components/RecruiterProfile.tsx#L294): label/text **View Applications**; onClick=`() => handleViewApplicants(job.id, job.title)`. **onClick:** `() => handleViewApplicants(job.id, job.title)` at [components/RecruiterProfile.tsx:294](Frontend-React/src/components/RecruiterProfile.tsx#L294).
   - `<button>` at [components/RecruiterProfile.tsx:300](Frontend-React/src/components/RecruiterProfile.tsx#L300): label/text **Manage Job**; onClick=`() => handleManageJob(job.id, job.title)`. **onClick:** `() => handleManageJob(job.id, job.title)` at [components/RecruiterProfile.tsx:300](Frontend-React/src/components/RecruiterProfile.tsx#L300).
   - `<button>` at [components/RecruiterProfile.tsx:345](Frontend-React/src/components/RecruiterProfile.tsx#L345): label/text **View Details**; onClick=`() => handleViewCandidate(candidate)`. **onClick:** `() => handleViewCandidate(candidate)` at [components/RecruiterProfile.tsx:345](Frontend-React/src/components/RecruiterProfile.tsx#L345).
   - `<button>` at [components/RecruiterProfile.tsx:352](Frontend-React/src/components/RecruiterProfile.tsx#L352): label/text **Contact**; onClick=`() => handleContactCandidate(candidate)`. **onClick:** `() => handleContactCandidate(candidate)` at [components/RecruiterProfile.tsx:352](Frontend-React/src/components/RecruiterProfile.tsx#L352).
   - `<button>` at [components/RecruiterProfile.tsx:374](Frontend-React/src/components/RecruiterProfile.tsx#L374): label/text **Post New Job**; onClick=`() => onNavigate('job-posting')`. **onClick:** `() => onNavigate('job-posting')` at [components/RecruiterProfile.tsx:374](Frontend-React/src/components/RecruiterProfile.tsx#L374).
   - `<button>` at [components/RecruiterProfile.tsx:381](Frontend-React/src/components/RecruiterProfile.tsx#L381): label/text **Manage Jobs**; onClick=`() => onNavigate('jobs')`. **onClick:** `() => onNavigate('jobs')` at [components/RecruiterProfile.tsx:381](Frontend-React/src/components/RecruiterProfile.tsx#L381).
   - `<button>` at [components/RecruiterProfile.tsx:387](Frontend-React/src/components/RecruiterProfile.tsx#L387): label/text **{handleSearchCandidates} Search Candidates**; onClick=`handleSearchCandidates`. **onClick:** `handleSearchCandidates` at [components/RecruiterProfile.tsx:387](Frontend-React/src/components/RecruiterProfile.tsx#L387).
   - `<button>` at [components/RecruiterProfile.tsx:405](Frontend-React/src/components/RecruiterProfile.tsx#L405): label/text **(no fixed label)**; onClick=`() => setShowEditModal(false)`. **onClick:** `() => setShowEditModal(false)` at [components/RecruiterProfile.tsx:405](Frontend-React/src/components/RecruiterProfile.tsx#L405).
   - `<input>` at [components/RecruiterProfile.tsx:412](Frontend-React/src/components/RecruiterProfile.tsx#L412): label/text **{editedProfile.name}**; type=`text`; value=`editedProfile.name`; onChange=`(e) => setEditedProfile({ ...editedProfile, name: e.target.value })`.
   - `<textarea>` at [components/RecruiterProfile.tsx:421](Frontend-React/src/components/RecruiterProfile.tsx#L421): label/text **{editedProfile.description}**; value=`editedProfile.description`; onChange=`(e) => setEditedProfile({ ...editedProfile, description: e.target.value })`.
   - `<input>` at [components/RecruiterProfile.tsx:430](Frontend-React/src/components/RecruiterProfile.tsx#L430): label/text **{editedProfile.email}**; type=`email`; value=`editedProfile.email`; onChange=`(e) => setEditedProfile({ ...editedProfile, email: e.target.value })`.
   - `<input>` at [components/RecruiterProfile.tsx:439](Frontend-React/src/components/RecruiterProfile.tsx#L439): label/text **{editedProfile.phone}**; type=`tel`; value=`editedProfile.phone`; onChange=`(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })`.
   - `<input>` at [components/RecruiterProfile.tsx:448](Frontend-React/src/components/RecruiterProfile.tsx#L448): label/text **{editedProfile.location}**; type=`text`; value=`editedProfile.location`; onChange=`(e) => setEditedProfile({ ...editedProfile, location: e.target.value })`.
   - `<button>` at [components/RecruiterProfile.tsx:457](Frontend-React/src/components/RecruiterProfile.tsx#L457): label/text **Cancel**; onClick=`() => setShowEditModal(false)`. **onClick:** `() => setShowEditModal(false)` at [components/RecruiterProfile.tsx:457](Frontend-React/src/components/RecruiterProfile.tsx#L457).
   - `<button>` at [components/RecruiterProfile.tsx:463](Frontend-React/src/components/RecruiterProfile.tsx#L463): label/text **{handleSaveProfile} {isSaving} {isSaving ? ( <> <div className="w-5 h-5 border-2 border-white border-t-transp...} Saving... Save Changes**; disabled=`isSaving`; onClick=`handleSaveProfile`. **onClick:** `handleSaveProfile` at [components/RecruiterProfile.tsx:463](Frontend-React/src/components/RecruiterProfile.tsx#L463).
   - `<button>` at [components/RecruiterProfile.tsx:491](Frontend-React/src/components/RecruiterProfile.tsx#L491): label/text **(no fixed label)**; onClick=`() => setShowViewApplicationsModal(false)`. **onClick:** `() => setShowViewApplicationsModal(false)` at [components/RecruiterProfile.tsx:491](Frontend-React/src/components/RecruiterProfile.tsx#L491).
   - `<button>` at [components/RecruiterProfile.tsx:520](Frontend-React/src/components/RecruiterProfile.tsx#L520): label/text **Contact Candidate**; onClick=`() => window.location.href = \`mailto:${applicant.email}\``. **onClick:** `() => window.location.href = \`mailto:${applicant.email}\`` at [components/RecruiterProfile.tsx:520](Frontend-React/src/components/RecruiterProfile.tsx#L520).
   - `<button>` at [components/RecruiterProfile.tsx:541](Frontend-React/src/components/RecruiterProfile.tsx#L541): label/text **(no fixed label)**; onClick=`() => setShowCandidateModal(false)`. **onClick:** `() => setShowCandidateModal(false)` at [components/RecruiterProfile.tsx:541](Frontend-React/src/components/RecruiterProfile.tsx#L541).
   - `<button>` at [components/RecruiterProfile.tsx:579](Frontend-React/src/components/RecruiterProfile.tsx#L579): label/text **Contact Candidate**; onClick=`() => handleContactCandidate(selectedCandidate)`. **onClick:** `() => handleContactCandidate(selectedCandidate)` at [components/RecruiterProfile.tsx:579](Frontend-React/src/components/RecruiterProfile.tsx#L579).
   - `<button>` at [components/RecruiterProfile.tsx:597](Frontend-React/src/components/RecruiterProfile.tsx#L597): label/text **(no fixed label)**; onClick=`() => setShowSearchModal(false)`. **onClick:** `() => setShowSearchModal(false)` at [components/RecruiterProfile.tsx:597](Frontend-React/src/components/RecruiterProfile.tsx#L597).
   - `<input>` at [components/RecruiterProfile.tsx:604](Frontend-React/src/components/RecruiterProfile.tsx#L604): label/text **(no fixed label)**; type=`text`; placeholder=`e.g. React, Python, AWS`.
   - `<select>` at [components/RecruiterProfile.tsx:612](Frontend-React/src/components/RecruiterProfile.tsx#L612): label/text **Any 0-2 years 3-5 years 5+ years**.
   - `<input>` at [components/RecruiterProfile.tsx:621](Frontend-React/src/components/RecruiterProfile.tsx#L621): label/text **(no fixed label)**; type=`text`; placeholder=`e.g. San Francisco, CA`.
   - `<button>` at [components/RecruiterProfile.tsx:629](Frontend-React/src/components/RecruiterProfile.tsx#L629): label/text **Cancel**; onClick=`() => setShowSearchModal(false)`. **onClick:** `() => setShowSearchModal(false)` at [components/RecruiterProfile.tsx:629](Frontend-React/src/components/RecruiterProfile.tsx#L629).
   - `<button>` at [components/RecruiterProfile.tsx:635](Frontend-React/src/components/RecruiterProfile.tsx#L635): label/text **Search**.
   - `<button>` at [components/RecruiterProfile.tsx:652](Frontend-React/src/components/RecruiterProfile.tsx#L652): label/text **(no fixed label)**; onClick=`() => setShowManageJobModal(false)`. **onClick:** `() => setShowManageJobModal(false)` at [components/RecruiterProfile.tsx:652](Frontend-React/src/components/RecruiterProfile.tsx#L652).
   - `<button>` at [components/RecruiterProfile.tsx:657](Frontend-React/src/components/RecruiterProfile.tsx#L657): label/text **{handleDeleteJob} Delete Job Post**; onClick=`handleDeleteJob`. **onClick:** `handleDeleteJob` at [components/RecruiterProfile.tsx:657](Frontend-React/src/components/RecruiterProfile.tsx#L657).
   - Fixed visible text (53 literals): "Loading recruiter dashboard..." ([components/RecruiterProfile.tsx:187](Frontend-React/src/components/RecruiterProfile.tsx#L187)); "Error" ([components/RecruiterProfile.tsx:205](Frontend-React/src/components/RecruiterProfile.tsx#L205)); "Edit Profile" ([components/RecruiterProfile.tsx:229](Frontend-React/src/components/RecruiterProfile.tsx#L229)); "Post New Job" ([components/RecruiterProfile.tsx:253](Frontend-React/src/components/RecruiterProfile.tsx#L253)); "Active Job Listings" ([components/RecruiterProfile.tsx:267](Frontend-React/src/components/RecruiterProfile.tsx#L267)); "View All" ([components/RecruiterProfile.tsx:273](Frontend-React/src/components/RecruiterProfile.tsx#L273)); "No active job postings found. Click "Post New Job" to list one." ([components/RecruiterProfile.tsx:279](Frontend-React/src/components/RecruiterProfile.tsx#L279)); "Posted on" ([components/RecruiterProfile.tsx:291](Frontend-React/src/components/RecruiterProfile.tsx#L291)); "View Applications" ([components/RecruiterProfile.tsx:297](Frontend-React/src/components/RecruiterProfile.tsx#L297)); "Manage Job" ([components/RecruiterProfile.tsx:303](Frontend-React/src/components/RecruiterProfile.tsx#L303)); "Top Matching Candidates" ([components/RecruiterProfile.tsx:316](Frontend-React/src/components/RecruiterProfile.tsx#L316)); "No candidates matched yet. Candidates will appear here once matching runs." ([components/RecruiterProfile.tsx:321](Frontend-React/src/components/RecruiterProfile.tsx#L321)); "Readiness:" ([components/RecruiterProfile.tsx:340](Frontend-React/src/components/RecruiterProfile.tsx#L340)); "View Details" ([components/RecruiterProfile.tsx:349](Frontend-React/src/components/RecruiterProfile.tsx#L349)); "Contact" ([components/RecruiterProfile.tsx:356](Frontend-React/src/components/RecruiterProfile.tsx#L356)); "Quick Actions" ([components/RecruiterProfile.tsx:371](Frontend-React/src/components/RecruiterProfile.tsx#L371)); "Post New Job" ([components/RecruiterProfile.tsx:378](Frontend-React/src/components/RecruiterProfile.tsx#L378)); "Manage Jobs" ([components/RecruiterProfile.tsx:384](Frontend-React/src/components/RecruiterProfile.tsx#L384)); "Search Candidates" ([components/RecruiterProfile.tsx:391](Frontend-React/src/components/RecruiterProfile.tsx#L391)); "Edit Company Profile" ([components/RecruiterProfile.tsx:404](Frontend-React/src/components/RecruiterProfile.tsx#L404)); "Company Name" ([components/RecruiterProfile.tsx:411](Frontend-React/src/components/RecruiterProfile.tsx#L411)); "Description" ([components/RecruiterProfile.tsx:420](Frontend-React/src/components/RecruiterProfile.tsx#L420)); "Contact Email" ([components/RecruiterProfile.tsx:429](Frontend-React/src/components/RecruiterProfile.tsx#L429)); "Phone Number" ([components/RecruiterProfile.tsx:438](Frontend-React/src/components/RecruiterProfile.tsx#L438)); "Location" ([components/RecruiterProfile.tsx:447](Frontend-React/src/components/RecruiterProfile.tsx#L447)); "Cancel" ([components/RecruiterProfile.tsx:460](Frontend-React/src/components/RecruiterProfile.tsx#L460)); "Saving..." ([components/RecruiterProfile.tsx:470](Frontend-React/src/components/RecruiterProfile.tsx#L470)); "Save Changes" ([components/RecruiterProfile.tsx:475](Frontend-React/src/components/RecruiterProfile.tsx#L475)); "Applications for:" ([components/RecruiterProfile.tsx:490](Frontend-React/src/components/RecruiterProfile.tsx#L490)); "Loading applicants..." ([components/RecruiterProfile.tsx:498](Frontend-React/src/components/RecruiterProfile.tsx#L498)); "No applicants matching this job posting yet." ([components/RecruiterProfile.tsx:501](Frontend-React/src/components/RecruiterProfile.tsx#L501)); "Match Score" ([components/RecruiterProfile.tsx:519](Frontend-React/src/components/RecruiterProfile.tsx#L519)); "Contact Candidate" ([components/RecruiterProfile.tsx:523](Frontend-React/src/components/RecruiterProfile.tsx#L523)); "'s Profile" ([components/RecruiterProfile.tsx:540](Frontend-React/src/components/RecruiterProfile.tsx#L540)); "Contact Information" ([components/RecruiterProfile.tsx:547](Frontend-React/src/components/RecruiterProfile.tsx#L547)); "Skills" ([components/RecruiterProfile.tsx:551](Frontend-React/src/components/RecruiterProfile.tsx#L551)); "Experience" ([components/RecruiterProfile.tsx:561](Frontend-React/src/components/RecruiterProfile.tsx#L561)); "Education" ([components/RecruiterProfile.tsx:565](Frontend-React/src/components/RecruiterProfile.tsx#L565)); "Match Score" ([components/RecruiterProfile.tsx:571](Frontend-React/src/components/RecruiterProfile.tsx#L571)); "Readiness Score" ([components/RecruiterProfile.tsx:575](Frontend-React/src/components/RecruiterProfile.tsx#L575)); "Contact Candidate" ([components/RecruiterProfile.tsx:582](Frontend-React/src/components/RecruiterProfile.tsx#L582)); "Search Candidates" ([components/RecruiterProfile.tsx:596](Frontend-React/src/components/RecruiterProfile.tsx#L596)); "Skills" ([components/RecruiterProfile.tsx:603](Frontend-React/src/components/RecruiterProfile.tsx#L603)); "Years of Experience" ([components/RecruiterProfile.tsx:611](Frontend-React/src/components/RecruiterProfile.tsx#L611)); "Any" ([components/RecruiterProfile.tsx:613](Frontend-React/src/components/RecruiterProfile.tsx#L613)); "0-2 years" ([components/RecruiterProfile.tsx:614](Frontend-React/src/components/RecruiterProfile.tsx#L614)); "3-5 years" ([components/RecruiterProfile.tsx:615](Frontend-React/src/components/RecruiterProfile.tsx#L615)); "5+ years" ([components/RecruiterProfile.tsx:616](Frontend-React/src/components/RecruiterProfile.tsx#L616)); "Location" ([components/RecruiterProfile.tsx:620](Frontend-React/src/components/RecruiterProfile.tsx#L620)); "Cancel" ([components/RecruiterProfile.tsx:632](Frontend-React/src/components/RecruiterProfile.tsx#L632)); "Search" ([components/RecruiterProfile.tsx:638](Frontend-React/src/components/RecruiterProfile.tsx#L638)); "Manage Job:" ([components/RecruiterProfile.tsx:651](Frontend-React/src/components/RecruiterProfile.tsx#L651)); "Delete Job Post" ([components/RecruiterProfile.tsx:660](Frontend-React/src/components/RecruiterProfile.tsx#L660)).
4. **API calls:**
   - [components/RecruiterProfile.tsx:57](Frontend-React/src/components/RecruiterProfile.tsx#L57): `jobsAPI.getAllJobs({}; token)` from `../api/jobs.api`. Response is assigned to `jobsRes`; subsequent state updates in the same handler: `setActiveJobs(mappedJobs) @ L66`, `setTopCandidates(cands.slice(0, 3).map((c: any) => ({ name: c.name, email: c.email || \`${c.name.toLowerCase().repl...) @ L73`, `setError(err.message || 'Failed to fetch recruiter dashboard data') @ L89`, `setIsLoading(false) @ L91`.
   - [components/RecruiterProfile.tsx:71](Frontend-React/src/components/RecruiterProfile.tsx#L71): `jobsAPI.getJobApplicants(mappedJobs[0].id; token)` from `../api/jobs.api`. Response is assigned to `appRes`; subsequent state updates in the same handler: `setTopCandidates(cands.slice(0, 3).map((c: any) => ({ name: c.name, email: c.email || \`${c.name.toLowerCase().repl...) @ L73`, `setError(err.message || 'Failed to fetch recruiter dashboard data') @ L89`, `setIsLoading(false) @ L91`.
   - [components/RecruiterProfile.tsx:128](Frontend-React/src/components/RecruiterProfile.tsx#L128): `jobsAPI.getJobApplicants(jobId; token)` from `../api/jobs.api`. Response is assigned to `appRes`; subsequent state updates in the same handler: `setApplicants(mappedApps) @ L139`, `setIsApplicantsLoading(false) @ L144`.
   - [components/RecruiterProfile.tsx:158](Frontend-React/src/components/RecruiterProfile.tsx#L158): `jobsAPI.deleteJob(selectedJobId)` from `../api/jobs.api`. Response is awaited/returned without a named assignment; subsequent state updates in the same handler: `setShowManageJobModal(false) @ L159`, `setSuccessMessage('Job deleted successfully!') @ L161`, `setShowSuccess(true) @ L162`, `setShowSuccess(false) @ L163`.
5. **State and re-render triggers:**
   - `companyProfile` / `setCompanyProfile` at [components/RecruiterProfile.tsx:18](Frontend-React/src/components/RecruiterProfile.tsx#L18), initial value `{ name: 'TechCorp Inc.', description: 'Leading Technology Company', email: 'hr@techcorp.com', phone: '+1 (555) 123-4567', location: 'San Francisco, CA' }`. Re-renders are triggered at [components/RecruiterProfile.tsx:107](Frontend-React/src/components/RecruiterProfile.tsx#L107) with `editedProfile`.
   - `showEditModal` / `setShowEditModal` at [components/RecruiterProfile.tsx:26](Frontend-React/src/components/RecruiterProfile.tsx#L26), initial value `false`. Re-renders are triggered at [components/RecruiterProfile.tsx:101](Frontend-React/src/components/RecruiterProfile.tsx#L101) with `true`; [components/RecruiterProfile.tsx:109](Frontend-React/src/components/RecruiterProfile.tsx#L109) with `false`; [components/RecruiterProfile.tsx:405](Frontend-React/src/components/RecruiterProfile.tsx#L405) with `false`; [components/RecruiterProfile.tsx:458](Frontend-React/src/components/RecruiterProfile.tsx#L458) with `false`.
   - `editedProfile` / `setEditedProfile` at [components/RecruiterProfile.tsx:27](Frontend-React/src/components/RecruiterProfile.tsx#L27), initial value `companyProfile`. Re-renders are triggered at [components/RecruiterProfile.tsx:100](Frontend-React/src/components/RecruiterProfile.tsx#L100) with `companyProfile`; [components/RecruiterProfile.tsx:415](Frontend-React/src/components/RecruiterProfile.tsx#L415) with `{ ...editedProfile, name: e.target.value }`; [components/RecruiterProfile.tsx:423](Frontend-React/src/components/RecruiterProfile.tsx#L423) with `{ ...editedProfile, description: e.target.value }`; [components/RecruiterProfile.tsx:433](Frontend-React/src/components/RecruiterProfile.tsx#L433) with `{ ...editedProfile, email: e.target.value }`; [components/RecruiterProfile.tsx:442](Frontend-React/src/components/RecruiterProfile.tsx#L442) with `{ ...editedProfile, phone: e.target.value }`; [components/RecruiterProfile.tsx:451](Frontend-React/src/components/RecruiterProfile.tsx#L451) with `{ ...editedProfile, location: e.target.value }`.
   - `isSaving` / `setIsSaving` at [components/RecruiterProfile.tsx:28](Frontend-React/src/components/RecruiterProfile.tsx#L28), initial value `false`. Re-renders are triggered at [components/RecruiterProfile.tsx:105](Frontend-React/src/components/RecruiterProfile.tsx#L105) with `true`; [components/RecruiterProfile.tsx:108](Frontend-React/src/components/RecruiterProfile.tsx#L108) with `false`.
   - `showSuccess` / `setShowSuccess` at [components/RecruiterProfile.tsx:29](Frontend-React/src/components/RecruiterProfile.tsx#L29), initial value `false`. Re-renders are triggered at [components/RecruiterProfile.tsx:111](Frontend-React/src/components/RecruiterProfile.tsx#L111) with `true`; [components/RecruiterProfile.tsx:112](Frontend-React/src/components/RecruiterProfile.tsx#L112) with `false`; [components/RecruiterProfile.tsx:162](Frontend-React/src/components/RecruiterProfile.tsx#L162) with `true`; [components/RecruiterProfile.tsx:163](Frontend-React/src/components/RecruiterProfile.tsx#L163) with `false`.
   - `successMessage` / `setSuccessMessage` at [components/RecruiterProfile.tsx:30](Frontend-React/src/components/RecruiterProfile.tsx#L30), initial value `''`. Re-renders are triggered at [components/RecruiterProfile.tsx:110](Frontend-React/src/components/RecruiterProfile.tsx#L110) with `'Company profile updated successfully!'`; [components/RecruiterProfile.tsx:161](Frontend-React/src/components/RecruiterProfile.tsx#L161) with `'Job deleted successfully!'`.
   - `showSearchModal` / `setShowSearchModal` at [components/RecruiterProfile.tsx:32](Frontend-React/src/components/RecruiterProfile.tsx#L32), initial value `false`. Re-renders are triggered at [components/RecruiterProfile.tsx:180](Frontend-React/src/components/RecruiterProfile.tsx#L180) with `true`; [components/RecruiterProfile.tsx:597](Frontend-React/src/components/RecruiterProfile.tsx#L597) with `false`; [components/RecruiterProfile.tsx:630](Frontend-React/src/components/RecruiterProfile.tsx#L630) with `false`.
   - `showViewApplicationsModal` / `setShowViewApplicationsModal` at [components/RecruiterProfile.tsx:33](Frontend-React/src/components/RecruiterProfile.tsx#L33), initial value `false`. Re-renders are triggered at [components/RecruiterProfile.tsx:119](Frontend-React/src/components/RecruiterProfile.tsx#L119) with `true`; [components/RecruiterProfile.tsx:491](Frontend-React/src/components/RecruiterProfile.tsx#L491) with `false`.
   - `selectedJobTitle` / `setSelectedJobTitle` at [components/RecruiterProfile.tsx:34](Frontend-React/src/components/RecruiterProfile.tsx#L34), initial value `''`. Re-renders are triggered at [components/RecruiterProfile.tsx:117](Frontend-React/src/components/RecruiterProfile.tsx#L117) with `jobTitle`; [components/RecruiterProfile.tsx:150](Frontend-React/src/components/RecruiterProfile.tsx#L150) with `jobTitle`.
   - `selectedJobId` / `setSelectedJobId` at [components/RecruiterProfile.tsx:35](Frontend-React/src/components/RecruiterProfile.tsx#L35), initial value `''`. Re-renders are triggered at [components/RecruiterProfile.tsx:118](Frontend-React/src/components/RecruiterProfile.tsx#L118) with `jobId`; [components/RecruiterProfile.tsx:149](Frontend-React/src/components/RecruiterProfile.tsx#L149) with `jobId`.
   - `showManageJobModal` / `setShowManageJobModal` at [components/RecruiterProfile.tsx:36](Frontend-React/src/components/RecruiterProfile.tsx#L36), initial value `false`. Re-renders are triggered at [components/RecruiterProfile.tsx:151](Frontend-React/src/components/RecruiterProfile.tsx#L151) with `true`; [components/RecruiterProfile.tsx:159](Frontend-React/src/components/RecruiterProfile.tsx#L159) with `false`; [components/RecruiterProfile.tsx:652](Frontend-React/src/components/RecruiterProfile.tsx#L652) with `false`.
   - `showCandidateModal` / `setShowCandidateModal` at [components/RecruiterProfile.tsx:37](Frontend-React/src/components/RecruiterProfile.tsx#L37), initial value `false`. Re-renders are triggered at [components/RecruiterProfile.tsx:172](Frontend-React/src/components/RecruiterProfile.tsx#L172) with `true`; [components/RecruiterProfile.tsx:541](Frontend-React/src/components/RecruiterProfile.tsx#L541) with `false`.
   - `selectedCandidate` / `setSelectedCandidate` at [components/RecruiterProfile.tsx:38](Frontend-React/src/components/RecruiterProfile.tsx#L38), initial value `null`. Re-renders are triggered at [components/RecruiterProfile.tsx:171](Frontend-React/src/components/RecruiterProfile.tsx#L171) with `candidate`.
   - `activeJobs` / `setActiveJobs` at [components/RecruiterProfile.tsx:40](Frontend-React/src/components/RecruiterProfile.tsx#L40), initial value `[]`. Re-renders are triggered at [components/RecruiterProfile.tsx:66](Frontend-React/src/components/RecruiterProfile.tsx#L66) with `mappedJobs`.
   - `topCandidates` / `setTopCandidates` at [components/RecruiterProfile.tsx:41](Frontend-React/src/components/RecruiterProfile.tsx#L41), initial value `[]`. Re-renders are triggered at [components/RecruiterProfile.tsx:73](Frontend-React/src/components/RecruiterProfile.tsx#L73) with `cands.slice(0, 3).map((c: any) => ({ name: c.name, email: c.email || \`${c.name.toLowerCase().replace(' ', '.')}@email.com\`, match: c.scor...`.
   - `applicants` / `setApplicants` at [components/RecruiterProfile.tsx:42](Frontend-React/src/components/RecruiterProfile.tsx#L42), initial value `[]`. Re-renders are triggered at [components/RecruiterProfile.tsx:139](Frontend-React/src/components/RecruiterProfile.tsx#L139) with `mappedApps`.
   - `isLoading` / `setIsLoading` at [components/RecruiterProfile.tsx:43](Frontend-React/src/components/RecruiterProfile.tsx#L43), initial value `true`. Re-renders are triggered at [components/RecruiterProfile.tsx:48](Frontend-React/src/components/RecruiterProfile.tsx#L48) with `true`; [components/RecruiterProfile.tsx:91](Frontend-React/src/components/RecruiterProfile.tsx#L91) with `false`.
   - `isApplicantsLoading` / `setIsApplicantsLoading` at [components/RecruiterProfile.tsx:44](Frontend-React/src/components/RecruiterProfile.tsx#L44), initial value `false`. Re-renders are triggered at [components/RecruiterProfile.tsx:120](Frontend-React/src/components/RecruiterProfile.tsx#L120) with `true`; [components/RecruiterProfile.tsx:144](Frontend-React/src/components/RecruiterProfile.tsx#L144) with `false`.
   - `error` / `setError` at [components/RecruiterProfile.tsx:45](Frontend-React/src/components/RecruiterProfile.tsx#L45), initial value `null`. Re-renders are triggered at [components/RecruiterProfile.tsx:49](Frontend-React/src/components/RecruiterProfile.tsx#L49) with `null`; [components/RecruiterProfile.tsx:53](Frontend-React/src/components/RecruiterProfile.tsx#L53) with `'Session expired, please log in again'`; [components/RecruiterProfile.tsx:89](Frontend-React/src/components/RecruiterProfile.tsx#L89) with `err.message || 'Failed to fetch recruiter dashboard data'`.
   - Effect at [components/RecruiterProfile.tsx:95](Frontend-React/src/components/RecruiterProfile.tsx#L95) runs with dependencies `[]`; body starts `() => { fetchJobsData(); }`.
6. **Conditional rendering / auth / roles:**
   - [components/RecruiterProfile.tsx:52](Frontend-React/src/components/RecruiterProfile.tsx#L52): `!token`.
   - [components/RecruiterProfile.tsx:69](Frontend-React/src/components/RecruiterProfile.tsx#L69): `mappedJobs.length > 0`.
   - [components/RecruiterProfile.tsx:123](Frontend-React/src/components/RecruiterProfile.tsx#L123): `!token`.
   - [components/RecruiterProfile.tsx:183](Frontend-React/src/components/RecruiterProfile.tsx#L183): `isLoading`.
   - [components/RecruiterProfile.tsx:196](Frontend-React/src/components/RecruiterProfile.tsx#L196): `showSuccess`.
   - [components/RecruiterProfile.tsx:203](Frontend-React/src/components/RecruiterProfile.tsx#L203): `error`.
   - [components/RecruiterProfile.tsx:278](Frontend-React/src/components/RecruiterProfile.tsx#L278): `activeJobs.length === 0`.
   - [components/RecruiterProfile.tsx:320](Frontend-React/src/components/RecruiterProfile.tsx#L320): `topCandidates.length === 0`.
   - [components/RecruiterProfile.tsx:400](Frontend-React/src/components/RecruiterProfile.tsx#L400): `showEditModal`.
   - [components/RecruiterProfile.tsx:468](Frontend-React/src/components/RecruiterProfile.tsx#L468): `isSaving`.
   - [components/RecruiterProfile.tsx:486](Frontend-React/src/components/RecruiterProfile.tsx#L486): `showViewApplicationsModal`.
   - [components/RecruiterProfile.tsx:495](Frontend-React/src/components/RecruiterProfile.tsx#L495): `isApplicantsLoading`.
   - [components/RecruiterProfile.tsx:500](Frontend-React/src/components/RecruiterProfile.tsx#L500): `applicants.length === 0`.
   - [components/RecruiterProfile.tsx:536](Frontend-React/src/components/RecruiterProfile.tsx#L536): `showCandidateModal && selectedCandidate`.
   - [components/RecruiterProfile.tsx:592](Frontend-React/src/components/RecruiterProfile.tsx#L592): `showSearchModal`.
   - [components/RecruiterProfile.tsx:647](Frontend-React/src/components/RecruiterProfile.tsx#L647): `showManageJobModal`.
7. **Known errors / TODOs visible in code:**
   - [components/RecruiterProfile.tsx:49](Frontend-React/src/components/RecruiterProfile.tsx#L49): `setError(null);`.
   - [components/RecruiterProfile.tsx:53](Frontend-React/src/components/RecruiterProfile.tsx#L53): `setError('Session expired, please log in again');`.
   - [components/RecruiterProfile.tsx:83](Frontend-React/src/components/RecruiterProfile.tsx#L83): `console.error(err);`.
   - [components/RecruiterProfile.tsx:88](Frontend-React/src/components/RecruiterProfile.tsx#L88): `console.error(err);`.
   - [components/RecruiterProfile.tsx:89](Frontend-React/src/components/RecruiterProfile.tsx#L89): `setError(err.message || 'Failed to fetch recruiter dashboard data');`.
   - [components/RecruiterProfile.tsx:124](Frontend-React/src/components/RecruiterProfile.tsx#L124): `alert('Session expired, please log in again');`.
   - [components/RecruiterProfile.tsx:141](Frontend-React/src/components/RecruiterProfile.tsx#L141): `console.error(err);`.
   - [components/RecruiterProfile.tsx:142](Frontend-React/src/components/RecruiterProfile.tsx#L142): `alert(err.message || 'Failed to fetch applicants');`.
   - [components/RecruiterProfile.tsx:165](Frontend-React/src/components/RecruiterProfile.tsx#L165): `console.error(err);`.
   - [components/RecruiterProfile.tsx:166](Frontend-React/src/components/RecruiterProfile.tsx#L166): `alert(err.message || 'Failed to delete job');`.

## `Frontend-React/src/components/SavedJobs.tsx`

1. **File:** `SavedJobs.tsx` at `Frontend-React/src/components/SavedJobs.tsx`
2. **Renders:** Saved-jobs list with view and remove actions.
   - Exports: `SavedJobs`.
3. **Visible UI elements:**
   - `<button>` at [components/SavedJobs.tsx:115](Frontend-React/src/components/SavedJobs.tsx#L115): label/text **Browse Jobs**; onClick=`() => onNavigate('jobs')`. **onClick:** `() => onNavigate('jobs')` at [components/SavedJobs.tsx:115](Frontend-React/src/components/SavedJobs.tsx#L115).
   - `<button>` at [components/SavedJobs.tsx:177](Frontend-React/src/components/SavedJobs.tsx#L177): label/text **View Details**; onClick=`() => handleViewDetails(job.id)`. **onClick:** `() => handleViewDetails(job.id)` at [components/SavedJobs.tsx:177](Frontend-React/src/components/SavedJobs.tsx#L177).
   - `<button>` at [components/SavedJobs.tsx:184](Frontend-React/src/components/SavedJobs.tsx#L184): label/text **{isRemoving === job.id ? ( <> <div className="w-4 h-4 border-2 border-red-600 ...} Removing... Remove**; disabled=`isRemoving === job.id`; onClick=`() => handleRemoveClick(job.id)`. **onClick:** `() => handleRemoveClick(job.id)` at [components/SavedJobs.tsx:184](Frontend-React/src/components/SavedJobs.tsx#L184).
   - `<button>` at [components/SavedJobs.tsx:209](Frontend-React/src/components/SavedJobs.tsx#L209): label/text **Browse More Jobs**; onClick=`() => onNavigate('jobs')`. **onClick:** `() => onNavigate('jobs')` at [components/SavedJobs.tsx:209](Frontend-React/src/components/SavedJobs.tsx#L209).
   - `<button>` at [components/SavedJobs.tsx:225](Frontend-React/src/components/SavedJobs.tsx#L225): label/text **{handleConfirmRemove} Remove**; onClick=`handleConfirmRemove`. **onClick:** `handleConfirmRemove` at [components/SavedJobs.tsx:225](Frontend-React/src/components/SavedJobs.tsx#L225).
   - `<button>` at [components/SavedJobs.tsx:231](Frontend-React/src/components/SavedJobs.tsx#L231): label/text **{handleCancelRemove} Cancel**; onClick=`handleCancelRemove`. **onClick:** `handleCancelRemove` at [components/SavedJobs.tsx:231](Frontend-React/src/components/SavedJobs.tsx#L231).
   - Fixed visible text (16 literals): "Saved Jobs" ([components/SavedJobs.tsx:97](Frontend-React/src/components/SavedJobs.tsx#L97)); "Jobs you've saved for later review" ([components/SavedJobs.tsx:100](Frontend-React/src/components/SavedJobs.tsx#L100)); "Job removed from saved list" ([components/SavedJobs.tsx:106](Frontend-React/src/components/SavedJobs.tsx#L106)); "No Saved Jobs" ([components/SavedJobs.tsx:113](Frontend-React/src/components/SavedJobs.tsx#L113)); "You haven't saved any jobs yet. Browse jobs and save the ones you're interested in." ([components/SavedJobs.tsx:114](Frontend-React/src/components/SavedJobs.tsx#L114)); "Browse Jobs" ([components/SavedJobs.tsx:118](Frontend-React/src/components/SavedJobs.tsx#L118)); "Match" ([components/SavedJobs.tsx:143](Frontend-React/src/components/SavedJobs.tsx#L143)); "Saved" ([components/SavedJobs.tsx:162](Frontend-React/src/components/SavedJobs.tsx#L162)); "View Details" ([components/SavedJobs.tsx:181](Frontend-React/src/components/SavedJobs.tsx#L181)); "Removing..." ([components/SavedJobs.tsx:191](Frontend-React/src/components/SavedJobs.tsx#L191)); "Remove" ([components/SavedJobs.tsx:196](Frontend-React/src/components/SavedJobs.tsx#L196)); "Browse More Jobs" ([components/SavedJobs.tsx:212](Frontend-React/src/components/SavedJobs.tsx#L212)); "Confirm Removal" ([components/SavedJobs.tsx:222](Frontend-React/src/components/SavedJobs.tsx#L222)); "Are you sure you want to remove this job from your saved list?" ([components/SavedJobs.tsx:223](Frontend-React/src/components/SavedJobs.tsx#L223)); "Remove" ([components/SavedJobs.tsx:228](Frontend-React/src/components/SavedJobs.tsx#L228)); "Cancel" ([components/SavedJobs.tsx:234](Frontend-React/src/components/SavedJobs.tsx#L234)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - `savedJobs` / `setSavedJobs` at [components/SavedJobs.tsx:21](Frontend-React/src/components/SavedJobs.tsx#L21), initial value `[ { id: '1', title: 'Senior Software Engineer', company: 'TechCorp', location: 'San Francisco, CA', type: 'Full-time', salary: '$120k - $180k', savedDate: '2025-01-15', matchSco...`. Re-renders are triggered at [components/SavedJobs.tsx:76](Frontend-React/src/components/SavedJobs.tsx#L76) with `savedJobs.filter(job => job.id !== jobToRemove)`.
   - `isRemoving` / `setIsRemoving` at [components/SavedJobs.tsx:57](Frontend-React/src/components/SavedJobs.tsx#L57), initial value `null`. Re-renders are triggered at [components/SavedJobs.tsx:70](Frontend-React/src/components/SavedJobs.tsx#L70) with `jobToRemove`; [components/SavedJobs.tsx:77](Frontend-React/src/components/SavedJobs.tsx#L77) with `null`.
   - `showSuccess` / `setShowSuccess` at [components/SavedJobs.tsx:58](Frontend-React/src/components/SavedJobs.tsx#L58), initial value `false`. Re-renders are triggered at [components/SavedJobs.tsx:79](Frontend-React/src/components/SavedJobs.tsx#L79) with `true`; [components/SavedJobs.tsx:80](Frontend-React/src/components/SavedJobs.tsx#L80) with `false`.
   - `showConfirmDialog` / `setShowConfirmDialog` at [components/SavedJobs.tsx:59](Frontend-React/src/components/SavedJobs.tsx#L59), initial value `false`. Re-renders are triggered at [components/SavedJobs.tsx:64](Frontend-React/src/components/SavedJobs.tsx#L64) with `true`; [components/SavedJobs.tsx:71](Frontend-React/src/components/SavedJobs.tsx#L71) with `false`; [components/SavedJobs.tsx:85](Frontend-React/src/components/SavedJobs.tsx#L85) with `false`.
   - `jobToRemove` / `setJobToRemove` at [components/SavedJobs.tsx:60](Frontend-React/src/components/SavedJobs.tsx#L60), initial value `null`. Re-renders are triggered at [components/SavedJobs.tsx:63](Frontend-React/src/components/SavedJobs.tsx#L63) with `jobId`; [components/SavedJobs.tsx:78](Frontend-React/src/components/SavedJobs.tsx#L78) with `null`; [components/SavedJobs.tsx:86](Frontend-React/src/components/SavedJobs.tsx#L86) with `null`.
6. **Conditional rendering / auth / roles:**
   - [components/SavedJobs.tsx:103](Frontend-React/src/components/SavedJobs.tsx#L103): `showSuccess`.
   - [components/SavedJobs.tsx:110](Frontend-React/src/components/SavedJobs.tsx#L110): `savedJobs.length === 0`.
   - [components/SavedJobs.tsx:189](Frontend-React/src/components/SavedJobs.tsx#L189): `isRemoving === job.id`.
   - [components/SavedJobs.tsx:207](Frontend-React/src/components/SavedJobs.tsx#L207): `savedJobs.length > 0`.
   - [components/SavedJobs.tsx:218](Frontend-React/src/components/SavedJobs.tsx#L218): `showConfirmDialog`.
7. **Known errors / TODOs visible in code:**
   - [components/SavedJobs.tsx:74](Frontend-React/src/components/SavedJobs.tsx#L74): `// In production: await usersAPI.removeSavedJob(userId, jobId, token);`.

## `Frontend-React/src/components/SignUp.tsx`

1. **File:** `SignUp.tsx` at `Frontend-React/src/components/SignUp.tsx`
2. **Renders:** Account registration form with job-seeker/recruiter role selection.
   - Exports: `SignUp`.
3. **Visible UI elements:**
   - `<form>` at [components/SignUp.tsx:76](Frontend-React/src/components/SignUp.tsx#L76): label/text **{handleSubmit} Full Name {formData.name} {errors.name} Email Address {formData.email} {errors.email} Password {formData.password} {errors.password ? ( <div className="mt-1 flex items-center gap-1 text-red-600...} {errors**; onSubmit=`handleSubmit`. **onSubmit:** `handleSubmit` at [components/SignUp.tsx:76](Frontend-React/src/components/SignUp.tsx#L76).
   - `<input>` at [components/SignUp.tsx:81](Frontend-React/src/components/SignUp.tsx#L81): label/text **{formData.name}**; type=`text`; placeholder=`John Doe`; value=`formData.name`; onChange=`(e) => { setFormData({ ...formData, name: e.target.value }); if (errors.name) setErrors({ ...errors, name: undefined }); }`.
   - `<input>` at [components/SignUp.tsx:107](Frontend-React/src/components/SignUp.tsx#L107): label/text **{formData.email}**; type=`email`; placeholder=`you@example.com`; value=`formData.email`; onChange=`(e) => { setFormData({ ...formData, email: e.target.value }); if (errors.email) setErrors({ ...errors, email: undefined }); }`.
   - `<input>` at [components/SignUp.tsx:133](Frontend-React/src/components/SignUp.tsx#L133): label/text **{formData.password}**; type=`password`; placeholder=`Create a strong password`; value=`formData.password`; onChange=`(e) => { setFormData({ ...formData, password: e.target.value }); if (errors.password) setErrors({ ...errors, password: undefined }); }`.
   - `<select>` at [components/SignUp.tsx:163](Frontend-React/src/components/SignUp.tsx#L163): label/text **{formData.role} Job Seeker Recruiter**; value=`formData.role`; onChange=`(e) => setFormData({ ...formData, role: e.target.value as 'jobseeker' | 'recruiter' })`.
   - `<input>` at [components/SignUp.tsx:178](Frontend-React/src/components/SignUp.tsx#L178): label/text **{agreedToTerms}**; type=`checkbox`; checked=`agreedToTerms`; onChange=`(e) => setAgreedToTerms(e.target.checked)`.
   - `<button>` at [components/SignUp.tsx:190](Frontend-React/src/components/SignUp.tsx#L190): label/text **{isLoading} {isLoading ? ( <> <div className="w-5 h-5 border-2 border-white border-t-trans...} Creating Account... Create Account**; type=`submit`; disabled=`isLoading`.
   - `<button>` at [components/SignUp.tsx:212](Frontend-React/src/components/SignUp.tsx#L212): label/text **Sign in**; onClick=`() => onNavigate('login')`. **onClick:** `() => onNavigate('login')` at [components/SignUp.tsx:212](Frontend-React/src/components/SignUp.tsx#L212).
   - Fixed visible text (18 literals): "Create Your Account" ([components/SignUp.tsx:69](Frontend-React/src/components/SignUp.tsx#L69)); "Join thousands advancing their careers with AI" ([components/SignUp.tsx:72](Frontend-React/src/components/SignUp.tsx#L72)); "Full Name" ([components/SignUp.tsx:78](Frontend-React/src/components/SignUp.tsx#L78)); "Email Address" ([components/SignUp.tsx:104](Frontend-React/src/components/SignUp.tsx#L104)); "Password" ([components/SignUp.tsx:130](Frontend-React/src/components/SignUp.tsx#L130)); "Must be at least 8 characters with uppercase, lowercase, and number" ([components/SignUp.tsx:153](Frontend-React/src/components/SignUp.tsx#L153)); "I am a..." ([components/SignUp.tsx:160](Frontend-React/src/components/SignUp.tsx#L160)); "Job Seeker" ([components/SignUp.tsx:168](Frontend-React/src/components/SignUp.tsx#L168)); "Recruiter" ([components/SignUp.tsx:169](Frontend-React/src/components/SignUp.tsx#L169)); "Job seekers get analytics and course recommendations. Recruiters can post jobs." ([components/SignUp.tsx:172](Frontend-React/src/components/SignUp.tsx#L172)); "I agree to the Terms of Service and Privacy Policy" ([components/SignUp.tsx:185](Frontend-React/src/components/SignUp.tsx#L185)); "Creating Account..." ([components/SignUp.tsx:197](Frontend-React/src/components/SignUp.tsx#L197)); "Create Account" ([components/SignUp.tsx:201](Frontend-React/src/components/SignUp.tsx#L201)); "Already have an account?" ([components/SignUp.tsx:210](Frontend-React/src/components/SignUp.tsx#L210)); "Sign in" ([components/SignUp.tsx:215](Frontend-React/src/components/SignUp.tsx#L215)); "🎉 This platform is" ([components/SignUp.tsx:222](Frontend-React/src/components/SignUp.tsx#L222)); "completely free" ([components/SignUp.tsx:223](Frontend-React/src/components/SignUp.tsx#L223)); "- no subscription or payment required!" ([components/SignUp.tsx:223](Frontend-React/src/components/SignUp.tsx#L223)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - `formData` / `setFormData` at [components/SignUp.tsx:12](Frontend-React/src/components/SignUp.tsx#L12), initial value `{ name: '', email: '', password: '', role: 'jobseeker' as 'jobseeker' | 'recruiter', }`. Re-renders are triggered at [components/SignUp.tsx:85](Frontend-React/src/components/SignUp.tsx#L85) with `{ ...formData, name: e.target.value }`; [components/SignUp.tsx:111](Frontend-React/src/components/SignUp.tsx#L111) with `{ ...formData, email: e.target.value }`; [components/SignUp.tsx:137](Frontend-React/src/components/SignUp.tsx#L137) with `{ ...formData, password: e.target.value }`; [components/SignUp.tsx:165](Frontend-React/src/components/SignUp.tsx#L165) with `{ ...formData, role: e.target.value as 'jobseeker' | 'recruiter' }`.
   - `errors` / `setErrors` at [components/SignUp.tsx:18](Frontend-React/src/components/SignUp.tsx#L18), initial value `{}`. Re-renders are triggered at [components/SignUp.tsx:36](Frontend-React/src/components/SignUp.tsx#L36) with `{ name: nameError || undefined, email: emailError || undefined, password: passwordError || undefined, }`; [components/SignUp.tsx:45](Frontend-React/src/components/SignUp.tsx#L45) with `{ general: 'Please agree to the Terms of Service and Privacy Policy to continue.' }`; [components/SignUp.tsx:50](Frontend-React/src/components/SignUp.tsx#L50) with `{}`; [components/SignUp.tsx:58](Frontend-React/src/components/SignUp.tsx#L58) with `{ general: error instanceof Error ? error.message : 'Sign up failed. Please try again.' }`; [components/SignUp.tsx:86](Frontend-React/src/components/SignUp.tsx#L86) with `{ ...errors, name: undefined }`; [components/SignUp.tsx:112](Frontend-React/src/components/SignUp.tsx#L112) with `{ ...errors, email: undefined }`; [components/SignUp.tsx:138](Frontend-React/src/components/SignUp.tsx#L138) with `{ ...errors, password: undefined }`.
   - `agreedToTerms` / `setAgreedToTerms` at [components/SignUp.tsx:24](Frontend-React/src/components/SignUp.tsx#L24), initial value `false`. Re-renders are triggered at [components/SignUp.tsx:181](Frontend-React/src/components/SignUp.tsx#L181) with `e.target.checked`.
   - `isLoading` / `setIsLoading` at [components/SignUp.tsx:25](Frontend-React/src/components/SignUp.tsx#L25), initial value `false`. Re-renders are triggered at [components/SignUp.tsx:51](Frontend-React/src/components/SignUp.tsx#L51) with `true`; [components/SignUp.tsx:57](Frontend-React/src/components/SignUp.tsx#L57) with `false`.
6. **Conditional rendering / auth / roles:**
   - [components/SignUp.tsx:35](Frontend-React/src/components/SignUp.tsx#L35): `nameError || emailError || passwordError`.
   - [components/SignUp.tsx:86](Frontend-React/src/components/SignUp.tsx#L86): `errors.name`.
   - [components/SignUp.tsx:95](Frontend-React/src/components/SignUp.tsx#L95): `errors.name`.
   - [components/SignUp.tsx:112](Frontend-React/src/components/SignUp.tsx#L112): `errors.email`.
   - [components/SignUp.tsx:121](Frontend-React/src/components/SignUp.tsx#L121): `errors.email`.
   - [components/SignUp.tsx:138](Frontend-React/src/components/SignUp.tsx#L138): `errors.password`.
   - [components/SignUp.tsx:147](Frontend-React/src/components/SignUp.tsx#L147): `errors.password`.
   - [components/SignUp.tsx:195](Frontend-React/src/components/SignUp.tsx#L195): `isLoading`.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/SkillAnalysis.tsx`

1. **File:** `SkillAnalysis.tsx` at `Frontend-React/src/components/SkillAnalysis.tsx`
2. **Renders:** Resume upload and target-role analysis page with readiness, gaps, and course results.
   - Exports: `SkillAnalysis`.
3. **Visible UI elements:**
   - `<input>` at [components/SkillAnalysis.tsx:142](Frontend-React/src/components/SkillAnalysis.tsx#L142): label/text **{handleFileChange}**; type=`file`; onChange=`handleFileChange`.
   - `<input>` at [components/SkillAnalysis.tsx:186](Frontend-React/src/components/SkillAnalysis.tsx#L186): label/text **{jobTitle}**; type=`text`; placeholder=`e.g. Data Scientist, Frontend Developer, DevOps Engineer`; value=`jobTitle`; onChange=`(e) => setJobTitle(e.target.value)`.
   - `<button>` at [components/SkillAnalysis.tsx:204](Frontend-React/src/components/SkillAnalysis.tsx#L204): label/text **{handleAnalyze} {isAnalyzing ? ( <> <div className="w-5 h-5 border-2 border-white border-t-tra...} Analyzing... Analyze Resume**; disabled=`!file || !jobTitle || isAnalyzing`; onClick=`handleAnalyze`. **onClick:** `handleAnalyze` at [components/SkillAnalysis.tsx:204](Frontend-React/src/components/SkillAnalysis.tsx#L204).
   - `<button>` at [components/SkillAnalysis.tsx:385](Frontend-React/src/components/SkillAnalysis.tsx#L385): label/text **View Course Details**; onClick=`() => onNavigate('courses')`. **onClick:** `() => onNavigate('courses')` at [components/SkillAnalysis.tsx:385](Frontend-React/src/components/SkillAnalysis.tsx#L385).
   - `<button>` at [components/SkillAnalysis.tsx:402](Frontend-React/src/components/SkillAnalysis.tsx#L402): label/text **Create Learning Path**; onClick=`() => onNavigate('learning-path')`. **onClick:** `() => onNavigate('learning-path')` at [components/SkillAnalysis.tsx:402](Frontend-React/src/components/SkillAnalysis.tsx#L402).
   - Fixed visible text (34 literals): "Analyze Your Career Readiness" ([components/SkillAnalysis.tsx:116](Frontend-React/src/components/SkillAnalysis.tsx#L116)); "Upload your resume and select your target job to receive AI-powered insights" ([components/SkillAnalysis.tsx:119](Frontend-React/src/components/SkillAnalysis.tsx#L119)); "Analysis Error" ([components/SkillAnalysis.tsx:126](Frontend-React/src/components/SkillAnalysis.tsx#L126)); "Upload Your Resume" ([components/SkillAnalysis.tsx:138](Frontend-React/src/components/SkillAnalysis.tsx#L138)); "Click to change file" ([components/SkillAnalysis.tsx:154](Frontend-React/src/components/SkillAnalysis.tsx#L154)); "Drop your resume here or click to browse" ([components/SkillAnalysis.tsx:158](Frontend-React/src/components/SkillAnalysis.tsx#L158)); "Supports PDF, DOC, DOCX" ([components/SkillAnalysis.tsx:159](Frontend-React/src/components/SkillAnalysis.tsx#L159)); "Resume uploaded successfully" ([components/SkillAnalysis.tsx:169](Frontend-React/src/components/SkillAnalysis.tsx#L169)); "Select Target Job" ([components/SkillAnalysis.tsx:181](Frontend-React/src/components/SkillAnalysis.tsx#L181)); "Choose your desired job role" ([components/SkillAnalysis.tsx:185](Frontend-React/src/components/SkillAnalysis.tsx#L185)); "Target role:" ([components/SkillAnalysis.tsx:199](Frontend-React/src/components/SkillAnalysis.tsx#L199)); "Analyzing..." ([components/SkillAnalysis.tsx:211](Frontend-React/src/components/SkillAnalysis.tsx#L211)); "Analyze Resume" ([components/SkillAnalysis.tsx:215](Frontend-React/src/components/SkillAnalysis.tsx#L215)); "Career Readiness Score" ([components/SkillAnalysis.tsx:233](Frontend-React/src/components/SkillAnalysis.tsx#L233)); "Ready" ([components/SkillAnalysis.tsx:271](Frontend-React/src/components/SkillAnalysis.tsx#L271)); "Overall Assessment" ([components/SkillAnalysis.tsx:278](Frontend-React/src/components/SkillAnalysis.tsx#L278)); "You're" ([components/SkillAnalysis.tsx:279](Frontend-React/src/components/SkillAnalysis.tsx#L279)); "for the" ([components/SkillAnalysis.tsx:280](Frontend-React/src/components/SkillAnalysis.tsx#L280)); "role. With focused learning in key areas, you can significantly improve your chances." ([components/SkillAnalysis.tsx:280](Frontend-React/src/components/SkillAnalysis.tsx#L280)); "Matching Skills" ([components/SkillAnalysis.tsx:288](Frontend-React/src/components/SkillAnalysis.tsx#L288)); "Skill Gaps" ([components/SkillAnalysis.tsx:292](Frontend-React/src/components/SkillAnalysis.tsx#L292)); "Weeks to Target" ([components/SkillAnalysis.tsx:296](Frontend-React/src/components/SkillAnalysis.tsx#L296)); "Identified Skill Gaps" ([components/SkillAnalysis.tsx:310](Frontend-React/src/components/SkillAnalysis.tsx#L310)); "Current:" ([components/SkillAnalysis.tsx:318](Frontend-React/src/components/SkillAnalysis.tsx#L318)); "% | Required:" ([components/SkillAnalysis.tsx:319](Frontend-React/src/components/SkillAnalysis.tsx#L319)); "Gap:" ([components/SkillAnalysis.tsx:337](Frontend-React/src/components/SkillAnalysis.tsx#L337)); "Recommended Courses" ([components/SkillAnalysis.tsx:352](Frontend-React/src/components/SkillAnalysis.tsx#L352)); "Platform:" ([components/SkillAnalysis.tsx:373](Frontend-React/src/components/SkillAnalysis.tsx#L373)); "Duration:" ([components/SkillAnalysis.tsx:377](Frontend-React/src/components/SkillAnalysis.tsx#L377)); "Level:" ([components/SkillAnalysis.tsx:381](Frontend-React/src/components/SkillAnalysis.tsx#L381)); "View Course Details" ([components/SkillAnalysis.tsx:385](Frontend-React/src/components/SkillAnalysis.tsx#L385)); "Potential Impact" ([components/SkillAnalysis.tsx:398](Frontend-React/src/components/SkillAnalysis.tsx#L398)); "Completing all recommended courses could increase your readiness score significantly, boosting your employability." ([components/SkillAnalysis.tsx:399](Frontend-React/src/components/SkillAnalysis.tsx#L399)); "Create Learning Path" ([components/SkillAnalysis.tsx:402](Frontend-React/src/components/SkillAnalysis.tsx#L402)).
4. **API calls:**
   - [components/SkillAnalysis.tsx:60](Frontend-React/src/components/SkillAnalysis.tsx#L60): `resumeAPI.analyzeResume(file; jobTitle; token)` from `../api/resume.api`. Response is assigned to `uploadRes`; subsequent state updates in the same handler: `setReadinessScore(0) @ L89`, `setSkillGaps([]) @ L90`, `setRecommendedCourses([]) @ L91`, `setMatchingSkillsCount(extractedSkills.length) @ L92`, `setSkillGapsCount(0) @ L93`, `setWeeksToTarget(0) @ L94`, `setIsAnalyzing(false) @ L96`, `setAnalysisComplete(true) @ L97`, `setError(err.message || 'An error occurred during analysis.') @ L101`, `setIsAnalyzing(false) @ L102`.
   - [components/SkillAnalysis.tsx:72](Frontend-React/src/components/SkillAnalysis.tsx#L72): `resumeAPI.getAnalysisById(resId; token)` from `../api/resume.api`. Response is assigned to `analysisData`; subsequent state updates in the same handler: `setReadinessScore(0) @ L89`, `setSkillGaps([]) @ L90`, `setRecommendedCourses([]) @ L91`, `setMatchingSkillsCount(extractedSkills.length) @ L92`, `setSkillGapsCount(0) @ L93`, `setWeeksToTarget(0) @ L94`, `setIsAnalyzing(false) @ L96`, `setAnalysisComplete(true) @ L97`, `setError(err.message || 'An error occurred during analysis.') @ L101`, `setIsAnalyzing(false) @ L102`.
5. **State and re-render triggers:**
   - `file` / `setFile` at [components/SkillAnalysis.tsx:25](Frontend-React/src/components/SkillAnalysis.tsx#L25), initial value `null`. Re-renders are triggered at [components/SkillAnalysis.tsx:39](Frontend-React/src/components/SkillAnalysis.tsx#L39) with `e.target.files[0]`.
   - `jobTitle` / `setJobTitle` at [components/SkillAnalysis.tsx:26](Frontend-React/src/components/SkillAnalysis.tsx#L26), initial value `''`. Re-renders are triggered at [components/SkillAnalysis.tsx:190](Frontend-React/src/components/SkillAnalysis.tsx#L190) with `e.target.value`.
   - `isAnalyzing` / `setIsAnalyzing` at [components/SkillAnalysis.tsx:27](Frontend-React/src/components/SkillAnalysis.tsx#L27), initial value `false`. Re-renders are triggered at [components/SkillAnalysis.tsx:46](Frontend-React/src/components/SkillAnalysis.tsx#L46) with `true`; [components/SkillAnalysis.tsx:54](Frontend-React/src/components/SkillAnalysis.tsx#L54) with `false`; [components/SkillAnalysis.tsx:96](Frontend-React/src/components/SkillAnalysis.tsx#L96) with `false`; [components/SkillAnalysis.tsx:102](Frontend-React/src/components/SkillAnalysis.tsx#L102) with `false`.
   - `analysisComplete` / `setAnalysisComplete` at [components/SkillAnalysis.tsx:28](Frontend-React/src/components/SkillAnalysis.tsx#L28), initial value `false`. Re-renders are triggered at [components/SkillAnalysis.tsx:47](Frontend-React/src/components/SkillAnalysis.tsx#L47) with `false`; [components/SkillAnalysis.tsx:97](Frontend-React/src/components/SkillAnalysis.tsx#L97) with `true`.
   - `readinessScore` / `setReadinessScore` at [components/SkillAnalysis.tsx:29](Frontend-React/src/components/SkillAnalysis.tsx#L29), initial value `0`. Re-renders are triggered at [components/SkillAnalysis.tsx:89](Frontend-React/src/components/SkillAnalysis.tsx#L89) with `0`.
   - `skillGaps` / `setSkillGaps` at [components/SkillAnalysis.tsx:30](Frontend-React/src/components/SkillAnalysis.tsx#L30), initial value `[]`. Re-renders are triggered at [components/SkillAnalysis.tsx:90](Frontend-React/src/components/SkillAnalysis.tsx#L90) with `[]`.
   - `recommendedCourses` / `setRecommendedCourses` at [components/SkillAnalysis.tsx:31](Frontend-React/src/components/SkillAnalysis.tsx#L31), initial value `[]`. Re-renders are triggered at [components/SkillAnalysis.tsx:91](Frontend-React/src/components/SkillAnalysis.tsx#L91) with `[]`.
   - `error` / `setError` at [components/SkillAnalysis.tsx:32](Frontend-React/src/components/SkillAnalysis.tsx#L32), initial value `null`. Re-renders are triggered at [components/SkillAnalysis.tsx:48](Frontend-React/src/components/SkillAnalysis.tsx#L48) with `null`; [components/SkillAnalysis.tsx:53](Frontend-React/src/components/SkillAnalysis.tsx#L53) with `"Session expired, please log in again"`; [components/SkillAnalysis.tsx:101](Frontend-React/src/components/SkillAnalysis.tsx#L101) with `err.message || 'An error occurred during analysis.'`.
   - `matchingSkillsCount` / `setMatchingSkillsCount` at [components/SkillAnalysis.tsx:33](Frontend-React/src/components/SkillAnalysis.tsx#L33), initial value `0`. Re-renders are triggered at [components/SkillAnalysis.tsx:92](Frontend-React/src/components/SkillAnalysis.tsx#L92) with `extractedSkills.length`.
   - `skillGapsCount` / `setSkillGapsCount` at [components/SkillAnalysis.tsx:34](Frontend-React/src/components/SkillAnalysis.tsx#L34), initial value `0`. Re-renders are triggered at [components/SkillAnalysis.tsx:93](Frontend-React/src/components/SkillAnalysis.tsx#L93) with `0`.
   - `weeksToTarget` / `setWeeksToTarget` at [components/SkillAnalysis.tsx:35](Frontend-React/src/components/SkillAnalysis.tsx#L35), initial value `12`. Re-renders are triggered at [components/SkillAnalysis.tsx:94](Frontend-React/src/components/SkillAnalysis.tsx#L94) with `0`.
6. **Conditional rendering / auth / roles:**
   - [components/SkillAnalysis.tsx:38](Frontend-React/src/components/SkillAnalysis.tsx#L38): `e.target.files && e.target.files[0]`.
   - [components/SkillAnalysis.tsx:44](Frontend-React/src/components/SkillAnalysis.tsx#L44): `!file || !jobTitle`.
   - [components/SkillAnalysis.tsx:52](Frontend-React/src/components/SkillAnalysis.tsx#L52): `!token`.
   - [components/SkillAnalysis.tsx:75](Frontend-React/src/components/SkillAnalysis.tsx#L75): `status === "failed"`.
   - [components/SkillAnalysis.tsx:80](Frontend-React/src/components/SkillAnalysis.tsx#L80): `status !== "analyzed"`.
   - [components/SkillAnalysis.tsx:103](Frontend-React/src/components/SkillAnalysis.tsx#L103): `err.status === 401`.
   - [components/SkillAnalysis.tsx:124](Frontend-React/src/components/SkillAnalysis.tsx#L124): `error`.
   - [components/SkillAnalysis.tsx:151](Frontend-React/src/components/SkillAnalysis.tsx#L151): `file`.
   - [components/SkillAnalysis.tsx:165](Frontend-React/src/components/SkillAnalysis.tsx#L165): `file`.
   - [components/SkillAnalysis.tsx:195](Frontend-React/src/components/SkillAnalysis.tsx#L195): `jobTitle`.
   - [components/SkillAnalysis.tsx:209](Frontend-React/src/components/SkillAnalysis.tsx#L209): `isAnalyzing`.
   - [components/SkillAnalysis.tsx:225](Frontend-React/src/components/SkillAnalysis.tsx#L225): `isAnalyzing || analysisComplete`.
   - [components/SkillAnalysis.tsx:280](Frontend-React/src/components/SkillAnalysis.tsx#L280): `readinessScore >= 80`.
   - [components/SkillAnalysis.tsx:304](Frontend-React/src/components/SkillAnalysis.tsx#L304): `skillGaps.length > 0`.
   - [components/SkillAnalysis.tsx:346](Frontend-React/src/components/SkillAnalysis.tsx#L346): `recommendedCourses.length > 0`.
7. **Known errors / TODOs visible in code:**
   - [components/SkillAnalysis.tsx:48](Frontend-React/src/components/SkillAnalysis.tsx#L48): `setError(null);`.
   - [components/SkillAnalysis.tsx:53](Frontend-React/src/components/SkillAnalysis.tsx#L53): `setError("Session expired, please log in again");`.
   - [components/SkillAnalysis.tsx:62](Frontend-React/src/components/SkillAnalysis.tsx#L62): `if (!resId) throw new Error("Resume upload failed - no ID returned");`.
   - [components/SkillAnalysis.tsx:76](Frontend-React/src/components/SkillAnalysis.tsx#L76): `throw new Error("Resume analysis failed on the server.");`.
   - [components/SkillAnalysis.tsx:81](Frontend-React/src/components/SkillAnalysis.tsx#L81): `throw new Error("Resume analysis timed out.");`.
   - [components/SkillAnalysis.tsx:100](Frontend-React/src/components/SkillAnalysis.tsx#L100): `console.error(err);`.
   - [components/SkillAnalysis.tsx:101](Frontend-React/src/components/SkillAnalysis.tsx#L101): `setError(err.message || 'An error occurred during analysis.');`.

## `Frontend-React/src/components/ui/accordion.tsx`

1. **File:** `accordion.tsx` at `Frontend-React/src/components/ui/accordion.tsx`
2. **Renders:** Reusable UI primitive module exporting Accordion, AccordionItem, AccordionTrigger, AccordionContent; it does not render an application page by itself.
   - Exports: `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/alert-dialog.tsx`

1. **File:** `alert-dialog.tsx` at `Frontend-React/src/components/ui/alert-dialog.tsx`
2. **Renders:** Reusable UI primitive module exporting AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel; it does not render an application page by itself.
   - Exports: `AlertDialog`, `AlertDialogPortal`, `AlertDialogOverlay`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogFooter`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogAction`, `AlertDialogCancel`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/alert.tsx`

1. **File:** `alert.tsx` at `Frontend-React/src/components/ui/alert.tsx`
2. **Renders:** Reusable UI primitive module exporting Alert, AlertTitle, AlertDescription; it does not render an application page by itself.
   - Exports: `Alert`, `AlertTitle`, `AlertDescription`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/aspect-ratio.tsx`

1. **File:** `aspect-ratio.tsx` at `Frontend-React/src/components/ui/aspect-ratio.tsx`
2. **Renders:** Reusable UI primitive module exporting AspectRatio; it does not render an application page by itself.
   - Exports: `AspectRatio`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/avatar.tsx`

1. **File:** `avatar.tsx` at `Frontend-React/src/components/ui/avatar.tsx`
2. **Renders:** Reusable UI primitive module exporting Avatar, AvatarImage, AvatarFallback; it does not render an application page by itself.
   - Exports: `Avatar`, `AvatarImage`, `AvatarFallback`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/badge.tsx`

1. **File:** `badge.tsx` at `Frontend-React/src/components/ui/badge.tsx`
2. **Renders:** Reusable UI primitive module exporting Badge, badgeVariants; it does not render an application page by itself.
   - Exports: `Badge`, `badgeVariants`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/breadcrumb.tsx`

1. **File:** `breadcrumb.tsx` at `Frontend-React/src/components/ui/breadcrumb.tsx`
2. **Renders:** Reusable UI primitive module exporting Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator, BreadcrumbEllipsis; it does not render an application page by itself.
   - Exports: `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text (1 literals): "More" ([components/ui/breadcrumb.tsx:96](Frontend-React/src/components/ui/breadcrumb.tsx#L96)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/button.tsx`

1. **File:** `button.tsx` at `Frontend-React/src/components/ui/button.tsx`
2. **Renders:** Reusable UI primitive module exporting Button, buttonVariants; it does not render an application page by itself.
   - Exports: `Button`, `buttonVariants`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/calendar.tsx`

1. **File:** `calendar.tsx` at `Frontend-React/src/components/ui/calendar.tsx`
2. **Renders:** Reusable UI primitive module exporting Calendar; it does not render an application page by itself.
   - Exports: `Calendar`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/card.tsx`

1. **File:** `card.tsx` at `Frontend-React/src/components/ui/card.tsx`
2. **Renders:** Reusable UI primitive module exporting Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent; it does not render an application page by itself.
   - Exports: `Card`, `CardHeader`, `CardFooter`, `CardTitle`, `CardAction`, `CardDescription`, `CardContent`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/carousel.tsx`

1. **File:** `carousel.tsx` at `Frontend-React/src/components/ui/carousel.tsx`
2. **Renders:** Reusable UI primitive module exporting CarouselApi, Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext; it does not render an application page by itself.
   - Exports: `CarouselApi`, `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`.
3. **Visible UI elements:**
   - `<Button>` at [components/ui/carousel.tsx:183](Frontend-React/src/components/ui/carousel.tsx#L183): label/text **{variant} {size} {scrollPrev} Previous slide**; disabled=`!canScrollPrev`; onClick=`scrollPrev`. **onClick:** `scrollPrev` at [components/ui/carousel.tsx:183](Frontend-React/src/components/ui/carousel.tsx#L183).
   - `<Button>` at [components/ui/carousel.tsx:213](Frontend-React/src/components/ui/carousel.tsx#L213): label/text **{variant} {size} {scrollNext} Next slide**; disabled=`!canScrollNext`; onClick=`scrollNext`. **onClick:** `scrollNext` at [components/ui/carousel.tsx:213](Frontend-React/src/components/ui/carousel.tsx#L213).
   - Fixed visible text (2 literals): "Previous slide" ([components/ui/carousel.tsx:199](Frontend-React/src/components/ui/carousel.tsx#L199)); "Next slide" ([components/ui/carousel.tsx:229](Frontend-React/src/components/ui/carousel.tsx#L229)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - `canScrollPrev` / `setCanScrollPrev` at [components/ui/carousel.tsx:61](Frontend-React/src/components/ui/carousel.tsx#L61), initial value `false`. Re-renders are triggered at [components/ui/carousel.tsx:66](Frontend-React/src/components/ui/carousel.tsx#L66) with `api.canScrollPrev()`.
   - `canScrollNext` / `setCanScrollNext` at [components/ui/carousel.tsx:62](Frontend-React/src/components/ui/carousel.tsx#L62), initial value `false`. Re-renders are triggered at [components/ui/carousel.tsx:67](Frontend-React/src/components/ui/carousel.tsx#L67) with `api.canScrollNext()`.
   - Effect at [components/ui/carousel.tsx:91](Frontend-React/src/components/ui/carousel.tsx#L91) runs with dependencies `[api, setApi]`; body starts `() => { if (!api || !setApi) return; setApi(api); }`.
   - Effect at [components/ui/carousel.tsx:96](Frontend-React/src/components/ui/carousel.tsx#L96) runs with dependencies `[api, onSelect]`; body starts `() => { if (!api) return; onSelect(api); api.on("reInit", onSelect); api.on("select", onSelect); return () => { api?.off("select", onSelect); }; }`.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - [components/ui/carousel.tsx:39](Frontend-React/src/components/ui/carousel.tsx#L39): `throw new Error("useCarousel must be used within a <Carousel />");`.

## `Frontend-React/src/components/ui/chart.tsx`

1. **File:** `chart.tsx` at `Frontend-React/src/components/ui/chart.tsx`
2. **Renders:** Reusable UI primitive module exporting ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent, ChartStyle; it does not render an application page by itself.
   - Exports: `ChartConfig`, `ChartContainer`, `ChartTooltip`, `ChartTooltipContent`, `ChartLegend`, `ChartLegendContent`, `ChartStyle`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - [components/ui/chart.tsx:77](Frontend-React/src/components/ui/chart.tsx#L77): `!colorConfig.length`.
   - [components/ui/chart.tsx:132](Frontend-React/src/components/ui/chart.tsx#L132): `hideLabel || !payload?.length`.
   - [components/ui/chart.tsx:167](Frontend-React/src/components/ui/chart.tsx#L167): `!active || !payload?.length`.
   - [components/ui/chart.tsx:180](Frontend-React/src/components/ui/chart.tsx#L180): `!nestLabel`.
   - [components/ui/chart.tsx:195](Frontend-React/src/components/ui/chart.tsx#L195): `formatter && item?.value !== undefined && item.name`.
   - [components/ui/chart.tsx:199](Frontend-React/src/components/ui/chart.tsx#L199): `itemConfig?.icon`.
   - [components/ui/chart.tsx:202](Frontend-React/src/components/ui/chart.tsx#L202): `!hideIndicator`.
   - [components/ui/chart.tsx:230](Frontend-React/src/components/ui/chart.tsx#L230): `nestLabel`.
   - [components/ui/chart.tsx:235](Frontend-React/src/components/ui/chart.tsx#L235): `item.value`.
   - [components/ui/chart.tsx:266](Frontend-React/src/components/ui/chart.tsx#L266): `!payload?.length`.
   - [components/ui/chart.tsx:289](Frontend-React/src/components/ui/chart.tsx#L289): `itemConfig?.icon && !hideIcon`.
7. **Known errors / TODOs visible in code:**
   - [components/ui/chart.tsx:31](Frontend-React/src/components/ui/chart.tsx#L31): `throw new Error("useChart must be used within a <ChartContainer />");`.

## `Frontend-React/src/components/ui/checkbox.tsx`

1. **File:** `checkbox.tsx` at `Frontend-React/src/components/ui/checkbox.tsx`
2. **Renders:** Reusable UI primitive module exporting Checkbox; it does not render an application page by itself.
   - Exports: `Checkbox`.
3. **Visible UI elements:**
   - `<CheckboxPrimitive.Root>` at [components/ui/checkbox.tsx:14](Frontend-React/src/components/ui/checkbox.tsx#L14): label/text **(no fixed label)**.
   - `<CheckboxPrimitive.Indicator>` at [components/ui/checkbox.tsx:22](Frontend-React/src/components/ui/checkbox.tsx#L22): label/text **(no fixed label)**.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/collapsible.tsx`

1. **File:** `collapsible.tsx` at `Frontend-React/src/components/ui/collapsible.tsx`
2. **Renders:** Reusable UI primitive module exporting Collapsible, CollapsibleTrigger, CollapsibleContent; it does not render an application page by itself.
   - Exports: `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/command.tsx`

1. **File:** `command.tsx` at `Frontend-React/src/components/ui/command.tsx`
2. **Renders:** Reusable UI primitive module exporting Command, CommandDialog, CommandInput, CommandList, CommandEmpty, CommandGroup, CommandItem, CommandShortcut, CommandSeparator; it does not render an application page by itself.
   - Exports: `Command`, `CommandDialog`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandShortcut`, `CommandSeparator`.
3. **Visible UI elements:**
   - `<CommandPrimitive.Input>` at [components/ui/command.tsx:66](Frontend-React/src/components/ui/command.tsx#L66): label/text **(no fixed label)**.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/context-menu.tsx`

1. **File:** `context-menu.tsx` at `Frontend-React/src/components/ui/context-menu.tsx`
2. **Renders:** Reusable UI primitive module exporting ContextMenu, ContextMenuTrigger, ContextMenuContent, ContextMenuItem, ContextMenuCheckboxItem, ContextMenuRadioItem, ContextMenuLabel, ContextMenuSeparator, ContextMenuShortcut, ContextMenuGroup, ContextMenuPortal, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuRadioGroup; it does not render an application page by itself.
   - Exports: `ContextMenu`, `ContextMenuTrigger`, `ContextMenuContent`, `ContextMenuItem`, `ContextMenuCheckboxItem`, `ContextMenuRadioItem`, `ContextMenuLabel`, `ContextMenuSeparator`, `ContextMenuShortcut`, `ContextMenuGroup`, `ContextMenuPortal`, `ContextMenuSub`, `ContextMenuSubContent`, `ContextMenuSubTrigger`, `ContextMenuRadioGroup`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/dialog.tsx`

1. **File:** `dialog.tsx` at `Frontend-React/src/components/ui/dialog.tsx`
2. **Renders:** Reusable UI primitive module exporting Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger; it does not render an application page by itself.
   - Exports: `Dialog`, `DialogClose`, `DialogContent`, `DialogDescription`, `DialogFooter`, `DialogHeader`, `DialogOverlay`, `DialogPortal`, `DialogTitle`, `DialogTrigger`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text (1 literals): "Close" ([components/ui/dialog.tsx:68](Frontend-React/src/components/ui/dialog.tsx#L68)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/drawer.tsx`

1. **File:** `drawer.tsx` at `Frontend-React/src/components/ui/drawer.tsx`
2. **Renders:** Reusable UI primitive module exporting Drawer, DrawerPortal, DrawerOverlay, DrawerTrigger, DrawerClose, DrawerContent, DrawerHeader, DrawerFooter, DrawerTitle, DrawerDescription; it does not render an application page by itself.
   - Exports: `Drawer`, `DrawerPortal`, `DrawerOverlay`, `DrawerTrigger`, `DrawerClose`, `DrawerContent`, `DrawerHeader`, `DrawerFooter`, `DrawerTitle`, `DrawerDescription`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/dropdown-menu.tsx`

1. **File:** `dropdown-menu.tsx` at `Frontend-React/src/components/ui/dropdown-menu.tsx`
2. **Renders:** Reusable UI primitive module exporting DropdownMenu, DropdownMenuPortal, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubTrigger, DropdownMenuSubContent; it does not render an application page by itself.
   - Exports: `DropdownMenu`, `DropdownMenuPortal`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuGroup`, `DropdownMenuLabel`, `DropdownMenuItem`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSeparator`, `DropdownMenuShortcut`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/form.tsx`

1. **File:** `form.tsx` at `Frontend-React/src/components/ui/form.tsx`
2. **Renders:** Reusable UI primitive module exporting useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField; it does not render an application page by itself.
   - Exports: `useFormField`, `Form`, `FormItem`, `FormLabel`, `FormControl`, `FormDescription`, `FormMessage`, `FormField`.
3. **Visible UI elements:**
   - `<FormFieldContext.Provider>` at [components/ui/form.tsx:39](Frontend-React/src/components/ui/form.tsx#L39): label/text **(no fixed label)**; value=`{ name: props.name }`.
   - `<FormItemContext.Provider>` at [components/ui/form.tsx:80](Frontend-React/src/components/ui/form.tsx#L80): label/text **(no fixed label)**; value=`{ id }`.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - [components/ui/form.tsx:116](Frontend-React/src/components/ui/form.tsx#L116): `!error`.
7. **Known errors / TODOs visible in code:**
   - [components/ui/form.tsx:53](Frontend-React/src/components/ui/form.tsx#L53): `throw new Error("useFormField should be used within <FormField>");`.

## `Frontend-React/src/components/ui/hover-card.tsx`

1. **File:** `hover-card.tsx` at `Frontend-React/src/components/ui/hover-card.tsx`
2. **Renders:** Reusable UI primitive module exporting HoverCard, HoverCardTrigger, HoverCardContent; it does not render an application page by itself.
   - Exports: `HoverCard`, `HoverCardTrigger`, `HoverCardContent`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/input-otp.tsx`

1. **File:** `input-otp.tsx` at `Frontend-React/src/components/ui/input-otp.tsx`
2. **Renders:** Reusable UI primitive module exporting InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator; it does not render an application page by itself.
   - Exports: `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - [components/ui/input-otp.tsx:60](Frontend-React/src/components/ui/input-otp.tsx#L60): `hasFakeCaret`.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/input.tsx`

1. **File:** `input.tsx` at `Frontend-React/src/components/ui/input.tsx`
2. **Renders:** Reusable UI primitive module exporting Input; it does not render an application page by itself.
   - Exports: `Input`.
3. **Visible UI elements:**
   - `<input>` at [components/ui/input.tsx:7](Frontend-React/src/components/ui/input.tsx#L7): label/text **{type}**; type=`type`.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/label.tsx`

1. **File:** `label.tsx` at `Frontend-React/src/components/ui/label.tsx`
2. **Renders:** Reusable UI primitive module exporting Label; it does not render an application page by itself.
   - Exports: `Label`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/menubar.tsx`

1. **File:** `menubar.tsx` at `Frontend-React/src/components/ui/menubar.tsx`
2. **Renders:** Reusable UI primitive module exporting Menubar, MenubarPortal, MenubarMenu, MenubarTrigger, MenubarContent, MenubarGroup, MenubarSeparator, MenubarLabel, MenubarItem, MenubarShortcut, MenubarCheckboxItem, MenubarRadioGroup, MenubarRadioItem, MenubarSub, MenubarSubTrigger, MenubarSubContent; it does not render an application page by itself.
   - Exports: `Menubar`, `MenubarPortal`, `MenubarMenu`, `MenubarTrigger`, `MenubarContent`, `MenubarGroup`, `MenubarSeparator`, `MenubarLabel`, `MenubarItem`, `MenubarShortcut`, `MenubarCheckboxItem`, `MenubarRadioGroup`, `MenubarRadioItem`, `MenubarSub`, `MenubarSubTrigger`, `MenubarSubContent`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/navigation-menu.tsx`

1. **File:** `navigation-menu.tsx` at `Frontend-React/src/components/ui/navigation-menu.tsx`
2. **Renders:** Reusable UI primitive module exporting NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuContent, NavigationMenuTrigger, NavigationMenuLink, NavigationMenuIndicator, NavigationMenuViewport, navigationMenuTriggerStyle; it does not render an application page by itself.
   - Exports: `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuContent`, `NavigationMenuTrigger`, `NavigationMenuLink`, `NavigationMenuIndicator`, `NavigationMenuViewport`, `navigationMenuTriggerStyle`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - [components/ui/navigation-menu.tsx:27](Frontend-React/src/components/ui/navigation-menu.tsx#L27): `viewport`.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/pagination.tsx`

1. **File:** `pagination.tsx` at `Frontend-React/src/components/ui/pagination.tsx`
2. **Renders:** Reusable UI primitive module exporting Pagination, PaginationContent, PaginationLink, PaginationItem, PaginationPrevious, PaginationNext, PaginationEllipsis; it does not render an application page by itself.
   - Exports: `Pagination`, `PaginationContent`, `PaginationLink`, `PaginationItem`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis`.
3. **Visible UI elements:**
   - `<a>` at [components/ui/pagination.tsx:52](Frontend-React/src/components/ui/pagination.tsx#L52): label/text **{isActive ? "page" : undefined} {isActive}**.
   - Fixed visible text (3 literals): "Previous" ([components/ui/pagination.tsx:80](Frontend-React/src/components/ui/pagination.tsx#L80)); "Next" ([components/ui/pagination.tsx:96](Frontend-React/src/components/ui/pagination.tsx#L96)); "More pages" ([components/ui/pagination.tsx:114](Frontend-React/src/components/ui/pagination.tsx#L114)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - [components/ui/pagination.tsx:53](Frontend-React/src/components/ui/pagination.tsx#L53): `isActive`.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/popover.tsx`

1. **File:** `popover.tsx` at `Frontend-React/src/components/ui/popover.tsx`
2. **Renders:** Reusable UI primitive module exporting Popover, PopoverTrigger, PopoverContent, PopoverAnchor; it does not render an application page by itself.
   - Exports: `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverAnchor`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/progress.tsx`

1. **File:** `progress.tsx` at `Frontend-React/src/components/ui/progress.tsx`
2. **Renders:** Reusable UI primitive module exporting Progress; it does not render an application page by itself.
   - Exports: `Progress`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/radio-group.tsx`

1. **File:** `radio-group.tsx` at `Frontend-React/src/components/ui/radio-group.tsx`
2. **Renders:** Reusable UI primitive module exporting RadioGroup, RadioGroupItem; it does not render an application page by itself.
   - Exports: `RadioGroup`, `RadioGroupItem`.
3. **Visible UI elements:**
   - `<RadioGroupPrimitive.Root>` at [components/ui/radio-group.tsx:14](Frontend-React/src/components/ui/radio-group.tsx#L14): label/text **(no fixed label)**.
   - `<RadioGroupPrimitive.Item>` at [components/ui/radio-group.tsx:27](Frontend-React/src/components/ui/radio-group.tsx#L27): label/text **(no fixed label)**.
   - `<RadioGroupPrimitive.Indicator>` at [components/ui/radio-group.tsx:35](Frontend-React/src/components/ui/radio-group.tsx#L35): label/text **(no fixed label)**.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/resizable.tsx`

1. **File:** `resizable.tsx` at `Frontend-React/src/components/ui/resizable.tsx`
2. **Renders:** Reusable UI primitive module exporting ResizablePanelGroup, ResizablePanel, ResizableHandle; it does not render an application page by itself.
   - Exports: `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - [components/ui/resizable.tsx:47](Frontend-React/src/components/ui/resizable.tsx#L47): `withHandle`.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/scroll-area.tsx`

1. **File:** `scroll-area.tsx` at `Frontend-React/src/components/ui/scroll-area.tsx`
2. **Renders:** Reusable UI primitive module exporting ScrollArea, ScrollBar; it does not render an application page by itself.
   - Exports: `ScrollArea`, `ScrollBar`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/select.tsx`

1. **File:** `select.tsx` at `Frontend-React/src/components/ui/select.tsx`
2. **Renders:** Reusable UI primitive module exporting Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue; it does not render an application page by itself.
   - Exports: `Select`, `SelectContent`, `SelectGroup`, `SelectItem`, `SelectLabel`, `SelectScrollDownButton`, `SelectScrollUpButton`, `SelectSeparator`, `SelectTrigger`, `SelectValue`.
3. **Visible UI elements:**
   - `<SelectPrimitive.Root>` at [components/ui/select.tsx:16](Frontend-React/src/components/ui/select.tsx#L16): label/text **(no fixed label)**.
   - `<SelectPrimitive.Group>` at [components/ui/select.tsx:22](Frontend-React/src/components/ui/select.tsx#L22): label/text **(no fixed label)**.
   - `<SelectPrimitive.Value>` at [components/ui/select.tsx:28](Frontend-React/src/components/ui/select.tsx#L28): label/text **(no fixed label)**.
   - `<SelectPrimitive.Trigger>` at [components/ui/select.tsx:40](Frontend-React/src/components/ui/select.tsx#L40): label/text **{size} {children}**.
   - `<SelectPrimitive.Icon>` at [components/ui/select.tsx:50](Frontend-React/src/components/ui/select.tsx#L50): label/text **(no fixed label)**.
   - `<SelectPrimitive.Portal>` at [components/ui/select.tsx:64](Frontend-React/src/components/ui/select.tsx#L64): label/text **{position} {children}**.
   - `<SelectPrimitive.Content>` at [components/ui/select.tsx:65](Frontend-React/src/components/ui/select.tsx#L65): label/text **{position} {children}**.
   - `<SelectScrollUpButton>` at [components/ui/select.tsx:76](Frontend-React/src/components/ui/select.tsx#L76): label/text **(no fixed label)**.
   - `<SelectPrimitive.Viewport>` at [components/ui/select.tsx:77](Frontend-React/src/components/ui/select.tsx#L77): label/text **{children}**.
   - `<SelectScrollDownButton>` at [components/ui/select.tsx:86](Frontend-React/src/components/ui/select.tsx#L86): label/text **(no fixed label)**.
   - `<SelectPrimitive.Label>` at [components/ui/select.tsx:97](Frontend-React/src/components/ui/select.tsx#L97): label/text **(no fixed label)**.
   - `<SelectPrimitive.Item>` at [components/ui/select.tsx:111](Frontend-React/src/components/ui/select.tsx#L111): label/text **{children}**.
   - `<SelectPrimitive.ItemIndicator>` at [components/ui/select.tsx:120](Frontend-React/src/components/ui/select.tsx#L120): label/text **(no fixed label)**.
   - `<SelectPrimitive.ItemText>` at [components/ui/select.tsx:124](Frontend-React/src/components/ui/select.tsx#L124): label/text **{children}**.
   - `<SelectPrimitive.Separator>` at [components/ui/select.tsx:134](Frontend-React/src/components/ui/select.tsx#L134): label/text **(no fixed label)**.
   - `<SelectPrimitive.ScrollUpButton>` at [components/ui/select.tsx:147](Frontend-React/src/components/ui/select.tsx#L147): label/text **(no fixed label)**.
   - `<SelectPrimitive.ScrollDownButton>` at [components/ui/select.tsx:165](Frontend-React/src/components/ui/select.tsx#L165): label/text **(no fixed label)**.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/separator.tsx`

1. **File:** `separator.tsx` at `Frontend-React/src/components/ui/separator.tsx`
2. **Renders:** Reusable UI primitive module exporting Separator; it does not render an application page by itself.
   - Exports: `Separator`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/sheet.tsx`

1. **File:** `sheet.tsx` at `Frontend-React/src/components/ui/sheet.tsx`
2. **Renders:** Reusable UI primitive module exporting Sheet, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription; it does not render an application page by itself.
   - Exports: `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetHeader`, `SheetFooter`, `SheetTitle`, `SheetDescription`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text (1 literals): "Close" ([components/ui/sheet.tsx:77](Frontend-React/src/components/ui/sheet.tsx#L77)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/sidebar.tsx`

1. **File:** `sidebar.tsx` at `Frontend-React/src/components/ui/sidebar.tsx`
2. **Renders:** Reusable UI primitive module exporting Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar; it does not render an application page by itself.
   - Exports: `Sidebar`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupAction`, `SidebarGroupContent`, `SidebarGroupLabel`, `SidebarHeader`, `SidebarInput`, `SidebarInset`, `SidebarMenu`, `SidebarMenuAction`, `SidebarMenuBadge`, `SidebarMenuButton`, `SidebarMenuItem`, `SidebarMenuSkeleton`, `SidebarMenuSub`, `SidebarMenuSubButton`, `SidebarMenuSubItem`, `SidebarProvider`, `SidebarRail`, `SidebarSeparator`, `SidebarTrigger`, `useSidebar`.
3. **Visible UI elements:**
   - `<Button>` at [components/ui/sidebar.tsx:264](Frontend-React/src/components/ui/sidebar.tsx#L264): label/text **Toggle Sidebar**; onClick=`(event) => { onClick?.(event); toggleSidebar(); }`. **onClick:** `(event) => { onClick?.(event); toggleSidebar(); }` at [components/ui/sidebar.tsx:264](Frontend-React/src/components/ui/sidebar.tsx#L264).
   - `<button>` at [components/ui/sidebar.tsx:286](Frontend-React/src/components/ui/sidebar.tsx#L286): label/text **{toggleSidebar}**; onClick=`toggleSidebar`. **onClick:** `toggleSidebar` at [components/ui/sidebar.tsx:286](Frontend-React/src/components/ui/sidebar.tsx#L286).
   - `<Input>` at [components/ui/sidebar.tsx:326](Frontend-React/src/components/ui/sidebar.tsx#L326): label/text **(no fixed label)**.
   - Fixed visible text (3 literals): "Sidebar" ([components/ui/sidebar.tsx:199](Frontend-React/src/components/ui/sidebar.tsx#L199)); "Displays the mobile sidebar." ([components/ui/sidebar.tsx:200](Frontend-React/src/components/ui/sidebar.tsx#L200)); "Toggle Sidebar" ([components/ui/sidebar.tsx:277](Frontend-React/src/components/ui/sidebar.tsx#L277)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - `openMobile` / `setOpenMobile` at [components/ui/sidebar.tsx:70](Frontend-React/src/components/ui/sidebar.tsx#L70), initial value `false`. Re-renders are triggered at [components/ui/sidebar.tsx:93](Frontend-React/src/components/ui/sidebar.tsx#L93) with `(open) => !open`.
   - `_open` / `_setOpen` at [components/ui/sidebar.tsx:74](Frontend-React/src/components/ui/sidebar.tsx#L74), initial value `defaultOpen`. Re-renders are triggered at [components/ui/sidebar.tsx:82](Frontend-React/src/components/ui/sidebar.tsx#L82) with `openState`.
   - Effect at [components/ui/sidebar.tsx:97](Frontend-React/src/components/ui/sidebar.tsx#L97) runs with dependencies `[toggleSidebar]`; body starts `() => { const handleKeyDown = (event: KeyboardEvent) => { if ( event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey) ) { event.preventDefault(); toggleSidebar(); } }; window.addEventListener("keydown", handleKeyDown); return () => wind...`.
6. **Conditional rendering / auth / roles:**
   - [components/ui/sidebar.tsx:79](Frontend-React/src/components/ui/sidebar.tsx#L79): `setOpenProp`.
   - [components/ui/sidebar.tsx:212](Frontend-React/src/components/ui/sidebar.tsx#L212): `state === "collapsed"`.
   - [components/ui/sidebar.tsx:621](Frontend-React/src/components/ui/sidebar.tsx#L621): `showIcon`.
7. **Known errors / TODOs visible in code:**
   - [components/ui/sidebar.tsx:50](Frontend-React/src/components/ui/sidebar.tsx#L50): `throw new Error("useSidebar must be used within a SidebarProvider.");`.

## `Frontend-React/src/components/ui/skeleton.tsx`

1. **File:** `skeleton.tsx` at `Frontend-React/src/components/ui/skeleton.tsx`
2. **Renders:** Reusable UI primitive module exporting Skeleton; it does not render an application page by itself.
   - Exports: `Skeleton`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/slider.tsx`

1. **File:** `slider.tsx` at `Frontend-React/src/components/ui/slider.tsx`
2. **Renders:** Reusable UI primitive module exporting Slider; it does not render an application page by itself.
   - Exports: `Slider`.
3. **Visible UI elements:**
   - `<SliderPrimitive.Root>` at [components/ui/slider.tsx:27](Frontend-React/src/components/ui/slider.tsx#L27): label/text **{defaultValue} {value} {min} {max} {index}**; value=`value`.
   - `<SliderPrimitive.Track>` at [components/ui/slider.tsx:39](Frontend-React/src/components/ui/slider.tsx#L39): label/text **(no fixed label)**.
   - `<SliderPrimitive.Range>` at [components/ui/slider.tsx:45](Frontend-React/src/components/ui/slider.tsx#L45): label/text **(no fixed label)**.
   - `<SliderPrimitive.Thumb>` at [components/ui/slider.tsx:53](Frontend-React/src/components/ui/slider.tsx#L53): label/text **{index}**.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/sonner.tsx`

1. **File:** `sonner.tsx` at `Frontend-React/src/components/ui/sonner.tsx`
2. **Renders:** Reusable UI primitive module exporting Toaster; it does not render an application page by itself.
   - Exports: `Toaster`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/switch.tsx`

1. **File:** `switch.tsx` at `Frontend-React/src/components/ui/switch.tsx`
2. **Renders:** Reusable UI primitive module exporting Switch; it does not render an application page by itself.
   - Exports: `Switch`.
3. **Visible UI elements:**
   - `<SwitchPrimitive.Root>` at [components/ui/switch.tsx:13](Frontend-React/src/components/ui/switch.tsx#L13): label/text **(no fixed label)**.
   - `<SwitchPrimitive.Thumb>` at [components/ui/switch.tsx:21](Frontend-React/src/components/ui/switch.tsx#L21): label/text **(no fixed label)**.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/table.tsx`

1. **File:** `table.tsx` at `Frontend-React/src/components/ui/table.tsx`
2. **Renders:** Reusable UI primitive module exporting Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption; it does not render an application page by itself.
   - Exports: `Table`, `TableHeader`, `TableBody`, `TableFooter`, `TableHead`, `TableRow`, `TableCell`, `TableCaption`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/tabs.tsx`

1. **File:** `tabs.tsx` at `Frontend-React/src/components/ui/tabs.tsx`
2. **Renders:** Reusable UI primitive module exporting Tabs, TabsList, TabsTrigger, TabsContent; it does not render an application page by itself.
   - Exports: `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/textarea.tsx`

1. **File:** `textarea.tsx` at `Frontend-React/src/components/ui/textarea.tsx`
2. **Renders:** Reusable UI primitive module exporting Textarea; it does not render an application page by itself.
   - Exports: `Textarea`.
3. **Visible UI elements:**
   - `<textarea>` at [components/ui/textarea.tsx:7](Frontend-React/src/components/ui/textarea.tsx#L7): label/text **(no fixed label)**.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/toggle-group.tsx`

1. **File:** `toggle-group.tsx` at `Frontend-React/src/components/ui/toggle-group.tsx`
2. **Renders:** Reusable UI primitive module exporting ToggleGroup, ToggleGroupItem; it does not render an application page by itself.
   - Exports: `ToggleGroup`, `ToggleGroupItem`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/toggle.tsx`

1. **File:** `toggle.tsx` at `Frontend-React/src/components/ui/toggle.tsx`
2. **Renders:** Reusable UI primitive module exporting Toggle, toggleVariants; it does not render an application page by itself.
   - Exports: `Toggle`, `toggleVariants`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/tooltip.tsx`

1. **File:** `tooltip.tsx` at `Frontend-React/src/components/ui/tooltip.tsx`
2. **Renders:** Reusable UI primitive module exporting Tooltip, TooltipTrigger, TooltipContent, TooltipProvider; it does not render an application page by itself.
   - Exports: `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/use-mobile.ts`

1. **File:** `use-mobile.ts` at `Frontend-React/src/components/ui/use-mobile.ts`
2. **Renders:** Reusable UI primitive module exporting useIsMobile; it does not render an application page by itself.
   - Exports: `useIsMobile`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - `isMobile` / `setIsMobile` at [components/ui/use-mobile.ts:6](Frontend-React/src/components/ui/use-mobile.ts#L6), initial value `undefined`. Re-renders are triggered at [components/ui/use-mobile.ts:13](Frontend-React/src/components/ui/use-mobile.ts#L13) with `window.innerWidth < MOBILE_BREAKPOINT`; [components/ui/use-mobile.ts:16](Frontend-React/src/components/ui/use-mobile.ts#L16) with `window.innerWidth < MOBILE_BREAKPOINT`.
   - Effect at [components/ui/use-mobile.ts:10](Frontend-React/src/components/ui/use-mobile.ts#L10) runs with dependencies `[]`; body starts `() => { const mql = window.matchMedia(\`(max-width: ${MOBILE_BREAKPOINT - 1}px)\`); const onChange = () => { setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); }; mql.addEventListener("change", onChange); setIsMobile(window.innerWidth < MOBILE_BREAKPOINT); r...`.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/ui/utils.ts`

1. **File:** `utils.ts` at `Frontend-React/src/components/ui/utils.ts`
2. **Renders:** Reusable UI primitive module exporting cn; it does not render an application page by itself.
   - Exports: `cn`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/Unauthorized.tsx`

1. **File:** `Unauthorized.tsx` at `Frontend-React/src/components/Unauthorized.tsx`
2. **Renders:** Access-denied page with home and back navigation.
   - Exports: `Unauthorized`.
3. **Visible UI elements:**
   - `<button>` at [components/Unauthorized.tsx:26](Frontend-React/src/components/Unauthorized.tsx#L26): label/text **Go to Home Page**; onClick=`() => onNavigate('home')`. **onClick:** `() => onNavigate('home')` at [components/Unauthorized.tsx:26](Frontend-React/src/components/Unauthorized.tsx#L26).
   - `<button>` at [components/Unauthorized.tsx:33](Frontend-React/src/components/Unauthorized.tsx#L33): label/text **Go Back**; onClick=`() => window.history.back()`. **onClick:** `() => window.history.back()` at [components/Unauthorized.tsx:33](Frontend-React/src/components/Unauthorized.tsx#L33).
   - Fixed visible text (5 literals): "Access Denied" ([components/Unauthorized.tsx:15](Frontend-React/src/components/Unauthorized.tsx#L15)); "You don't have permission to access this page." ([components/Unauthorized.tsx:18](Frontend-React/src/components/Unauthorized.tsx#L18)); "This area is restricted to users with specific roles. Please contact an administrator if you believe this is an error." ([components/Unauthorized.tsx:21](Frontend-React/src/components/Unauthorized.tsx#L21)); "Go to Home Page" ([components/Unauthorized.tsx:30](Frontend-React/src/components/Unauthorized.tsx#L30)); "Go Back" ([components/Unauthorized.tsx:37](Frontend-React/src/components/Unauthorized.tsx#L37)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/components/UserProfile.tsx`

1. **File:** `UserProfile.tsx` at `Frontend-React/src/components/UserProfile.tsx`
2. **Renders:** Job-seeker profile/dashboard with skills, analysis history, jobs, gaps, and courses.
   - Exports: `UserProfile`.
3. **Visible UI elements:**
   - `<button>` at [components/UserProfile.tsx:206](Frontend-React/src/components/UserProfile.tsx#L206): label/text **{handleEditProfile} Edit Profile**; onClick=`handleEditProfile`. **onClick:** `handleEditProfile` at [components/UserProfile.tsx:206](Frontend-React/src/components/UserProfile.tsx#L206).
   - `<button>` at [components/UserProfile.tsx:228](Frontend-React/src/components/UserProfile.tsx#L228): label/text **Analyze Resume**; onClick=`() => onNavigate('analysis')`. **onClick:** `() => onNavigate('analysis')` at [components/UserProfile.tsx:228](Frontend-React/src/components/UserProfile.tsx#L228).
   - `<button>` at [components/UserProfile.tsx:234](Frontend-React/src/components/UserProfile.tsx#L234): label/text **Explore Jobs**; onClick=`() => onNavigate('jobs')`. **onClick:** `() => onNavigate('jobs')` at [components/UserProfile.tsx:234](Frontend-React/src/components/UserProfile.tsx#L234).
   - `<button>` at [components/UserProfile.tsx:279](Frontend-React/src/components/UserProfile.tsx#L279): label/text **Add New Skill**; onClick=`() => setIsAddingSkill(true)`. **onClick:** `() => setIsAddingSkill(true)` at [components/UserProfile.tsx:279](Frontend-React/src/components/UserProfile.tsx#L279).
   - `<button>` at [components/UserProfile.tsx:292](Frontend-React/src/components/UserProfile.tsx#L292): label/text **(no fixed label)**; onClick=`() => setIsAddingSkill(false)`. **onClick:** `() => setIsAddingSkill(false)` at [components/UserProfile.tsx:292](Frontend-React/src/components/UserProfile.tsx#L292).
   - `<input>` at [components/UserProfile.tsx:299](Frontend-React/src/components/UserProfile.tsx#L299): label/text **{newSkill.name}**; type=`text`; placeholder=`e.g. React, Docker, Python`; value=`newSkill.name`; onChange=`(e) => setNewSkill({ ...newSkill, name: e.target.value })`.
   - `<select>` at [components/UserProfile.tsx:309](Frontend-React/src/components/UserProfile.tsx#L309): label/text **{newSkill.level} Expert (90%) Intermediate (70%) Beginner (50%)**; value=`newSkill.level`; onChange=`(e) => setNewSkill({ ...newSkill, level: parseInt(e.target.value) })`.
   - `<select>` at [components/UserProfile.tsx:321](Frontend-React/src/components/UserProfile.tsx#L321): label/text **{newSkill.category} Programming Framework Backend AI/ML Database General**; value=`newSkill.category`; onChange=`(e) => setNewSkill({ ...newSkill, category: e.target.value })`.
   - `<button>` at [components/UserProfile.tsx:336](Frontend-React/src/components/UserProfile.tsx#L336): label/text **Cancel**; onClick=`() => setIsAddingSkill(false)`. **onClick:** `() => setIsAddingSkill(false)` at [components/UserProfile.tsx:336](Frontend-React/src/components/UserProfile.tsx#L336).
   - `<button>` at [components/UserProfile.tsx:342](Frontend-React/src/components/UserProfile.tsx#L342): label/text **{handleAddSkill} {isAddingSkillLoading} {isAddingSkillLoading ? ( <> <div className="w-4 h-4 border-2 border-white bor...} Adding... Add Skill**; disabled=`isAddingSkillLoading`; onClick=`handleAddSkill`. **onClick:** `handleAddSkill` at [components/UserProfile.tsx:342](Frontend-React/src/components/UserProfile.tsx#L342).
   - `<button>` at [components/UserProfile.tsx:407](Frontend-React/src/components/UserProfile.tsx#L407): label/text **View Full Analysis**; onClick=`() => handleViewAnalysis(analysis.id)`. **onClick:** `() => handleViewAnalysis(analysis.id)` at [components/UserProfile.tsx:407](Frontend-React/src/components/UserProfile.tsx#L407).
   - `<button>` at [components/UserProfile.tsx:449](Frontend-React/src/components/UserProfile.tsx#L449): label/text **{handleViewJobDetails} View Job Details**; onClick=`handleViewJobDetails`. **onClick:** `handleViewJobDetails` at [components/UserProfile.tsx:449](Frontend-React/src/components/UserProfile.tsx#L449).
   - `<button>` at [components/UserProfile.tsx:501](Frontend-React/src/components/UserProfile.tsx#L501): label/text **View Course Recommendations**; onClick=`() => onNavigate('courses')`. **onClick:** `() => onNavigate('courses')` at [components/UserProfile.tsx:501](Frontend-React/src/components/UserProfile.tsx#L501).
   - `<button>` at [components/UserProfile.tsx:547](Frontend-React/src/components/UserProfile.tsx#L547): label/text **View Recommendations**; onClick=`() => onNavigate('courses')`. **onClick:** `() => onNavigate('courses')` at [components/UserProfile.tsx:547](Frontend-React/src/components/UserProfile.tsx#L547).
   - Fixed visible text (52 literals): "Loading profile..." ([components/UserProfile.tsx:170](Frontend-React/src/components/UserProfile.tsx#L170)); "Error" ([components/UserProfile.tsx:186](Frontend-React/src/components/UserProfile.tsx#L186)); "Edit Profile" ([components/UserProfile.tsx:207](Frontend-React/src/components/UserProfile.tsx#L207)); "Joined January 2026" ([components/UserProfile.tsx:223](Frontend-React/src/components/UserProfile.tsx#L223)); "Analyze Resume" ([components/UserProfile.tsx:231](Frontend-React/src/components/UserProfile.tsx#L231)); "Explore Jobs" ([components/UserProfile.tsx:237](Frontend-React/src/components/UserProfile.tsx#L237)); "Skills Profile" ([components/UserProfile.tsx:251](Frontend-React/src/components/UserProfile.tsx#L251)); "No skills added yet. Upload a resume to automatically extract skills or add them manually below." ([components/UserProfile.tsx:256](Frontend-React/src/components/UserProfile.tsx#L256)); "Add New Skill" ([components/UserProfile.tsx:282](Frontend-React/src/components/UserProfile.tsx#L282)); "Add New Skill" ([components/UserProfile.tsx:291](Frontend-React/src/components/UserProfile.tsx#L291)); "Skill Name" ([components/UserProfile.tsx:298](Frontend-React/src/components/UserProfile.tsx#L298)); "Proficiency Level" ([components/UserProfile.tsx:308](Frontend-React/src/components/UserProfile.tsx#L308)); "Expert (90%)" ([components/UserProfile.tsx:314](Frontend-React/src/components/UserProfile.tsx#L314)); "Intermediate (70%)" ([components/UserProfile.tsx:315](Frontend-React/src/components/UserProfile.tsx#L315)); "Beginner (50%)" ([components/UserProfile.tsx:316](Frontend-React/src/components/UserProfile.tsx#L316)); "Category" ([components/UserProfile.tsx:320](Frontend-React/src/components/UserProfile.tsx#L320)); "Programming" ([components/UserProfile.tsx:326](Frontend-React/src/components/UserProfile.tsx#L326)); "Framework" ([components/UserProfile.tsx:327](Frontend-React/src/components/UserProfile.tsx#L327)); "Backend" ([components/UserProfile.tsx:328](Frontend-React/src/components/UserProfile.tsx#L328)); "AI/ML" ([components/UserProfile.tsx:329](Frontend-React/src/components/UserProfile.tsx#L329)); "Database" ([components/UserProfile.tsx:330](Frontend-React/src/components/UserProfile.tsx#L330)); "General" ([components/UserProfile.tsx:331](Frontend-React/src/components/UserProfile.tsx#L331)); "Cancel" ([components/UserProfile.tsx:339](Frontend-React/src/components/UserProfile.tsx#L339)); "Adding..." ([components/UserProfile.tsx:349](Frontend-React/src/components/UserProfile.tsx#L349)); "Add Skill" ([components/UserProfile.tsx:354](Frontend-React/src/components/UserProfile.tsx#L354)); "Skill added successfully!" ([components/UserProfile.tsx:362](Frontend-React/src/components/UserProfile.tsx#L362)); "Resume Analysis History" ([components/UserProfile.tsx:374](Frontend-React/src/components/UserProfile.tsx#L374)); "No analysis history found. Upload a resume to get started." ([components/UserProfile.tsx:379](Frontend-React/src/components/UserProfile.tsx#L379)); "Readiness" ([components/UserProfile.tsx:394](Frontend-React/src/components/UserProfile.tsx#L394)); "Skills Analyzed:" ([components/UserProfile.tsx:399](Frontend-React/src/components/UserProfile.tsx#L399)); "Gaps Found:" ([components/UserProfile.tsx:403](Frontend-React/src/components/UserProfile.tsx#L403)); "View Full Analysis" ([components/UserProfile.tsx:410](Frontend-React/src/components/UserProfile.tsx#L410)); "Job Matching History" ([components/UserProfile.tsx:422](Frontend-React/src/components/UserProfile.tsx#L422)); "No matching history found. Run resume analysis to see matched jobs." ([components/UserProfile.tsx:427](Frontend-React/src/components/UserProfile.tsx#L427)); "Matched on" ([components/UserProfile.tsx:438](Frontend-React/src/components/UserProfile.tsx#L438)); "Match" ([components/UserProfile.tsx:443](Frontend-React/src/components/UserProfile.tsx#L443)); "View Job Details" ([components/UserProfile.tsx:452](Frontend-React/src/components/UserProfile.tsx#L452)); "Skill Gaps" ([components/UserProfile.tsx:464](Frontend-React/src/components/UserProfile.tsx#L464)); "No skill gaps identified. Try running a resume matching analysis first." ([components/UserProfile.tsx:469](Frontend-React/src/components/UserProfile.tsx#L469)); "Priority" ([components/UserProfile.tsx:477](Frontend-React/src/components/UserProfile.tsx#L477)); "Current:" ([components/UserProfile.tsx:482](Frontend-React/src/components/UserProfile.tsx#L482)); "Target:" ([components/UserProfile.tsx:486](Frontend-React/src/components/UserProfile.tsx#L486)); "Impact:" ([components/UserProfile.tsx:491](Frontend-React/src/components/UserProfile.tsx#L491)); "Suggested Focus:" ([components/UserProfile.tsx:494](Frontend-React/src/components/UserProfile.tsx#L494)); "View Course Recommendations" ([components/UserProfile.tsx:504](Frontend-React/src/components/UserProfile.tsx#L504)); "Career Readiness" ([components/UserProfile.tsx:514](Frontend-React/src/components/UserProfile.tsx#L514)); "Ready" ([components/UserProfile.tsx:542](Frontend-React/src/components/UserProfile.tsx#L542)); "View Recommendations" ([components/UserProfile.tsx:550](Frontend-React/src/components/UserProfile.tsx#L550)); "Your Progress" ([components/UserProfile.tsx:557](Frontend-React/src/components/UserProfile.tsx#L557)); "Analyses Done" ([components/UserProfile.tsx:560](Frontend-React/src/components/UserProfile.tsx#L560)); "Jobs Matched" ([components/UserProfile.tsx:564](Frontend-React/src/components/UserProfile.tsx#L564)); "Skills Listed" ([components/UserProfile.tsx:568](Frontend-React/src/components/UserProfile.tsx#L568)).
4. **API calls:**
   - [components/UserProfile.tsx:40](Frontend-React/src/components/UserProfile.tsx#L40): `usersAPI.getProfile(userId; token)` from `../api/users.api`. Response is assigned to `prof`; subsequent state updates in the same handler: `setProfile(prof) @ L41`, `setSkills(mappedSkills) @ L50`, `setAnalysisHistory(mappedAnalysis) @ L69`, `setJobHistory(mappedJobs) @ L78`, `setReadinessScore(latest.match_score || Math.round((latest.overall_score || 0) * 100)) @ L82`, `setSkillGaps(mappedGaps) @ L92`, `setError(err.message || 'Failed to fetch profile details') @ L98`, `setIsLoading(false) @ L100`.
   - [components/UserProfile.tsx:44](Frontend-React/src/components/UserProfile.tsx#L44): `usersAPI.getSkills(token)` from `../api/users.api`. Response is assigned to `userSkills`; subsequent state updates in the same handler: `setSkills(mappedSkills) @ L50`, `setAnalysisHistory(mappedAnalysis) @ L69`, `setJobHistory(mappedJobs) @ L78`, `setReadinessScore(latest.match_score || Math.round((latest.overall_score || 0) * 100)) @ L82`, `setSkillGaps(mappedGaps) @ L92`, `setError(err.message || 'Failed to fetch profile details') @ L98`, `setIsLoading(false) @ L100`.
   - [components/UserProfile.tsx:54](Frontend-React/src/components/UserProfile.tsx#L54): `fetch(\`${API_BASE_URL}/matches\`; { headers: { 'Authorization': \`Bearer ${token}\` } })` from `browser Fetch API`. Response is assigned to `matchesRes`; subsequent state updates in the same handler: `setAnalysisHistory(mappedAnalysis) @ L69`, `setJobHistory(mappedJobs) @ L78`, `setReadinessScore(latest.match_score || Math.round((latest.overall_score || 0) * 100)) @ L82`, `setSkillGaps(mappedGaps) @ L92`, `setError(err.message || 'Failed to fetch profile details') @ L98`, `setIsLoading(false) @ L100`.
   - [components/UserProfile.tsx:137](Frontend-React/src/components/UserProfile.tsx#L137): `usersAPI.addSkill(userId; skillData; token)` from `../api/users.api`. Response is awaited/returned without a named assignment; subsequent state updates in the same handler: `setShowSkillSuccess(true) @ L139`, `setNewSkill({ name: '', level: 50, category: 'Programming' }) @ L140`, `setIsAddingSkill(false) @ L141`, `setShowSkillSuccess(false) @ L144`, `setIsAddingSkillLoading(false) @ L150`.
5. **State and re-render triggers:**
   - `isAddingSkill` / `setIsAddingSkill` at [components/UserProfile.tsx:10](Frontend-React/src/components/UserProfile.tsx#L10), initial value `false`. Re-renders are triggered at [components/UserProfile.tsx:141](Frontend-React/src/components/UserProfile.tsx#L141) with `false`; [components/UserProfile.tsx:280](Frontend-React/src/components/UserProfile.tsx#L280) with `true`; [components/UserProfile.tsx:292](Frontend-React/src/components/UserProfile.tsx#L292) with `false`; [components/UserProfile.tsx:337](Frontend-React/src/components/UserProfile.tsx#L337) with `false`.
   - `newSkill` / `setNewSkill` at [components/UserProfile.tsx:11](Frontend-React/src/components/UserProfile.tsx#L11), initial value `{ name: '', level: 50, category: 'Programming' }`. Re-renders are triggered at [components/UserProfile.tsx:140](Frontend-React/src/components/UserProfile.tsx#L140) with `{ name: '', level: 50, category: 'Programming' }`; [components/UserProfile.tsx:302](Frontend-React/src/components/UserProfile.tsx#L302) with `{ ...newSkill, name: e.target.value }`; [components/UserProfile.tsx:311](Frontend-React/src/components/UserProfile.tsx#L311) with `{ ...newSkill, level: parseInt(e.target.value) }`; [components/UserProfile.tsx:323](Frontend-React/src/components/UserProfile.tsx#L323) with `{ ...newSkill, category: e.target.value }`.
   - `isAddingSkillLoading` / `setIsAddingSkillLoading` at [components/UserProfile.tsx:12](Frontend-React/src/components/UserProfile.tsx#L12), initial value `false`. Re-renders are triggered at [components/UserProfile.tsx:118](Frontend-React/src/components/UserProfile.tsx#L118) with `true`; [components/UserProfile.tsx:150](Frontend-React/src/components/UserProfile.tsx#L150) with `false`.
   - `showSkillSuccess` / `setShowSkillSuccess` at [components/UserProfile.tsx:13](Frontend-React/src/components/UserProfile.tsx#L13), initial value `false`. Re-renders are triggered at [components/UserProfile.tsx:139](Frontend-React/src/components/UserProfile.tsx#L139) with `true`; [components/UserProfile.tsx:144](Frontend-React/src/components/UserProfile.tsx#L144) with `false`.
   - `profile` / `setProfile` at [components/UserProfile.tsx:15](Frontend-React/src/components/UserProfile.tsx#L15), initial value `null`. Re-renders are triggered at [components/UserProfile.tsx:41](Frontend-React/src/components/UserProfile.tsx#L41) with `prof`.
   - `skills` / `setSkills` at [components/UserProfile.tsx:16](Frontend-React/src/components/UserProfile.tsx#L16), initial value `[]`. Re-renders are triggered at [components/UserProfile.tsx:50](Frontend-React/src/components/UserProfile.tsx#L50) with `mappedSkills`.
   - `analysisHistory` / `setAnalysisHistory` at [components/UserProfile.tsx:17](Frontend-React/src/components/UserProfile.tsx#L17), initial value `[]`. Re-renders are triggered at [components/UserProfile.tsx:69](Frontend-React/src/components/UserProfile.tsx#L69) with `mappedAnalysis`.
   - `jobHistory` / `setJobHistory` at [components/UserProfile.tsx:18](Frontend-React/src/components/UserProfile.tsx#L18), initial value `[]`. Re-renders are triggered at [components/UserProfile.tsx:78](Frontend-React/src/components/UserProfile.tsx#L78) with `mappedJobs`.
   - `skillGaps` / `setSkillGaps` at [components/UserProfile.tsx:19](Frontend-React/src/components/UserProfile.tsx#L19), initial value `[]`. Re-renders are triggered at [components/UserProfile.tsx:92](Frontend-React/src/components/UserProfile.tsx#L92) with `mappedGaps`.
   - `readinessScore` / `setReadinessScore` at [components/UserProfile.tsx:20](Frontend-React/src/components/UserProfile.tsx#L20), initial value `70`. Re-renders are triggered at [components/UserProfile.tsx:82](Frontend-React/src/components/UserProfile.tsx#L82) with `latest.match_score || Math.round((latest.overall_score || 0) * 100)`.
   - `isLoading` / `setIsLoading` at [components/UserProfile.tsx:21](Frontend-React/src/components/UserProfile.tsx#L21), initial value `true`. Re-renders are triggered at [components/UserProfile.tsx:25](Frontend-React/src/components/UserProfile.tsx#L25) with `true`; [components/UserProfile.tsx:100](Frontend-React/src/components/UserProfile.tsx#L100) with `false`.
   - `error` / `setError` at [components/UserProfile.tsx:22](Frontend-React/src/components/UserProfile.tsx#L22), initial value `null`. Re-renders are triggered at [components/UserProfile.tsx:26](Frontend-React/src/components/UserProfile.tsx#L26) with `null`; [components/UserProfile.tsx:30](Frontend-React/src/components/UserProfile.tsx#L30) with `'Session expired, please log in again'`; [components/UserProfile.tsx:98](Frontend-React/src/components/UserProfile.tsx#L98) with `err.message || 'Failed to fetch profile details'`.
   - Effect at [components/UserProfile.tsx:104](Frontend-React/src/components/UserProfile.tsx#L104) runs with dependencies `[]`; body starts `() => { fetchProfileData(); }`.
6. **Conditional rendering / auth / roles:**
   - [components/UserProfile.tsx:29](Frontend-React/src/components/UserProfile.tsx#L29): `!token`.
   - [components/UserProfile.tsx:80](Frontend-React/src/components/UserProfile.tsx#L80): `matches.length > 0`.
   - [components/UserProfile.tsx:113](Frontend-React/src/components/UserProfile.tsx#L113): `!newSkill.name || newSkill.name.trim().length === 0`.
   - [components/UserProfile.tsx:121](Frontend-React/src/components/UserProfile.tsx#L121): `!token`.
   - [components/UserProfile.tsx:166](Frontend-React/src/components/UserProfile.tsx#L166): `isLoading`.
   - [components/UserProfile.tsx:184](Frontend-React/src/components/UserProfile.tsx#L184): `error`.
   - [components/UserProfile.tsx:255](Frontend-React/src/components/UserProfile.tsx#L255): `skills.length === 0`.
   - [components/UserProfile.tsx:287](Frontend-React/src/components/UserProfile.tsx#L287): `isAddingSkill`.
   - [components/UserProfile.tsx:347](Frontend-React/src/components/UserProfile.tsx#L347): `isAddingSkillLoading`.
   - [components/UserProfile.tsx:360](Frontend-React/src/components/UserProfile.tsx#L360): `showSkillSuccess`.
   - [components/UserProfile.tsx:378](Frontend-React/src/components/UserProfile.tsx#L378): `analysisHistory.length === 0`.
   - [components/UserProfile.tsx:426](Frontend-React/src/components/UserProfile.tsx#L426): `jobHistory.length === 0`.
   - [components/UserProfile.tsx:468](Frontend-React/src/components/UserProfile.tsx#L468): `skillGaps.length === 0`.
7. **Known errors / TODOs visible in code:**
   - [components/UserProfile.tsx:26](Frontend-React/src/components/UserProfile.tsx#L26): `setError(null);`.
   - [components/UserProfile.tsx:30](Frontend-React/src/components/UserProfile.tsx#L30): `setError('Session expired, please log in again');`.
   - [components/UserProfile.tsx:97](Frontend-React/src/components/UserProfile.tsx#L97): `console.error(err);`.
   - [components/UserProfile.tsx:98](Frontend-React/src/components/UserProfile.tsx#L98): `setError(err.message || 'Failed to fetch profile details');`.
   - [components/UserProfile.tsx:114](Frontend-React/src/components/UserProfile.tsx#L114): `alert('Please enter a skill name');`.
   - [components/UserProfile.tsx:122](Frontend-React/src/components/UserProfile.tsx#L122): `alert('Session expired, please log in again');`.
   - [components/UserProfile.tsx:147](Frontend-React/src/components/UserProfile.tsx#L147): `console.error(err);`.
   - [components/UserProfile.tsx:148](Frontend-React/src/components/UserProfile.tsx#L148): `alert(err.message || 'Failed to add skill');`.

## `Frontend-React/src/components/UserRoles.tsx`

1. **File:** `UserRoles.tsx` at `Frontend-React/src/components/UserRoles.tsx`
2. **Renders:** Landing-page comparison of job-seeker and recruiter capabilities.
   - Exports: `UserRoles`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text (2 literals): "Built for Every Role" ([components/UserRoles.tsx:53](Frontend-React/src/components/UserRoles.tsx#L53)); "Tailored experiences for job seekers, recruiters, and administrators" ([components/UserRoles.tsx:56](Frontend-React/src/components/UserRoles.tsx#L56)).
4. **API calls:**
   - None.
5. **State and re-render triggers:**
   - No local React state or effects.
6. **Conditional rendering / auth / roles:**
   - No explicit local conditional JSX/auth/role branch detected.
7. **Known errors / TODOs visible in code:**
   - None explicitly visible.

## `Frontend-React/src/context/AuthContext.tsx`

1. **File:** `AuthContext.tsx` at `Frontend-React/src/context/AuthContext.tsx`
2. **Renders:** Authentication provider/context that restores sessions and exposes login, signup, logout, roles, and user updates.
   - Exports: `AuthProvider`, `useAuth`.
3. **Visible UI elements:**
   - No fixed interactive controls are declared in this module; rendering is passive, delegated to children, or controlled through passed props.
   - Fixed visible text: none; text is supplied dynamically through props/children or the module is nonvisual.
4. **API calls:**
   - [context/AuthContext.tsx:45](Frontend-React/src/context/AuthContext.tsx#L45): `authAPI.verifyToken(token)` from `../api/auth.api`. Response is assigned to `data`; subsequent state updates in the same handler: `setUser(verifiedUser) @ L52`, `setUser(verifiedUser) @ L78`, `setUser(null) @ L87`.
   - [context/AuthContext.tsx:59](Frontend-React/src/context/AuthContext.tsx#L59): `fetch(\`${API_BASE_URL}/auth/refresh\`; { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh_token: refreshToken }) })` from `browser Fetch API`. Response is assigned to `refreshRes`; subsequent state updates in the same handler: `setUser(verifiedUser) @ L78`, `setUser(null) @ L87`.
   - [context/AuthContext.tsx:71](Frontend-React/src/context/AuthContext.tsx#L71): `authAPI.verifyToken(refreshData.access_token)` from `../api/auth.api`. Response is assigned to `data`; subsequent state updates in the same handler: `setUser(verifiedUser) @ L78`, `setUser(null) @ L87`.
   - [context/AuthContext.tsx:98](Frontend-React/src/context/AuthContext.tsx#L98): `authAPI.signIn({ email, password })` from `../api/auth.api`. Response is assigned to `data`; subsequent state updates in the same handler: `setUser(authenticatedUser) @ L111`.
   - [context/AuthContext.tsx:123](Frontend-React/src/context/AuthContext.tsx#L123): `authAPI.signUp({ full_name: name, email, password, role: dbRole })` from `../api/auth.api`. Response is assigned to `data`; subsequent state updates in the same handler: `setUser(newUser) @ L137`.
   - [context/AuthContext.tsx:150](Frontend-React/src/context/AuthContext.tsx#L150): `authAPI.signOut(token)` from `../api/auth.api`. Response is awaited/returned without a named assignment; subsequent state updates in the same handler: `setUser(null) @ L152`.
5. **State and re-render triggers:**
   - `user` / `setUser` at [context/AuthContext.tsx:34](Frontend-React/src/context/AuthContext.tsx#L34), initial value `null`. Re-renders are triggered at [context/AuthContext.tsx:52](Frontend-React/src/context/AuthContext.tsx#L52) with `verifiedUser`; [context/AuthContext.tsx:78](Frontend-React/src/context/AuthContext.tsx#L78) with `verifiedUser`; [context/AuthContext.tsx:87](Frontend-React/src/context/AuthContext.tsx#L87) with `null`; [context/AuthContext.tsx:111](Frontend-React/src/context/AuthContext.tsx#L111) with `authenticatedUser`; [context/AuthContext.tsx:137](Frontend-React/src/context/AuthContext.tsx#L137) with `newUser`; [context/AuthContext.tsx:152](Frontend-React/src/context/AuthContext.tsx#L152) with `null`; [context/AuthContext.tsx:159](Frontend-React/src/context/AuthContext.tsx#L159) with `prev => { if (!prev) return null; const updated = { ...prev, ...updatedFields }; localStorage.setItem('currentUser', JSON.stringify(updat...`.
   - Effect at [context/AuthContext.tsx:37](Frontend-React/src/context/AuthContext.tsx#L37) runs with dependencies `[]`; body starts `() => { const token = localStorage.getItem('token'); const savedUser = localStorage.getItem('currentUser'); if (!token || !savedUser) return; // Verify token is still valid — auto-refresh if expired const tryRestoreSession = async () => { try { const data =...`.
6. **Conditional rendering / auth / roles:**
   - [context/AuthContext.tsx:40](Frontend-React/src/context/AuthContext.tsx#L40): `!token || !savedUser`.
   - [context/AuthContext.tsx:57](Frontend-React/src/context/AuthContext.tsx#L57): `refreshToken`.
   - [context/AuthContext.tsx:67](Frontend-React/src/context/AuthContext.tsx#L67): `refreshData.refresh_token`.
   - [context/AuthContext.tsx:100](Frontend-React/src/context/AuthContext.tsx#L100): `!data.user`.
   - [context/AuthContext.tsx:115](Frontend-React/src/context/AuthContext.tsx#L115): `data.refresh_token`.
   - [context/AuthContext.tsx:125](Frontend-React/src/context/AuthContext.tsx#L125): `!data.user`.
   - [context/AuthContext.tsx:139](Frontend-React/src/context/AuthContext.tsx#L139): `data.access_token`.
   - [context/AuthContext.tsx:142](Frontend-React/src/context/AuthContext.tsx#L142): `data.refresh_token`.
   - [context/AuthContext.tsx:149](Frontend-React/src/context/AuthContext.tsx#L149): `token`.
   - [context/AuthContext.tsx:168](Frontend-React/src/context/AuthContext.tsx#L168): `!user`.
7. **Known errors / TODOs visible in code:**
   - [context/AuthContext.tsx:101](Frontend-React/src/context/AuthContext.tsx#L101): `throw new Error("Login response missing user details");`.
   - [context/AuthContext.tsx:126](Frontend-React/src/context/AuthContext.tsx#L126): `throw new Error("Signup response missing user details");`.
   - [context/AuthContext.tsx:150](Frontend-React/src/context/AuthContext.tsx#L150): `authAPI.signOut(token).catch(err => console.error('Sign out error:', err));`.
   - [context/AuthContext.tsx:191](Frontend-React/src/context/AuthContext.tsx#L191): `throw new Error("useAuth must be used within an AuthProvider");`.

## `Frontend-React/src/api/admin.api.js`

1. **File:** `admin.api.js` at `Frontend-React/src/api/admin.api.js`
2. **Functions:**
   - **`getAuthHeaders(token)`** at [api/admin.api.js:8](Frontend-React/src/api/admin.api.js#L8).
     - HTTP: no direct request; helper/alias function.
     - Returns: `{ 'Content-Type': 'application/json', 'Authorization': \`Bearer ${finalToken}\`, }` ([api/admin.api.js:10](Frontend-React/src/api/admin.api.js#L10)).
   - **`getAllUsers(token)`** at [api/admin.api.js:22](Frontend-React/src/api/admin.api.js#L22).
     - HTTP at [api/admin.api.js:23](Frontend-React/src/api/admin.api.js#L23): method `'GET'`, endpoint `\`${API_BASE_URL}/admin/users\``, body `none`.
     - Returns: `response.json()` ([api/admin.api.js:32](Frontend-React/src/api/admin.api.js#L32)).
     - Errors: `new Error('Failed to fetch users')` ([api/admin.api.js:29](Frontend-React/src/api/admin.api.js#L29)).
   - **`createUser(userData, token)`** at [api/admin.api.js:41](Frontend-React/src/api/admin.api.js#L41).
     - HTTP at [api/admin.api.js:42](Frontend-React/src/api/admin.api.js#L42): method `'POST'`, endpoint `\`${API_BASE_URL}/admin/users\``, body `JSON.stringify(userData)`.
     - Returns: `response.json()` ([api/admin.api.js:52](Frontend-React/src/api/admin.api.js#L52)).
     - Errors: `new Error('Failed to create user')` ([api/admin.api.js:49](Frontend-React/src/api/admin.api.js#L49)).
   - **`updateUser(userId, userData, token)`** at [api/admin.api.js:62](Frontend-React/src/api/admin.api.js#L62).
     - HTTP at [api/admin.api.js:63](Frontend-React/src/api/admin.api.js#L63): method `'PUT'`, endpoint `\`${API_BASE_URL}/admin/users/${userId}\``, body `JSON.stringify(userData)`.
     - Returns: `response.json()` ([api/admin.api.js:73](Frontend-React/src/api/admin.api.js#L73)).
     - Errors: `new Error('Failed to update user')` ([api/admin.api.js:70](Frontend-React/src/api/admin.api.js#L70)).
   - **`deleteUser(userId, token)`** at [api/admin.api.js:82](Frontend-React/src/api/admin.api.js#L82).
     - HTTP at [api/admin.api.js:83](Frontend-React/src/api/admin.api.js#L83): method `'DELETE'`, endpoint `\`${API_BASE_URL}/admin/users/${userId}\``, body `none`.
     - Returns: `response.json()` ([api/admin.api.js:92](Frontend-React/src/api/admin.api.js#L92)).
     - Errors: `new Error('Failed to delete user')` ([api/admin.api.js:89](Frontend-React/src/api/admin.api.js#L89)).
   - **`getSystemStats(token)`** at [api/admin.api.js:100](Frontend-React/src/api/admin.api.js#L100).
     - HTTP at [api/admin.api.js:101](Frontend-React/src/api/admin.api.js#L101): method `'GET'`, endpoint `\`${API_BASE_URL}/admin/stats\``, body `none`.
     - Returns: `response.json()` ([api/admin.api.js:110](Frontend-React/src/api/admin.api.js#L110)).
     - Errors: `new Error('Failed to fetch system stats')` ([api/admin.api.js:107](Frontend-React/src/api/admin.api.js#L107)).
   - **`getAllJobsForReview(token)`** at [api/admin.api.js:118](Frontend-React/src/api/admin.api.js#L118).
     - HTTP at [api/admin.api.js:119](Frontend-React/src/api/admin.api.js#L119): method `'GET'`, endpoint `\`${API_BASE_URL}/admin/jobs\``, body `none`.
     - Returns: `response.json()` ([api/admin.api.js:128](Frontend-React/src/api/admin.api.js#L128)).
     - Errors: `new Error('Failed to fetch jobs')` ([api/admin.api.js:125](Frontend-React/src/api/admin.api.js#L125)).
   - **`approveJob(jobId, token)`** at [api/admin.api.js:137](Frontend-React/src/api/admin.api.js#L137).
     - HTTP at [api/admin.api.js:138](Frontend-React/src/api/admin.api.js#L138): method `'POST'`, endpoint `\`${API_BASE_URL}/admin/jobs/${jobId}/approve\``, body `none`.
     - Returns: `response.json()` ([api/admin.api.js:147](Frontend-React/src/api/admin.api.js#L147)).
     - Errors: `new Error('Failed to approve job')` ([api/admin.api.js:144](Frontend-React/src/api/admin.api.js#L144)).
   - **`archiveJob(jobId, token)`** at [api/admin.api.js:156](Frontend-React/src/api/admin.api.js#L156).
     - HTTP at [api/admin.api.js:157](Frontend-React/src/api/admin.api.js#L157): method `'POST'`, endpoint `\`${API_BASE_URL}/admin/jobs/${jobId}/archive\``, body `none`.
     - Returns: `response.json()` ([api/admin.api.js:166](Frontend-React/src/api/admin.api.js#L166)).
     - Errors: `new Error('Failed to archive job')` ([api/admin.api.js:163](Frontend-React/src/api/admin.api.js#L163)).
   - **`deleteJob(jobId, token)`** at [api/admin.api.js:175](Frontend-React/src/api/admin.api.js#L175).
     - HTTP at [api/admin.api.js:176](Frontend-React/src/api/admin.api.js#L176): method `'DELETE'`, endpoint `\`${API_BASE_URL}/admin/jobs/${jobId}\``, body `none`.
     - Returns: `response.json()` ([api/admin.api.js:185](Frontend-React/src/api/admin.api.js#L185)).
     - Errors: `new Error('Failed to delete job')` ([api/admin.api.js:182](Frontend-React/src/api/admin.api.js#L182)).

## `Frontend-React/src/api/auth.api.js`

1. **File:** `auth.api.js` at `Frontend-React/src/api/auth.api.js`
2. **Functions:**
   - **`signIn(credentials)`** at [api/auth.api.js:14](Frontend-React/src/api/auth.api.js#L14).
     - HTTP at [api/auth.api.js:15](Frontend-React/src/api/auth.api.js#L15): method `'POST'`, endpoint `\`${API_BASE_URL}/auth/signin\``, body `JSON.stringify(credentials)`.
     - Returns: `response.json()` ([api/auth.api.js:28](Frontend-React/src/api/auth.api.js#L28)).
     - Errors: `new Error(error.message || 'Sign in failed')` ([api/auth.api.js:25](Frontend-React/src/api/auth.api.js#L25)).
   - **`signUp(userData)`** at [api/auth.api.js:36](Frontend-React/src/api/auth.api.js#L36).
     - HTTP at [api/auth.api.js:37](Frontend-React/src/api/auth.api.js#L37): method `'POST'`, endpoint `\`${API_BASE_URL}/auth/signup\``, body `JSON.stringify(userData)`.
     - Returns: `response.json()` ([api/auth.api.js:50](Frontend-React/src/api/auth.api.js#L50)).
     - Errors: `new Error(error.message || 'Sign up failed')` ([api/auth.api.js:47](Frontend-React/src/api/auth.api.js#L47)).
   - **`signOut(token)`** at [api/auth.api.js:58](Frontend-React/src/api/auth.api.js#L58).
     - HTTP at [api/auth.api.js:60](Frontend-React/src/api/auth.api.js#L60): method `'POST'`, endpoint `\`${API_BASE_URL}/auth/signout\``, body `none`.
     - Returns: `response.json()` ([api/auth.api.js:72](Frontend-React/src/api/auth.api.js#L72)).
     - Errors: `new Error('Sign out failed')` ([api/auth.api.js:69](Frontend-React/src/api/auth.api.js#L69)).
   - **`verifyToken(token)`** at [api/auth.api.js:80](Frontend-React/src/api/auth.api.js#L80).
     - HTTP at [api/auth.api.js:82](Frontend-React/src/api/auth.api.js#L82): method `'GET'`, endpoint `\`${API_BASE_URL}/auth/verify\``, body `none`.
     - Returns: `response.json()` ([api/auth.api.js:93](Frontend-React/src/api/auth.api.js#L93)).
     - Errors: `new Error('Token verification failed')` ([api/auth.api.js:90](Frontend-React/src/api/auth.api.js#L90)).

## `Frontend-React/src/api/courses.api.js`

1. **File:** `courses.api.js` at `Frontend-React/src/api/courses.api.js`
2. **Functions:**
   - **`getAuthHeaders(token)`** at [api/courses.api.js:8](Frontend-React/src/api/courses.api.js#L8).
     - HTTP: no direct request; helper/alias function.
     - Returns: `{ 'Content-Type': 'application/json', 'Authorization': \`Bearer ${finalToken}\`, }` ([api/courses.api.js:10](Frontend-React/src/api/courses.api.js#L10)).
   - **`getAllCourses(filters = {}, token)`** at [api/courses.api.js:23](Frontend-React/src/api/courses.api.js#L23).
     - HTTP at [api/courses.api.js:25](Frontend-React/src/api/courses.api.js#L25): method `'GET'`, endpoint `\`${API_BASE_URL}/courses?${queryParams}\``, body `none`.
     - Returns: `response.json()` ([api/courses.api.js:34](Frontend-React/src/api/courses.api.js#L34)).
     - Errors: `new Error('Failed to fetch courses')` ([api/courses.api.js:31](Frontend-React/src/api/courses.api.js#L31)).
   - **`getCourseById(courseId, token)`** at [api/courses.api.js:43](Frontend-React/src/api/courses.api.js#L43).
     - HTTP at [api/courses.api.js:44](Frontend-React/src/api/courses.api.js#L44): method `'GET'`, endpoint `\`${API_BASE_URL}/courses/${courseId}\``, body `none`.
     - Returns: `response.json()` ([api/courses.api.js:53](Frontend-React/src/api/courses.api.js#L53)).
     - Errors: `new Error('Failed to fetch course details')` ([api/courses.api.js:50](Frontend-React/src/api/courses.api.js#L50)).
   - **`enrollInCourse(courseId, token)`** at [api/courses.api.js:62](Frontend-React/src/api/courses.api.js#L62).
     - HTTP at [api/courses.api.js:63](Frontend-React/src/api/courses.api.js#L63): method `'POST'`, endpoint `\`${API_BASE_URL}/courses/${courseId}/enroll\``, body `none`.
     - Returns: `response.json()` ([api/courses.api.js:72](Frontend-React/src/api/courses.api.js#L72)).
     - Errors: `new Error('Failed to enroll in course')` ([api/courses.api.js:69](Frontend-React/src/api/courses.api.js#L69)).
   - **`getEnrolledCourses(userId, token)`** at [api/courses.api.js:81](Frontend-React/src/api/courses.api.js#L81).
     - HTTP at [api/courses.api.js:82](Frontend-React/src/api/courses.api.js#L82): method `'GET'`, endpoint `\`${API_BASE_URL}/users/${userId}/courses\``, body `none`.
     - Returns: `response.json()` ([api/courses.api.js:91](Frontend-React/src/api/courses.api.js#L91)).
     - Errors: `new Error('Failed to fetch enrolled courses')` ([api/courses.api.js:88](Frontend-React/src/api/courses.api.js#L88)).
   - **`updateProgress(courseId, progress, token)`** at [api/courses.api.js:101](Frontend-React/src/api/courses.api.js#L101).
     - HTTP at [api/courses.api.js:102](Frontend-React/src/api/courses.api.js#L102): method `'PUT'`, endpoint `\`${API_BASE_URL}/courses/${courseId}/progress\``, body `JSON.stringify({ progress })`.
     - Returns: `response.json()` ([api/courses.api.js:112](Frontend-React/src/api/courses.api.js#L112)).
     - Errors: `new Error('Failed to update progress')` ([api/courses.api.js:109](Frontend-React/src/api/courses.api.js#L109)).
   - **`addCourse(courseData, token)`** at [api/courses.api.js:121](Frontend-React/src/api/courses.api.js#L121).
     - HTTP at [api/courses.api.js:122](Frontend-React/src/api/courses.api.js#L122): method `'POST'`, endpoint `\`${API_BASE_URL}/courses\``, body `JSON.stringify(courseData)`.
     - Returns: `response.json()` ([api/courses.api.js:132](Frontend-React/src/api/courses.api.js#L132)).
     - Errors: `new Error('Failed to add course')` ([api/courses.api.js:129](Frontend-React/src/api/courses.api.js#L129)).
   - **`getCourses(filters = {}, token)`** at [api/courses.api.js:136](Frontend-React/src/api/courses.api.js#L136).
     - HTTP: no direct request; helper/alias function.
     - Returns: `this.getAllCourses(filters, token)` ([api/courses.api.js:137](Frontend-React/src/api/courses.api.js#L137)).
   - **`enrollCourse(courseId, token)`** at [api/courses.api.js:140](Frontend-React/src/api/courses.api.js#L140).
     - HTTP: no direct request; helper/alias function.
     - Returns: `this.enrollInCourse(courseId, token)` ([api/courses.api.js:141](Frontend-React/src/api/courses.api.js#L141)).

## `Frontend-React/src/api/jobs.api.js`

1. **File:** `jobs.api.js` at `Frontend-React/src/api/jobs.api.js`
2. **Functions:**
   - **`getAuthHeaders(token)`** at [api/jobs.api.js:8](Frontend-React/src/api/jobs.api.js#L8).
     - HTTP: no direct request; helper/alias function.
     - Returns: `{ 'Content-Type': 'application/json', 'Authorization': \`Bearer ${finalToken}\`, }` ([api/jobs.api.js:10](Frontend-React/src/api/jobs.api.js#L10)).
   - **`getAllJobs(filters = {}, token)`** at [api/jobs.api.js:23](Frontend-React/src/api/jobs.api.js#L23).
     - HTTP at [api/jobs.api.js:25](Frontend-React/src/api/jobs.api.js#L25): method `'GET'`, endpoint `\`${API_BASE_URL}/jobs?${queryParams}\``, body `none`.
     - Returns: `response.json()` ([api/jobs.api.js:34](Frontend-React/src/api/jobs.api.js#L34)).
     - Errors: `new Error('Failed to fetch jobs')` ([api/jobs.api.js:31](Frontend-React/src/api/jobs.api.js#L31)).
   - **`getJobById(jobId, token)`** at [api/jobs.api.js:43](Frontend-React/src/api/jobs.api.js#L43).
     - HTTP at [api/jobs.api.js:44](Frontend-React/src/api/jobs.api.js#L44): method `'GET'`, endpoint `\`${API_BASE_URL}/jobs/${jobId}\``, body `none`.
     - Returns: `response.json()` ([api/jobs.api.js:53](Frontend-React/src/api/jobs.api.js#L53)).
     - Errors: `new Error('Failed to fetch job details')` ([api/jobs.api.js:50](Frontend-React/src/api/jobs.api.js#L50)).
   - **`createJob(jobData, token)`** at [api/jobs.api.js:62](Frontend-React/src/api/jobs.api.js#L62).
     - HTTP at [api/jobs.api.js:63](Frontend-React/src/api/jobs.api.js#L63): method `'POST'`, endpoint `\`${API_BASE_URL}/jobs\``, body `JSON.stringify(jobData)`.
     - Returns: `response.json()` ([api/jobs.api.js:73](Frontend-React/src/api/jobs.api.js#L73)).
     - Errors: `new Error('Failed to create job')` ([api/jobs.api.js:70](Frontend-React/src/api/jobs.api.js#L70)).
   - **`updateJob(jobId, jobData, token)`** at [api/jobs.api.js:83](Frontend-React/src/api/jobs.api.js#L83).
     - HTTP at [api/jobs.api.js:84](Frontend-React/src/api/jobs.api.js#L84): method `'PUT'`, endpoint `\`${API_BASE_URL}/jobs/${jobId}\``, body `JSON.stringify(jobData)`.
     - Returns: `response.json()` ([api/jobs.api.js:94](Frontend-React/src/api/jobs.api.js#L94)).
     - Errors: `new Error('Failed to update job')` ([api/jobs.api.js:91](Frontend-React/src/api/jobs.api.js#L91)).
   - **`deleteJob(jobId, token)`** at [api/jobs.api.js:103](Frontend-React/src/api/jobs.api.js#L103).
     - HTTP at [api/jobs.api.js:104](Frontend-React/src/api/jobs.api.js#L104): method `'DELETE'`, endpoint `\`${API_BASE_URL}/jobs/${jobId}\``, body `none`.
     - Returns: `response.json()` ([api/jobs.api.js:113](Frontend-React/src/api/jobs.api.js#L113)).
     - Errors: `new Error('Failed to delete job')` ([api/jobs.api.js:110](Frontend-React/src/api/jobs.api.js#L110)).
   - **`applyToJob(jobId, token)`** at [api/jobs.api.js:122](Frontend-React/src/api/jobs.api.js#L122).
     - HTTP at [api/jobs.api.js:123](Frontend-React/src/api/jobs.api.js#L123): method `'POST'`, endpoint `\`${API_BASE_URL}/jobs/${jobId}/apply\``, body `none`.
     - Returns: `response.json()` ([api/jobs.api.js:132](Frontend-React/src/api/jobs.api.js#L132)).
     - Errors: `new Error('Failed to apply to job')` ([api/jobs.api.js:129](Frontend-React/src/api/jobs.api.js#L129)).
   - **`getJobApplicants(jobId, token)`** at [api/jobs.api.js:141](Frontend-React/src/api/jobs.api.js#L141).
     - HTTP at [api/jobs.api.js:142](Frontend-React/src/api/jobs.api.js#L142): method `'GET'`, endpoint `\`${API_BASE_URL}/jobs/${jobId}/applicants\``, body `none`.
     - Returns: `response.json()` ([api/jobs.api.js:151](Frontend-React/src/api/jobs.api.js#L151)).
     - Errors: `new Error('Failed to fetch applicants')` ([api/jobs.api.js:148](Frontend-React/src/api/jobs.api.js#L148)).
   - **`approveJob(jobId, token)`** at [api/jobs.api.js:160](Frontend-React/src/api/jobs.api.js#L160).
     - HTTP at [api/jobs.api.js:161](Frontend-React/src/api/jobs.api.js#L161): method `'POST'`, endpoint `\`${API_BASE_URL}/jobs/${jobId}/approve\``, body `none`.
     - Returns: `response.json()` ([api/jobs.api.js:170](Frontend-React/src/api/jobs.api.js#L170)).
     - Errors: `new Error('Failed to approve job')` ([api/jobs.api.js:167](Frontend-React/src/api/jobs.api.js#L167)).

## `Frontend-React/src/api/resume.api.js`

1. **File:** `resume.api.js` at `Frontend-React/src/api/resume.api.js`
2. **Functions:**
   - **`getAuthHeaders(token)`** at [api/resume.api.js:8](Frontend-React/src/api/resume.api.js#L8).
     - HTTP: no direct request; helper/alias function.
     - Returns: `{ 'Authorization': \`Bearer ${finalToken}\`, }` ([api/resume.api.js:10](Frontend-React/src/api/resume.api.js#L10)).
   - **`throwApiError(response, fallbackMessage)`** at [api/resume.api.js:15](Frontend-React/src/api/resume.api.js#L15).
     - HTTP: no direct request; helper/alias function.
     - Returns: no explicit return value.
     - Errors: `error` ([api/resume.api.js:29](Frontend-React/src/api/resume.api.js#L29)).
   - **`analyzeResume(file, jobTitle, token)`** at [api/resume.api.js:40](Frontend-React/src/api/resume.api.js#L40).
     - Request preparation: `formData.append('resume', file)` ([api/resume.api.js:42](Frontend-React/src/api/resume.api.js#L42)); `formData.append('jobTitle', jobTitle)` ([api/resume.api.js:43](Frontend-React/src/api/resume.api.js#L43)).
     - HTTP at [api/resume.api.js:45](Frontend-React/src/api/resume.api.js#L45): method `'POST'`, endpoint `\`${API_BASE_URL}/resumes/analyze\``, body `formData`.
     - Returns: `response.json()` ([api/resume.api.js:55](Frontend-React/src/api/resume.api.js#L55)).
   - **`getAnalysisHistory(userId, token)`** at [api/resume.api.js:64](Frontend-React/src/api/resume.api.js#L64).
     - HTTP at [api/resume.api.js:65](Frontend-React/src/api/resume.api.js#L65): method `'GET'`, endpoint `\`${API_BASE_URL}/resume/history/${userId}\``, body `none`.
     - Returns: `response.json()` ([api/resume.api.js:77](Frontend-React/src/api/resume.api.js#L77)).
     - Errors: `new Error('Failed to fetch analysis history')` ([api/resume.api.js:74](Frontend-React/src/api/resume.api.js#L74)).
   - **`getAnalysisById(analysisId, token)`** at [api/resume.api.js:86](Frontend-React/src/api/resume.api.js#L86).
     - HTTP at [api/resume.api.js:87](Frontend-React/src/api/resume.api.js#L87): method `'GET'`, endpoint `\`${API_BASE_URL}/resumes/${analysisId}/status\``, body `none`.
     - Returns: `response.json()` ([api/resume.api.js:100](Frontend-React/src/api/resume.api.js#L100)).
   - **`createLearningPath(analysisId, token)`** at [api/resume.api.js:109](Frontend-React/src/api/resume.api.js#L109).
     - HTTP at [api/resume.api.js:110](Frontend-React/src/api/resume.api.js#L110): method `'POST'`, endpoint `\`${API_BASE_URL}/resume/learning-path\``, body `JSON.stringify({ analysisId })`.
     - Returns: `response.json()` ([api/resume.api.js:123](Frontend-React/src/api/resume.api.js#L123)).
     - Errors: `new Error('Failed to create learning path')` ([api/resume.api.js:120](Frontend-React/src/api/resume.api.js#L120)).
   - **`getRecommendedCourses(analysisId, token)`** at [api/resume.api.js:132](Frontend-React/src/api/resume.api.js#L132).
     - HTTP at [api/resume.api.js:133](Frontend-React/src/api/resume.api.js#L133): method `'GET'`, endpoint `\`${API_BASE_URL}/resume/recommendations/${analysisId}\``, body `none`.
     - Returns: `response.json()` ([api/resume.api.js:145](Frontend-React/src/api/resume.api.js#L145)).
     - Errors: `new Error('Failed to fetch recommendations')` ([api/resume.api.js:142](Frontend-React/src/api/resume.api.js#L142)).
   - **`getAnalysis(resumeId, token)`** at [api/resume.api.js:154](Frontend-React/src/api/resume.api.js#L154).
     - HTTP at [api/resume.api.js:155](Frontend-React/src/api/resume.api.js#L155): method `'GET'`, endpoint `\`${API_BASE_URL}/resume/analysis/${resumeId}\``, body `none`.
     - HTTP at [api/resume.api.js:168](Frontend-React/src/api/resume.api.js#L168): method `'GET'`, endpoint `\`${API_BASE_URL}/matches\``, body `none`.
     - Returns: `{ ...resumeData, match: matchData, extractedSkills: resumeData.normalized_skills || [], missingSkills: matchData ? matchData.missing_skills || [] : [], readinessScore: matchData ? Math.round((matchData.skill_match_sco...` ([api/resume.api.js:186](Frontend-React/src/api/resume.api.js#L186)).
     - Errors: `new Error('Failed to fetch resume status')` ([api/resume.api.js:163](Frontend-React/src/api/resume.api.js#L163)).
   - **`runMatching(resumeId, jobId, token)`** at [api/resume.api.js:202](Frontend-React/src/api/resume.api.js#L202).
     - HTTP at [api/resume.api.js:203](Frontend-React/src/api/resume.api.js#L203): method `'POST'`, endpoint `\`${API_BASE_URL}/matches/run\``, body `JSON.stringify({ resume_id: resumeId, job_id: jobId })`.
     - Returns: `response.json()` ([api/resume.api.js:216](Frontend-React/src/api/resume.api.js#L216)).
     - Errors: `new Error('Failed to run matching pipeline')` ([api/resume.api.js:213](Frontend-React/src/api/resume.api.js#L213)).
   - **`getLearningPath(analysisId, token)`** at [api/resume.api.js:219](Frontend-React/src/api/resume.api.js#L219).
     - HTTP: no direct request; helper/alias function.
     - Returns: `this.createLearningPath(analysisId, token)` ([api/resume.api.js:220](Frontend-React/src/api/resume.api.js#L220)).
   - **`getRecommendations(resumeId, token)`** at [api/resume.api.js:223](Frontend-React/src/api/resume.api.js#L223).
     - HTTP: no direct request; helper/alias function.
     - Returns: `this.getRecommendedCourses(resumeId, token)` ([api/resume.api.js:224](Frontend-React/src/api/resume.api.js#L224)).
   - **`getRoadmap(resumeId, token)`** at [api/resume.api.js:227](Frontend-React/src/api/resume.api.js#L227).
     - HTTP at [api/resume.api.js:228](Frontend-React/src/api/resume.api.js#L228): method `'GET'`, endpoint `\`${API_BASE_URL}/roadmap/${resumeId}\``, body `none`.
     - Returns: `response.json()` ([api/resume.api.js:240](Frontend-React/src/api/resume.api.js#L240)).
     - Errors: `new Error('Failed to fetch roadmap')` ([api/resume.api.js:237](Frontend-React/src/api/resume.api.js#L237)).

## `Frontend-React/src/api/users.api.js`

1. **File:** `users.api.js` at `Frontend-React/src/api/users.api.js`
2. **Functions:**
   - **`getAuthHeaders(token)`** at [api/users.api.js:8](Frontend-React/src/api/users.api.js#L8).
     - HTTP: no direct request; helper/alias function.
     - Returns: `{ 'Content-Type': 'application/json', 'Authorization': \`Bearer ${finalToken}\`, }` ([api/users.api.js:10](Frontend-React/src/api/users.api.js#L10)).
   - **`getProfile(userId, token)`** at [api/users.api.js:23](Frontend-React/src/api/users.api.js#L23).
     - HTTP at [api/users.api.js:24](Frontend-React/src/api/users.api.js#L24): method `'GET'`, endpoint `\`${API_BASE_URL}/auth/me\``, body `none`.
     - Returns: `response.json()` ([api/users.api.js:33](Frontend-React/src/api/users.api.js#L33)).
     - Errors: `new Error('Failed to fetch user profile')` ([api/users.api.js:30](Frontend-React/src/api/users.api.js#L30)).
   - **`updateProfile(userId, profileData, token)`** at [api/users.api.js:43](Frontend-React/src/api/users.api.js#L43).
     - HTTP at [api/users.api.js:44](Frontend-React/src/api/users.api.js#L44): method `'PUT'`, endpoint `\`${API_BASE_URL}/users/${userId}\``, body `JSON.stringify(profileData)`.
     - Returns: `response.json()` ([api/users.api.js:54](Frontend-React/src/api/users.api.js#L54)).
     - Errors: `new Error('Failed to update profile')` ([api/users.api.js:51](Frontend-React/src/api/users.api.js#L51)).
   - **`addSkill(userId, skillData, token)`** at [api/users.api.js:64](Frontend-React/src/api/users.api.js#L64).
     - HTTP at [api/users.api.js:70](Frontend-React/src/api/users.api.js#L70): method `'POST'`, endpoint `\`${API_BASE_URL}/skills/me\``, body `JSON.stringify(payload)`.
     - Returns: `response.json()` ([api/users.api.js:80](Frontend-React/src/api/users.api.js#L80)).
     - Errors: `new Error('Failed to add skill')` ([api/users.api.js:77](Frontend-React/src/api/users.api.js#L77)).
   - **`updateGoals(userId, goals, token)`** at [api/users.api.js:90](Frontend-React/src/api/users.api.js#L90).
     - HTTP at [api/users.api.js:91](Frontend-React/src/api/users.api.js#L91): method `'PUT'`, endpoint `\`${API_BASE_URL}/users/${userId}/goals\``, body `JSON.stringify({ goals })`.
     - Returns: `response.json()` ([api/users.api.js:101](Frontend-React/src/api/users.api.js#L101)).
     - Errors: `new Error('Failed to update goals')` ([api/users.api.js:98](Frontend-React/src/api/users.api.js#L98)).
   - **`getSavedJobs(userId, token)`** at [api/users.api.js:110](Frontend-React/src/api/users.api.js#L110).
     - HTTP at [api/users.api.js:111](Frontend-React/src/api/users.api.js#L111): method `'GET'`, endpoint `\`${API_BASE_URL}/users/${userId}/saved-jobs\``, body `none`.
     - Returns: `response.json()` ([api/users.api.js:120](Frontend-React/src/api/users.api.js#L120)).
     - Errors: `new Error('Failed to fetch saved jobs')` ([api/users.api.js:117](Frontend-React/src/api/users.api.js#L117)).
   - **`saveJob(userId, jobId, token)`** at [api/users.api.js:130](Frontend-React/src/api/users.api.js#L130).
     - HTTP at [api/users.api.js:131](Frontend-React/src/api/users.api.js#L131): method `'POST'`, endpoint `\`${API_BASE_URL}/users/${userId}/saved-jobs\``, body `JSON.stringify({ jobId })`.
     - Returns: `response.json()` ([api/users.api.js:141](Frontend-React/src/api/users.api.js#L141)).
     - Errors: `new Error('Failed to save job')` ([api/users.api.js:138](Frontend-React/src/api/users.api.js#L138)).
   - **`removeSavedJob(userId, jobId, token)`** at [api/users.api.js:151](Frontend-React/src/api/users.api.js#L151).
     - HTTP at [api/users.api.js:152](Frontend-React/src/api/users.api.js#L152): method `'DELETE'`, endpoint `\`${API_BASE_URL}/users/${userId}/saved-jobs/${jobId}\``, body `none`.
     - Returns: `response.json()` ([api/users.api.js:161](Frontend-React/src/api/users.api.js#L161)).
     - Errors: `new Error('Failed to remove saved job')` ([api/users.api.js:158](Frontend-React/src/api/users.api.js#L158)).
   - **`getSkills(token)`** at [api/users.api.js:169](Frontend-React/src/api/users.api.js#L169).
     - HTTP at [api/users.api.js:170](Frontend-React/src/api/users.api.js#L170): method `'GET'`, endpoint `\`${API_BASE_URL}/skills/me\``, body `none`.
     - Returns: `response.json()` ([api/users.api.js:179](Frontend-React/src/api/users.api.js#L179)).
     - Errors: `new Error('Failed to fetch user skills')` ([api/users.api.js:176](Frontend-React/src/api/users.api.js#L176)).

## Coverage Verification

- Target files documented: **80**.
- Component files: **73**.
- Context files: **1**.
- API files: **6**.
- Pages directory: **absent**.

