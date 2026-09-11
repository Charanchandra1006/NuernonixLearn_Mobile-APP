# NueronixLearn — Full Project Blueprint for Android Rebuild

> This document is the **single source of truth** for rebuilding the entire NueronixLearn platform as a native Android application in Android Studio. Every feature, every API endpoint, every data model, every design token, and every security mechanism is documented here in exhaustive detail.

---

## TABLE OF CONTENTS

1. [Project Overview & Mission](#1-project-overview--mission)
2. [Current Tech Stack (Web)](#2-current-tech-stack-web)
3. [Proposed Android Tech Stack](#3-proposed-android-tech-stack)
4. [Design System & UI Specification](#4-design-system--ui-specification)
5. [Application Architecture](#5-application-architecture)
6. [User Roles & Access Control](#6-user-roles--access-control)
7. [Screen-by-Screen Specification](#7-screen-by-screen-specification)
8. [Data Models (MongoDB Schemas)](#8-data-models-mongodb-schemas)
9. [Backend API Reference](#9-backend-api-reference)
10. [AI & ML Systems](#10-ai--ml-systems)
11. [Security Architecture](#11-security-architecture)
12. [Environment Variables & Configuration](#12-environment-variables--configuration)
13. [Android Project Structure](#13-android-project-structure)
14. [Navigation Graph](#14-navigation-graph)

---

## 1. Project Overview & Mission

**NueronixLearn** is a full-stack, AI-powered adaptive learning platform targeted primarily at Indian students preparing for board exams, JEE, NEET, and skill development. It adapts to each learner's pace, detects weak topics, tracks cognitive load, and provides an AI-powered chatbot tutor.

### Core User Journeys
1. **Student** signs up → Onboarding (selects subjects, weak areas, goals, pace) → AI generates a personalized Study Plan (roadmap) → Student studies topic modules, takes quizzes, chats with NeuroBot AI, writes in a Diary, and tracks progress on Dashboard.
2. **Teacher** signs up → Creates Courses & Exams → Monitors student performance via Teacher Dashboard.
3. **Admin** logs in via `/admin-login` (separate credential system) → Full control over users, courses, exams and platform analytics via Admin Panel.

---

## 2. Current Tech Stack (Web)

### Frontend (nueronixlearn-fn)
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite 5
- **UI Library**: Material-UI (MUI) v5 with Emotion
- **Routing**: React Router DOM v6
- **State Management**: React Context API (`AuthContext`, `ThemeContext`)
- **HTTP Client**: Axios (with JWT interceptor + silent refresh)
- **Animations**: Framer Motion + GSAP + Three.js (3D particles)
- **Charts**: Recharts
- **PWA Support**: `vite-plugin-pwa`
- **Deployment**: Vercel

### Backend (nueronixlearn-bn)
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (jsonwebtoken) — 30d expiry, Bearer token
- **Password Hashing**: bcryptjs (salt rounds: 12)
- **Validation**: Joi
- **Security**: Helmet, XSS-Clean, express-rate-limit, CORS
- **AI Provider**: Google Gemini API (`gemini-2.0-flash` model)
- **ML/NLP**: TensorFlow.js, @xenova/transformers
- **File Handling**: Multer (PDF uploads)
- **YouTube**: YouTube Data API v3 (for curated learning videos)
- **Deployment**: Vercel (serverless functions in `api/` directory)

---

## 3. Proposed Android Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Language | **Kotlin** | Primary language |
| UI | **Jetpack Compose** | Declarative, native UI matching web design |
| Architecture | **MVVM + Clean Architecture** | ViewModels, UseCases, Repositories |
| Navigation | **Navigation Component (Compose)** | Replaces React Router |
| DI | **Hilt** | Dependency injection |
| Networking | **Retrofit 2 + OkHttp 3** | HTTP Client replacing Axios |
| Auth Token | **EncryptedSharedPreferences** | Secure JWT storage replacing localStorage |
| State | **StateFlow + ViewModel** | Replaces React Context |
| Database | **Room** | Local caching |
| Images | **Coil** | Image loading |
| Charts | **Vico** | Replaces Recharts |
| AI Chatbot | **Backend API calls** (Keep Google Gemini on server) | Same API endpoints |
| PDF | **iText7** or **Android PdfDocument** | PDF support |
| Build | **Gradle Kotlin DSL** | Build system |
| Min SDK | **API 26 (Android 8.0)** | |
| Target SDK | **API 34 (Android 14)** | |

---

## 4. Design System & UI Specification

### 4.1 Color Palette

The entire platform uses a **Green-on-Black** aesthetic, supporting both **Dark Mode** (default) and **Light Mode**.

| Token | Dark Mode | Light Mode | Usage |
|---|---|---|---|
| `PRIMARY` | `#2E7D32` | `#2E7D32` | Buttons, accent, active states |
| `PRIMARY_LIGHT` | `#4CAF50` | `#4CAF50` | Hover, chip colors |
| `PRIMARY_DARK` | `#1B5E20` | `#1B5E20` | Button press/hover |
| `BACKGROUND` | `#000000` | `#FFFFFF` | App background |
| `SURFACE` / Paper | `#0A0A0A` | `#FAFAFA` | Cards, drawers, dialogs |
| `BORDER` | `#1a1a1a` | `#e0e0e0` | Card/drawer borders |
| `TEXT_PRIMARY` | `#FFFFFF` | `#000000` | Main text |
| `TEXT_SECONDARY` | `#B0B0B0` | `#5C6370` | Subtitles, captions |
| `ERROR` | `#D32F2F` | `#D32F2F` | Error states |
| `WARNING` | `#F57C00` | `#F57C00` | Warning badges |
| `SUCCESS` | `#2E7D32` | `#2E7D32` | Success states |
| `CHIP_BACKGROUND_DARK` | `rgba(255,255,255,0.05)` | `rgba(0,0,0,0.04)` | Chip/tag bg |
| `SCROLLBAR` | `#333` on `#0A0A0A` | `#ccc` on `#f0f0f0` | Scrollbars |

**Compose MaterialTheme implementation:**
```kotlin
// Color.kt
val PrimaryGreen = Color(0xFF2E7D32)
val PrimaryGreenLight = Color(0xFF4CAF50)
val PrimaryGreenDark = Color(0xFF1B5E20)
val BackgroundDark = Color(0xFF000000)
val SurfaceDark = Color(0xFF0A0A0A)
val BorderDark = Color(0xFF1A1A1A)
val ErrorRed = Color(0xFFD32F2F)
val WarningOrange = Color(0xFFF57C00)
```

### 4.2 Typography

| Style | Weight | Size | Letter Spacing | Android SP |
|---|---|---|---|---|
| h1 | Bold (700) | 2.75rem | -0.02em | 44sp |
| h2 | Bold (700) | 2.25rem | -0.01em | 36sp |
| h3 | SemiBold (600) | 1.875rem | — | 30sp |
| h4 | SemiBold (600) | 1.5rem | — | 24sp |
| h5 | SemiBold (600) | 1.25rem | — | 20sp |
| h6 | SemiBold (600) | 1.125rem | — | 18sp |
| body1 | Regular (400) | 1.05rem | — | 17sp |
| body2 | Regular (400) | 0.95rem | — | 15sp |
| button | SemiBold (600) | 1rem | NONE | 16sp |
| caption | Regular (400) | 0.85rem | — | 13sp |

**Font**: Inter (from Google Fonts). Import `font_inter_regular`, `font_inter_medium`, `font_inter_semibold`, `font_inter_bold` into `res/font/`.

### 4.3 Component Styles

#### Buttons
- Border radius: **8dp**
- Padding: **12dp vertical, 24dp horizontal**
- No shadow (`elevation = 0`)
- Hover → `translateY(-1px)` → use `animateFloatAsState` for Android scale animation
- Contained: `backgroundColor = PrimaryGreen`, text = White
- Outlined: border = `BorderDark/CCC`, hover = PrimaryGreen border

#### Cards
- Border radius: **12dp**
- Dark: `background = #0A0A0A`, border = `1dp #1a1a1a`, shadow: `rgba(0,0,0,0.5) 2px 8px`
- Light: `background = #FFFFFF`, border = `1dp #e0e0e0`, shadow: `rgba(0,0,0,0.1) 2px 8px`
- Hover → lift by `2dp` (use `animateFloatAsState` elevation)

#### Input Fields
- Border radius: **8dp**
- Focused border: `PrimaryGreen, 2dp width`
- Focused label: `PrimaryGreen, FontWeight.SemiBold`

#### Chips / Tags
- Border radius: **6dp**
- Font weight: 600, Size: 13sp

#### Dialogs / Bottom Sheets
- Border radius: **16dp**
- Border: `1dp #1a1a1a` (dark)

#### Progress Bars
- Height: **8dp**
- Border radius: **4dp**
- Fill color: `PrimaryGreen`

#### Tabs
- Indicator: **3dp** height, `PrimaryGreen`, rounded top corners
- Selected label: `PrimaryGreen`

---

## 5. Application Architecture

```
NueronixLearn Android
│
├── data/
│   ├── remote/
│   │   ├── api/           ← Retrofit service interfaces (one per domain)
│   │   └── dto/           ← Data Transfer Objects matching backend JSON
│   ├── local/
│   │   ├── db/            ← Room database, DAOs, entities
│   │   └── prefs/         ← EncryptedSharedPreferences (JWT token)
│   └── repository/        ← Repository implementations
│
├── domain/
│   ├── model/             ← Pure domain models (no Android deps)
│   └── usecase/           ← Single-responsibility use cases
│
├── ui/
│   ├── theme/             ← Color, Typography, Theme.kt
│   ├── navigation/        ← NavHost, NavGraph, Destinations
│   ├── components/        ← Reusable composables
│   └── screens/
│       ├── auth/          ← Login, Register, Onboarding
│       ├── dashboard/     ← Student Dashboard
│       ├── courses/       ← Course list, detail, learn
│       ├── studyplan/     ← Study Plan / Roadmap
│       ├── exams/         ← Exam list, take exam
│       ├── diary/         ← Diary entries
│       ├── chatbot/       ← NeuroBot AI chat
│       ├── profile/       ← Profile settings
│       ├── teacher/       ← Teacher dashboard, create course/exam
│       └── admin/         ← Admin panel
│
└── di/                    ← Hilt modules (NetworkModule, DatabaseModule)
```

---

## 6. User Roles & Access Control

| Role | How Registered | Access |
|---|---|---|
| `student` | Default registration via `/register` | Dashboard, Courses, Learn, Diary, Study Plan, Exams, Profile, NeuroBot |
| `teacher` | Select "Register as Teacher" during registration | Teacher Dashboard, Create Course, Create Exam, Teacher Exam List |
| `admin` | Seeded via `seed-admin.ts` script; logs in via `/admin-login` | Admin Panel (full control), separate JWT flow (`adminToken`) |

### Auth Flow
- All routes (except Landing, Login, Register, Courses list, Course Detail, Admin Login) require a **valid JWT** in `Authorization: Bearer <token>` header.
- Token expiry: **30 days**
- On 401 response → silent refresh via `POST /api/auth/refresh` → retry original request → on refresh failure, redirect to login.
- Admin token is stored separately from regular user token.

### Android Implementation
```kotlin
// TokenManager.kt (EncryptedSharedPreferences)
const val KEY_TOKEN = "auth_token"
const val KEY_ADMIN_TOKEN = "admin_token"
const val KEY_USER_ROLE = "user_role"
const val KEY_ONBOARDING_DONE = "onboarding_completed"
```

---

## 7. Screen-by-Screen Specification

### 7.1 Landing Page (`/`)
**Purpose**: Marketing/public page.
**Sections**:
- Hero section with animated text and CTA (Get Started → `/register`, Explore Courses → `/courses`)
- Animated particle background (Three.js on web → `Canvas` + custom Compose animation on Android)
- Features grid: "AI-Powered Learning", "Adaptive Quizzes", "Cognitive Load Tracking", "Study Plans"
- Stats row: "10,000+ Students", "500+ Courses", "50+ Expert Teachers"
- How it works: 3-step process illustration
- CTA Banner → Register

**Android Note**: This can be simplified to a polished splash/intro screen with pager (similar to an onboarding intro), as it primarily serves SEO on web.

---

### 7.2 Register Screen (`/register`)
**Fields**:
- Name (text)
- Email (email)
- Password (min 6 chars) + show/hide toggle
- Phone (optional)
- Role selection: Student / Teacher (radio or segmented button)
- [Student only] Learning Pace: Slow / Moderate / Fast
- [Student only] Experience Level: Beginner / Intermediate / Professional
- [Student only] Subjects (multi-select chips): Mathematics, Physics, Chemistry, Biology, English, Computer Science, History, Geography, Economics, Business Studies

**API Call**: `POST /api/auth/register`
**On success**: Store JWT, navigate to `/onboarding` (student) or `/teacher` (teacher).

**OTP Registration Alternative Flow** (also supported by backend):
1. `POST /api/auth/send-otp` → receives OTP by email
2. `POST /api/auth/verify-otp-register` → verifies OTP and creates account

---

### 7.3 Login Screen (`/login`)
**Fields**:
- Email
- Password

**API Call**: `POST /api/auth/login`
**On success**: Navigate to `/dashboard` (student) or `/teacher` (teacher).

**Password-less OTP Login Flow**:
1. `POST /api/auth/send-login-otp` → user receives OTP
2. `POST /api/auth/verify-otp-login` → returns token

---

### 7.4 Onboarding Screen (`/onboarding`)
**Guard**: Only shown if `user.onboardingCompleted === false` AND role is `student`. Teachers are redirected immediately to `/teacher`.

**Multi-step wizard** (5 steps):
1. **Step 1 – Grade Selection**: Which grade/standard are you in?
2. **Step 2 – Subject Interests**: Multi-select from: Mathematics, Physics, Chemistry, Biology, English, Computer Science, History, Geography, Economics, Business Studies
3. **Step 3 – Weak Areas**: Same list, multi-select. Weak areas get auto-seeded into Study Plan + WeakTopics.
4. **Step 4 – Learning Goals**: Multi-select: Board Exams, JEE, NEET, Certification, Skill Improvement, Knowledge Exploration, Career
5. **Step 5 – Learning Preferences**: 
   - Learning Style: Video / Text / Practice / Interactive / Mixed
   - Pace: Slow / Medium / Fast
   - Performance Level: Below Average / Average / Above Average / Excellent
   - Language: en (default)

**API Call**: `PUT /api/auth/complete-onboarding` (sends all profile data)
**On success**: Navigate to `/dashboard`. Backend auto-seeds Study Plan roadmap using Gemini AI for each selected subject.

---

### 7.5 Student Dashboard (`/dashboard`)
**API Calls**: 
- `GET /api/analytics/dashboard` → returns `{ streak, totalCourses, completedCourses, totalXP, level, badges, cognitiveLoad, dailyProgress }`
- `GET /api/ai/recommendation` → returns AI-generated next step recommendation

**Sections**:

#### Stats Cards (horizontal scroll on mobile)
- Current Streak (days with flame icon)
- XP Points (gamification)
- Level badge
- Courses Completed / Total Enrolled
- Cognitive Load Score (0-100, lower is better)

#### AI Recommendation Banner
Displays 1-2 sentence Gemini-generated recommendation based on user's weak topics, strong topics, and learning history.

#### Weekly Progress Chart
Bar chart with daily study time (from `GET /api/analytics/daily-progress`). Use **Vico** library on Android.

#### Performance Chart
Radar/spider chart of subject performance. Vico MPAndroidChart.

#### Cognitive Load Gauge
Circular progress indicator. Green = low load, Orange = medium, Red = high load.

#### Recent Activity / Next Up
List of recently studied topics + recommended next topic.

---

### 7.6 Courses Screen (`/courses`)
**Purpose**: Browse/search all published courses. No authentication required.

**API Call**: `GET /api/courses?category=X&difficulty=X&search=X&page=N&sort=X`

**Filters** (bottom sheet on Android):
- Category (dynamic from `GET /api/courses/categories`)
- Difficulty: All / Beginner / Intermediate / Advanced
- Sort: Newest / Rating / Most Enrolled

**Course Card shows**:
- Thumbnail image (Coil loading)
- Title
- Instructor name
- Difficulty badge chip
- Rating (stars)
- Enrolled count
- Price (or "Free" badge)
- Duration (in hours/minutes)

---

### 7.7 Course Detail Screen (`/courses/:id`)
**API Call**: `GET /api/courses/:id`

**Sections**:
- Hero: Thumbnail, title, instructor, rating breakdown, enrolled count
- Short description + "What You'll Learn" bullet list
- Requirements
- Module list (accordion/expandable, shows module title, type icon, duration)
- Assessments list
- Reviews section
- Sticky CTA: "Enroll Now" button → `POST /api/courses/:id/enroll`

---

### 7.8 Learn Screen (`/learn/:courseId`)
**Purpose**: Actual learning experience inside a course.
**API Calls**:
- `GET /api/learn/next/:courseId` → next module to study
- `POST /api/learn/progress` → mark progress (completed, time spent)
- `POST /api/learn/submit-answer` → for quiz modules

**Module Types**:
- `video`: Embed video player with `videoUrl`
- `text`: Markdown/HTML content renderer
- `quiz`: Question list with multiple choice interaction
- `interactive`: Custom content

**Android**: Use `ExoPlayer` for video, custom Compose text renderer for markdown.

---

### 7.9 Study Plan Screen (`/study-plan`)
**Purpose**: Personalized AI-generated learning roadmap per subject.
**API Calls**:
- `GET /api/topics/subjects` → list of all subjects the user has added
- `GET /api/topics/roadmap/:subject` → complete AI-generated roadmap for that subject
- `POST /api/topics/complete-topic` → mark a topic completed
- `POST /api/topics/complete-subtopic` → mark a subtopic completed
- `POST /api/topics/add-subject` → adds a new subject and triggers Gemini to generate its roadmap
- `GET /api/topics/subtopics/:subject/:topicTitle` → get subtopics for a topic
- `GET /api/topics/resources/:subject/:topic` → get curated YouTube videos + resources
- `DELETE /api/topics/subject/:id` → remove a subject

**Roadmap Structure** (returned by backend):
```json
{
  "subject": "Mathematics",
  "topics": [
    {
      "title": "Algebra",
      "subtopics": ["Variables", "Equations", "Inequalities"],
      "completed": false
    }
  ]
}
```

**Android UI**:
- Tabs at top (one per subject)
- Vertical timeline/roadmap view
- Each topic = expandable card with subtopics
- Checkboxes to mark completion
- Green checkmark = done, grey = pending
- Progress bar per subject (% completed)
- FAB: "+ Add Subject"
- Resources button on each topic → bottom sheet with YouTube video thumbnails + links

---

### 7.10 Exams Screen (`/exams`)
**API Calls**:
- `GET /api/exams` → list of available exams
- `GET /api/exams/:id` → exam detail
- `POST /api/exams/:id/start` → start an exam session
- `POST /api/exams/:id/submit` → submit answers
- `GET /api/exams/:id/results` → view results

**Exam Taking Flow**:
- Timer countdown (from `exam.timeLimit` in minutes)
- Question progress indicator
- Single question shown at a time
- Multiple choice (tap to select)
- Next/Previous navigation
- Submit button
- Results screen: Score, passing status, question review

---

### 7.11 Diary Screen (`/diary`)
**Purpose**: Private, password-protected personal journal.
**API Calls**:
- `GET /api/diary/status` → is diary locked?
- `POST /api/diary/unlock` → unlock with password
- `POST /api/diary/lock` → lock diary
- `GET /api/diary/entries` → list entries (paginated, filter by mood/tag)
- `POST /api/diary/entries` → create entry
- `PUT /api/diary/entries/:id` → edit entry
- `DELETE /api/diary/entries/:id` → delete entry
- `POST /api/diary/change-password` → change diary password

**Entry Fields**:
- Title
- Content (rich text)
- Mood (enum: happy, sad, motivated, anxious, neutral, excited, frustrated)
- Tags (string array)
- Created at timestamp

**Android UI**:
- Lock screen with PIN/password entry before showing entries
- Entry list with mood icons, date, snippet
- Detail view with full content
- FAB: "+ New Entry"
- Mood selector (emoji/icon picker)

---

### 7.12 Profile Screen (`/profile`)
**API Calls**:
- `GET /api/auth/me` → current user data
- `PUT /api/auth/profile` → update profile
- `PUT /api/auth/avatar` → update avatar (base64, max 2MB)
- `PUT /api/auth/phone` → update phone

**Sections**:
- Avatar (circular, tap to change → camera/gallery)
- Name, Email, Phone
- Student Profile: Level, XP, Badges, Subscription Plan
- Learning Preferences (editable)
- Learning Goals (editable chips)
- Streak info, Total Time Spent
- Logout button

---

### 7.13 NeuroBot AI Chatbot
**Purpose**: Always-available floating AI tutor (web: FAB in corner; Android: dedicated full screen + bottom nav icon).

**API Calls**:
- `GET /api/chatbot/greeting` → personalized greeting
- `POST /api/chatbot/chat` → send message, get AI response (rate limited: 30/15min)
- `GET /api/chatbot/suggestion` → AI suggests a topic to study
- `GET /api/chatbot/context` → get chat context
- `POST /api/chatbot/clear-context` → clear conversation

**NeuroBot Features**:
- Streaming response support (Gemini streaming via SSE on web; Retrofit streaming on Android)
- Context-aware: knows user's weak topics, strong topics, learning history
- Weak topic detection from chat (when user asks about a topic repeatedly → offers to add to weak topics)
- Suggests YouTube videos for weak topics
- Manages ToDo list from identified weak topics

**Android UI**:
- Full screen chat UI (similar to WhatsApp)
- User bubble: right-aligned, green background
- NeuroBot bubble: left-aligned, dark card
- Typing indicator (animated dots)
- Quick suggestions row below input
- Input bar with send button

---

### 7.14 Teacher Dashboard (`/teacher`)
**API Calls**:
- `GET /api/courses/teacher` → teacher's own courses
- `GET /api/analytics/performance` → aggregate data

**Sections**:
- Welcome header with name
- Stats: Total Courses, Total Students, Average Rating
- Course list with edit/delete actions
- Quick action buttons: "Create Course", "Create Exam", "My Exams"

---

### 7.15 Create Course Screen (`/teacher/create-course`)
**Multi-section form**:
1. Basic Info: Title, Short Description, Full Description, Category, Subcategory, Difficulty, Language, Tags (chips)
2. Content: Modules (add/remove/reorder list)
   - Each module: Title, Type (video/text/quiz/interactive), Duration, Content/VideoUrl, Concepts
3. Assessments: Add quiz with questions
   - Question: Text, Type (multiple_choice/short_answer), Options (if MC), Correct Answer, Explanation, Difficulty, Points
4. Settings: Price, Is Free toggle, Max Students, Start/End dates, Certificate enabled toggle, Enrollment Type
5. What You'll Learn (list of bullet points)
6. Requirements (list)
7. Thumbnail upload (base64)

**API Calls**:
- `POST /api/courses` → create
- `PUT /api/courses/:id` → edit (same form, pre-filled)

---

### 7.16 Admin Panel (`/admin`)
**Separate auth**: Logs in via `POST /api/admin/login` using `username` + `password` (not email). Stores `adminToken` separately.

**Sections (Tab navigation)**:
1. **Dashboard**: Platform stats → `GET /api/admin/stats` 
   - Total users, teachers, students
   - Total courses (published, unpublished)
   - Total exams
   - New signups today/week/month
   
2. **Users**: Table of all users → `GET /api/admin/users`
   - Columns: Name, Email, Role, Status, Joined
   - Actions: Change role, Block/Unblock, Delete, View detail
   - Search + filter by role
   
3. **Courses**: Table of all courses → `GET /api/admin/courses`
   - Actions: Feature/Unfeature, Delete
   
4. **Exams**: Table of all exams → `GET /api/admin/exams`
   - Actions: Delete
   
5. **Analytics**: Charts for platform growth → `GET /api/admin/analytics`
   - User signups over time
   - Active users
   - Course enrollments

---

## 8. Data Models (MongoDB Schemas)

### 8.1 User
```typescript
{
  email: string (unique, lowercase, required)
  password: string (bcrypt hashed, salt=12)
  phone?: string
  phoneVerified: boolean (default: false)
  name: string (required)
  role: 'student' | 'teacher' | 'admin' (default: 'student')
  avatar?: string  // base64 data-URL, max ~2MB
  
  profile: {
    grade?: string
    subjectInterests: string[]
    weakAreas: string[]
    preferredLearningStyle: 'video' | 'text' | 'practice' | 'interactive' | 'mixed'
    learningGoals: ('board_exams' | 'jee' | 'neet' | 'certification' | 'skill_improvement' | 'knowledge_exploration' | 'career')[]
    currentPerformanceLevel: 'below_average' | 'average' | 'above_average' | 'excellent'
    pacePreference: 'slow' | 'medium' | 'fast'
    languagePreference: string (default: 'en')
    targetExamDate?: Date
  }
  
  teacherProfile?: {
    qualifications: string[]
    expertise: string[]
    experienceYears: number
    hourlyRate: number
    totalStudents: number
    totalCourses: number
    averageRating: number
    totalRatings: number
    bio: string
    linkedIn?: string
    website?: string
    isVerified: boolean
    featured: boolean
  }
  
  studentProfile?: {
    educationLevel: string
    targetGoals: string[]
    learningStreak: number
    totalXP: number
    level: number (default: 1)
    badges: string[]
    completedPaths: string[]
    subscriptionPlan: 'free' | 'premium' | 'enterprise'
    subscriptionExpiry?: Date
  }
  
  cognitiveLoad: number (0-100, default: 50)
  preferences: Record<string, any>
  progress: {
    courses: [{ courseId: ObjectId, completed: boolean, score: number }]
    currentStreak: number
    totalTimeSpent: number
  }
  intent: 'skill_improvement' | 'topic_exploration' | 'certification_preparation' | 'enrollment_readiness' | null
  onboardingCompleted: boolean (default: false)
  isActive: boolean (default: true)
  lastLogin: Date
  timestamps: true (createdAt, updatedAt auto-managed)
}
```

### 8.2 Course
```typescript
{
  title: string (required)
  description: string (required)
  shortDescription: string
  instructor: ObjectId → User (required)
  thumbnail: string (base64/URL)
  previewVideo?: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  category: string
  subcategory?: string
  tags: string[]
  concepts: string[]
  
  modules: [{
    title: string
    content: string
    type: 'video' | 'text' | 'quiz' | 'interactive'
    duration: number (minutes)
    order: number
    concepts: string[]
    videoUrl?: string
    resources?: [{ title: string, url: string, type: string }]
  }]
  
  assessments: [{
    title: string
    description: string
    questions: [{
      text: string
      type: 'multiple_choice' | 'short_answer' | 'essay' | 'code'
      options?: string[]
      correctAnswer: string
      explanation: string
      concepts: string[]
      difficulty: 'easy' | 'medium' | 'hard'
      points: number
    }]
    passingScore: number (default: 70)
    timeLimit: number (minutes, default: 60)
    shuffleQuestions: boolean
    showResults: boolean
  }]
  
  prerequisites: ObjectId[] → Course[]
  price: number (default: 0)
  discountedPrice?: number
  currency: string (default: 'USD')
  isFree: boolean
  isPublished: boolean
  isFeatured: boolean
  language: string
  duration: number (total minutes)
  enrolledCount: number
  rating: number (avg)
  totalRatings: number
  reviews: [{ userId: ObjectId, rating: number, comment: string, createdAt: Date }]
  whatYouWillLearn: string[]
  requirements: string[]
  certificateEnabled: boolean
  enrollmentType: 'open' | 'approval' | 'paid'
  maxStudents?: number
  startDate?: Date
  endDate?: Date
  timestamps: true
}
```

### 8.3 Exam
```typescript
{
  title: string
  description: string
  subject: string
  teacher: ObjectId → User
  questions: [{
    text: string
    type: 'multiple_choice' | 'true_false' | 'short_answer'
    options?: string[]
    correctAnswer: string
    points: number
    explanation?: string
  }]
  duration: number (minutes)
  totalPoints: number
  passingScore: number
  isPublished: boolean
  startTime?: Date
  endTime?: Date
  allowedAttempts: number (default: 1)
  submissions: [{
    studentId: ObjectId
    answers: [{ questionId: ObjectId, answer: string }]
    score: number
    startedAt: Date
    submittedAt: Date
    passed: boolean
  }]
  timestamps: true
}
```

### 8.4 Diary Entry
```typescript
{
  userId: ObjectId → User
  title: string
  content: string
  mood: 'happy' | 'sad' | 'motivated' | 'anxious' | 'neutral' | 'excited' | 'frustrated'
  tags: string[]
  isLocked: boolean
  password?: string (hashed)
  timestamps: true
}
```

### 8.5 LearningProfile
```typescript
{
  userId: ObjectId → User (unique)
  learningPace: 'slow' | 'medium' | 'fast'
  experienceLevel: 'beginner' | 'intermediate' | 'advanced'
  subjects: string[]
  strongTopics: string[] (format: "subject:topic")
  weakTopics: string[] (format: "subject:topic")
  completedTopics: string[] (format: "subject:topic")
  recommendedTopics: string[]
  timestamps: true
}
```

### 8.6 WeakTopic
```typescript
{
  userId: ObjectId → User
  topicName: string
  subject: string (lowercase)
  completed: boolean (default: false)
  source: 'onboarding' | 'chatbot' | 'quiz' | 'manual'
  timestamps: true
}
```

### 8.7 UserBehavior / UserLearningBehavior
```typescript
{
  userId: ObjectId → User
  subject: string
  topic: string
  timeSpent: number (seconds)
  quizScore: number (0-100)
  attempts: number
  completed: boolean
  lastStudied: Date
  timestamps: true
}
```

### 8.8 SessionLog
```typescript
{
  userId: ObjectId → User
  startTime: Date
  endTime: Date
  duration: number (minutes)
  activity: string
  metadata: Record<string, any>
  timestamps: true
}
```

### 8.9 Roadmap / StudyPlan (TopicLibrary)
```typescript
{
  userId: ObjectId → User
  subject: string
  topics: [{
    title: string
    completed: boolean
    subtopics: [{
      title: string
      completed: boolean
    }]
  }]
  generatedBy: 'ai' | 'manual'
  timestamps: true
}
```

### 8.10 Admin
```typescript
{
  username: string (unique)
  email: string (unique)
  password: string (bcrypt hashed)
  isSuperAdmin: boolean
  permissions: {
    manageUsers: boolean
    manageCourses: boolean
    manageExams: boolean
    manageAdmins: boolean
    viewAnalytics: boolean
    manageContent: boolean
  }
  lastLogin: Date
  timestamps: true
}
```

### 8.11 UserTodo
```typescript
{
  userId: ObjectId → User
  subject: string
  topicName: string
  subtopicName: string
  completed: boolean (default: false)
  order: number
  timestamps: true
}
```

---

## 9. Backend API Reference

Base URL: `https://your-backend.vercel.app` (or `/api` in dev via Vite proxy)

### 9.1 Authentication `/api/auth`

| Method | Path | Auth | Body | Response |
|---|---|---|---|---|
| POST | `/register` | No | `{ email, password, name, phone?, role?, learningPace?, experienceLevel?, subjects? }` | `{ token, user }` |
| POST | `/login` | No | `{ email, password }` | `{ token, user }` |
| GET | `/me` | Bearer | — | `{ user }` |
| POST | `/refresh` | Bearer | — | `{ token }` |
| PUT | `/profile` | Bearer | Profile object | `{ user }` |
| PUT | `/avatar` | Bearer | `{ avatar: "data:image/...;base64,..." }` | `{ user }` |
| PUT | `/phone` | Bearer | `{ phone }` | `{ phone, phoneVerified }` |
| PUT | `/complete-onboarding` | Bearer | Full profile data | `{ user }` |
| POST | `/send-otp` | No | `{ email }` | `{ message }` |
| POST | `/verify-otp-register` | No | `{ email, otp, name, password, role }` | `{ token, user }` |
| POST | `/send-login-otp` | No | `{ email }` | `{ message }` |
| POST | `/verify-otp-login` | No | `{ email, otp }` | `{ token, user }` |

### 9.2 Courses `/api/courses`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | No | Query: `category, difficulty, search, page, sort` |
| GET | `/featured` | No | Returns featured courses |
| GET | `/categories` | No | Distinct categories |
| GET | `/my-courses` | Bearer | Student's enrolled courses |
| GET | `/teacher` | Bearer (teacher) | Teacher's own courses |
| GET | `/:id` | No | Full course detail |
| POST | `/` | Bearer (teacher) | Create course |
| PUT | `/:id` | Bearer (teacher) | Edit course |
| DELETE | `/:id` | Bearer (teacher) | Delete course |
| POST | `/:id/enroll` | Bearer (student) | Enroll in course |
| POST | `/:id/review` | Bearer | Submit review `{ rating, comment }` |

### 9.3 Learning `/api/learn`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/next/:courseId` | Bearer | Next unfinished module |
| POST | `/progress` | Bearer | `{ courseId, moduleId, completed?, timeSpent? }` |
| POST | `/submit-answer` | Bearer | `{ courseId, assessmentId, questionId, answer }` |
| GET | `/progress/:courseId` | Bearer | Current progress for course |

### 9.4 Analytics `/api/analytics`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/dashboard` | Bearer | All dashboard stats |
| GET | `/performance` | Bearer | Subject performance breakdown |
| GET | `/cognitive-load` | Bearer | Cognitive load history |
| GET | `/daily-progress` | Bearer | Last 7 days activity chart data |

### 9.5 Machine Learning `/api/ml`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/recommendations` | Bearer | Course recommendations |
| POST | `/feedback` | Bearer | `{ feedback, type, courseId? }` |
| GET | `/intent` | Bearer | Detected learning intent |
| GET | `/cognitive-pattern` | Bearer | Query: `courseId` |
| GET | `/difficulty-suggestion` | Bearer | Query: `loadLevel` |
| POST | `/analyze-response` | Bearer | `{ response, question? }` |
| POST | `/cognitive-load` | Bearer | `{ courseId, metrics }` |
| POST | `/upload-pdf` | Bearer | Multipart: `pdf` file + `subject` |

### 9.6 AI (Gemini-powered) `/api/ai`

| Method | Path | Auth | Rate Limit | Notes |
|---|---|---|---|---|
| GET | `/recommendation` | Bearer | 30/15min | Personalized next-step recommendation |
| GET | `/profile` | Bearer | — | User's ML learning profile |
| PUT | `/profile` | Bearer | — | Update learning profile |
| POST | `/topic-progress` | Bearer | — | Track topic study + update weak/strong |
| GET | `/learning-twin` | Bearer | — | Full learning analytics snapshot |

### 9.7 AI Media `/api/ai-media`

| Method | Path | Auth | Rate Limit | Notes |
|---|---|---|---|---|
| POST | `/generate-slides` | Bearer | 30/15min | `{ topic, subject }` → AI presentation slides |
| POST | `/generate-video` | Bearer | 30/15min | `{ topic, subject, subtopic? }` → AI video script/video |
| GET | `/diagram/:topic/:subject` | Bearer | — | AI-generated diagram |

### 9.8 Exams `/api/exams`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/` | Bearer | All available exams |
| GET | `/:id` | Bearer | Exam detail |
| POST | `/` | Bearer (teacher) | Create exam |
| PUT | `/:id` | Bearer (teacher) | Edit exam |
| POST | `/:id/publish` | Bearer (teacher) | Publish exam |
| POST | `/:id/start` | Bearer | Start exam session |
| POST | `/:id/submit` | Bearer | Submit answers `{ answers: [{questionId, answer}] }` |
| GET | `/:id/results` | Bearer | View results |

### 9.9 Diary `/api/diary`

| Method | Path | Auth | Notes |
|---|---|---|---|
| GET | `/status` | Bearer | `{ isLocked, hasPassword }` |
| POST | `/unlock` | Bearer | `{ password }` |
| POST | `/lock` | Bearer | `{ password }` |
| POST | `/change-password` | Bearer | `{ currentPassword, newPassword }` |
| GET | `/entries` | Bearer | Paginated, filter: `mood, tag, startDate, endDate` |
| GET | `/entries/:id` | Bearer | Single entry |
| POST | `/entries` | Bearer | Create `{ title, content, mood, tags }` |
| PUT | `/entries/:id` | Bearer | Edit |
| DELETE | `/entries/:id` | Bearer | Delete |

### 9.10 Chatbot `/api/chatbot`

| Method | Path | Auth | Rate Limit | Notes |
|---|---|---|---|---|
| GET | `/greeting` | Bearer | — | Personalized greeting message |
| POST | `/chat` | Bearer | 30/15min | `{ message }` → AI response |
| GET | `/suggestion` | Bearer | — | Topic suggestion |
| GET | `/context` | Bearer | — | Chat history context |
| POST | `/clear-context` | Bearer | — | Reset chat |
| GET | `/weak-topics` | Bearer | — | User's weak topics |
| POST | `/add-weak-topic` | Bearer | — | `{ topic, subject }` |
| PUT | `/weak-topics/:id` | Bearer | — | `{ completed: bool }` |
| DELETE | `/weak-topics/:id` | Bearer | — | |
| GET | `/weak-topics/:id/videos` | Bearer | — | YouTube videos for topic |
| POST | `/weak-topics/:id/generate-todo` | Bearer | — | AI generates study to-dos |
| GET | `/todos` | Bearer | — | All study todos |
| PUT | `/todos/:id/complete` | Bearer | — | Mark todo complete |
| GET | `/next-video` | Bearer | — | Next recommended video |

### 9.11 Topics / Study Plan `/api/topics`

| Method | Path | Auth | Rate Limit | Notes |
|---|---|---|---|---|
| POST | `/add-subject` | Bearer | 30/15min | `{ subject }` → Gemini generates roadmap |
| GET | `/subjects` | Bearer | — | User's subjects |
| GET | `/roadmap/:subject` | Bearer | — | Full roadmap for subject |
| POST | `/complete-topic` | Bearer | — | `{ subject, topicTitle }` |
| POST | `/complete-subtopic` | Bearer | — | `{ subject, topicTitle, subtopicTitle }` |
| GET | `/next/:subject` | Bearer | — | Next uncompleted topic |
| GET | `/subtopics/:subject/:topicTitle` | Bearer | — | Subtopics list |
| GET | `/resources/:subject/:topic` | Bearer | 30/15min | YouTube + web resources |
| GET | `/resources/subtopic/:subject/:topic/:subtopic` | Bearer | — | Resources for subtopic |
| DELETE | `/subject/:id` | Bearer | — | Remove subject from plan |
| POST | `/initialize-from-weak-areas` | Bearer | — | Seed plan from onboarding weak areas |

### 9.12 Behavior `/api/behavior`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/track` | Bearer | Track user action for ML |
| GET | `/history` | Bearer | User behavior history |

### 9.13 Admin `/api/admin`

| Method | Path | Auth | Notes |
|---|---|---|---|
| POST | `/login` | No (adminToken) | `{ username, password }` → `{ token }` |
| GET | `/list` | adminToken | List all admins |
| POST | `/add` | adminToken (superAdmin) | Add admin |
| DELETE | `/:id` | adminToken (superAdmin) | Remove admin |
| GET | `/stats` | adminToken | Platform stats |
| GET | `/users` | adminToken | All users (paginated) |
| GET | `/users/:id` | adminToken | User detail |
| PUT | `/users/:id/role` | adminToken | `{ role }` |
| PUT | `/users/:id` | adminToken | Update user |
| PUT | `/users/:id/block` | adminToken | `{ blocked }` |
| DELETE | `/users/:id` | adminToken | Delete user |
| GET | `/courses` | adminToken | All courses |
| PUT | `/courses/:id/featured` | adminToken | `{ featured }` |
| DELETE | `/courses/:id` | adminToken | Delete |
| GET | `/exams` | adminToken | All exams |
| DELETE | `/exams/:id` | adminToken | Delete |
| GET | `/analytics` | adminToken | Query: `days` |

---

## 10. AI & ML Systems

### 10.1 Google Gemini Integration
- **Model**: `gemini-2.0-flash` (fast, cost-effective)
- **Library**: `@google/generative-ai` (Node.js SDK)
- **Key Management**: `keyManager.ts` — round-robin across multiple API keys to handle rate limits. Maintains a `recoClient` pool.

### 10.2 NeuroBot (AI Chatbot)
- File: `src/ml/neuroBot.ts`
- Builds context prompt including user profile, weak topics, strong topics, learning history, cognitive load
- Calls Gemini for conversational response
- Has a **chatbot cache** to avoid re-processing identical queries

### 10.3 Recommendation Engine
- File: `src/ml/recommendationEngine.ts` + `geminiService.ts`
- Takes user profile, learning history, weak concepts, and cognitive load
- Returns JSON with: `recommendedCourses`, `priorityLevel`, `estimatedCompletionTime`, `difficultyLevel`, `reasoning`, `nextSteps`

### 10.4 Roadmap Generator
- File: `src/ml/roadmapService.ts` (26KB — most complex ML file)
- Uses Gemini to generate full topic → subtopic roadmap per subject
- Returns structured JSON with topics and subtopics
- Persists to `TopicLibrary` collection in MongoDB
- Cached to avoid re-generation

### 10.5 Resource Fetcher
- File: `src/ml/resourceService.ts`
- Fetches YouTube videos for topics via **YouTube Data API v3**
- Also fetches web resources
- Cached in `VideoCache` collection

### 10.6 Cognitive Load System
- File: `src/ml/cognitiveLoad.ts`
- Tracks time-on-task, quiz failure rate, session length
- Outputs a 0-100 load score
- Backend adjusts difficulty recommendations based on this score

### 10.7 NLP Analyzer
- File: `src/ml/nlpAnalyzer.ts`
- Uses `@xenova/transformers` (ONNX models in Node.js)
- Analyzes user text responses for comprehension
- Detects intent from conversation patterns

### 10.8 AI Rate Limiting
Two tiers:
- **General**: 500 requests / 15 min per IP
- **AI-heavy** (Gemini calls): 30 requests / 15 min per IP on endpoints:
  - `POST /api/topics/add-subject`
  - `GET /api/topics/resources`
  - `POST /api/chatbot/chat`
  - `GET /api/ai/recommendation`
  - `POST /api/ai-media/generate-slides`
  - `POST /api/ai-media/generate-video`

### 10.9 AI Usage Limiter
- File: `src/ml/aiUsageLimiter.ts`
- Per-user daily quota tracking stored in `AIUsage` collection
- Prevents abuse beyond per-IP rate limits

---

## 11. Security Architecture

### 11.1 Authentication & Token Security
- **JWT**: Signed with `JWT_SECRET` env var (fallback: `nueronixlearn-secret` — MUST change in production)
- **Token expiry**: 30 days
- **Storage (Android)**: `EncryptedSharedPreferences` (AES-256 encryption backed by Android Keystore) — NEVER store in plain SharedPreferences
- **Header format**: `Authorization: Bearer <token>`
- **Token validation**: On every authenticated request, middleware verifies signature + expiry + user exists in DB

### 11.2 Password Security
- Hashed with **bcryptjs**, salt rounds = **12**
- Minimum length: 6 characters
- `comparePassword()` method on User model

### 11.3 Input Validation
- Server: **Joi** schemas validate all request bodies (register, login, profile, etc.)
- XSS protection: **xss-clean** middleware strips XSS payloads from all request bodies
- Size limit: `10mb` JSON body limit (needed for base64 images)

### 11.4 HTTP Security Headers
- **Helmet.js** sets: `Content-Security-Policy`, `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`, etc.

### 11.5 Rate Limiting
- **General**: 500 req/15min per IP
- **AI endpoints**: 30 req/15min per IP
- Returns `429 Too Many Requests` with message

### 11.6 CORS
- Currently permissive (`cors()` with no options). In production, restrict to frontend domain:
  ```javascript
  cors({ origin: ['https://nueronixlearn.vercel.app'] })
  ```

### 11.7 Avatar Security
- Accepts only base64 data-URL format
- Size guard: max ~2MB (`avatar.length > 3,000,000` rejected)

### 11.8 Admin Security
- Completely separate credential system from user auth
- Admin model in MongoDB
- Initial admin seeded via `seed-admin.ts` script (run manually)
- Admin roles control granular permissions (manageUsers, manageCourses, etc.)

### 11.9 Diary Privacy
- Diary entries can be locked with a user-set password
- Password stored hashed in `diaryPassword` field on user or diary record
- Lock/unlock via API endpoints before accessing entries

### 11.10 Android-Specific Security
- All network calls over **HTTPS only** (enforce via `network_security_config.xml`)
- JWT stored in `EncryptedSharedPreferences`
- No logging of sensitive data in production (`BuildConfig.DEBUG` checks)
- ProGuard/R8 obfuscation enabled for release builds
- Certificate pinning for the backend API (optional but recommended)

---

## 12. Environment Variables & Configuration

### Frontend `.env` (Vite)
```env
VITE_API_URL=https://your-backend-url.vercel.app
```

### Backend `.env` (Node.js)
```env
PORT=5000
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/nueronixlearn
JWT_SECRET=your-very-long-random-secret-key-here-minimum-32-chars
GEMINI_API_KEY=your-google-gemini-api-key
GEMINI_API_KEY_2=optional-second-key-for-rotation
GEMINI_API_KEY_3=optional-third-key-for-rotation
YOUTUBE_API_KEY=your-youtube-data-api-v3-key
```

### Android `local.properties` (DO NOT commit)
```properties
BACKEND_BASE_URL=https://your-backend-url.vercel.app
```

In `build.gradle.kts`:
```kotlin
android {
    buildTypes {
        release {
            buildConfigField("String", "BASE_URL", "\"${properties["BACKEND_BASE_URL"]}\"")
        }
        debug {
            buildConfigField("String", "BASE_URL", "\"http://10.0.2.2:5000\"")
        }
    }
}
```

---

## 13. Android Project Structure

```
app/
├── src/
│   └── main/
│       ├── AndroidManifest.xml     ← Permissions: INTERNET, CAMERA, READ_MEDIA_IMAGES
│       ├── java/com/nueronixlearn/
│       │   ├── NueronixApp.kt      ← @HiltAndroidApp Application class
│       │   ├── MainActivity.kt     ← Single activity, hosts NavHost
│       │   │
│       │   ├── core/
│       │   │   ├── network/
│       │   │   │   ├── RetrofitClient.kt    ← Retrofit + OkHttp setup
│       │   │   │   ├── AuthInterceptor.kt   ← Attach Bearer token
│       │   │   │   └── TokenRefreshInterceptor.kt ← Auto-refresh on 401
│       │   │   ├── storage/
│       │   │   │   └── TokenManager.kt      ← EncryptedSharedPreferences
│       │   │   └── utils/
│       │   │       ├── Resource.kt          ← sealed class Success/Error/Loading
│       │   │       └── Extensions.kt
│       │   │
│       │   ├── data/
│       │   │   ├── remote/
│       │   │   │   ├── api/
│       │   │   │   │   ├── AuthApiService.kt
│       │   │   │   │   ├── CoursesApiService.kt
│       │   │   │   │   ├── LearningApiService.kt
│       │   │   │   │   ├── AnalyticsApiService.kt
│       │   │   │   │   ├── ExamsApiService.kt
│       │   │   │   │   ├── DiaryApiService.kt
│       │   │   │   │   ├── ChatbotApiService.kt
│       │   │   │   │   ├── TopicsApiService.kt
│       │   │   │   │   ├── AiApiService.kt
│       │   │   │   │   ├── MlApiService.kt
│       │   │   │   │   ├── BehaviorApiService.kt
│       │   │   │   │   └── AdminApiService.kt
│       │   │   │   └── dto/
│       │   │   │       ├── UserDto.kt
│       │   │   │       ├── CourseDto.kt
│       │   │   │       ├── ExamDto.kt
│       │   │   │       ├── DiaryDto.kt
│       │   │   │       └── ... (one per domain)
│       │   │   ├── local/
│       │   │   │   ├── NueronixDatabase.kt  ← Room database
│       │   │   │   ├── dao/
│       │   │   │   │   ├── CourseDao.kt
│       │   │   │   │   └── UserDao.kt
│       │   │   │   └── entity/
│       │   │   │       ├── CourseEntity.kt
│       │   │   │       └── UserEntity.kt
│       │   │   └── repository/
│       │   │       ├── AuthRepositoryImpl.kt
│       │   │       ├── CoursesRepositoryImpl.kt
│       │   │       └── ... (one per domain)
│       │   │
│       │   ├── domain/
│       │   │   ├── model/
│       │   │   │   ├── User.kt
│       │   │   │   ├── Course.kt
│       │   │   │   └── ...
│       │   │   ├── repository/
│       │   │   │   ├── AuthRepository.kt    ← interface
│       │   │   │   └── ...
│       │   │   └── usecase/
│       │   │       ├── auth/
│       │   │       │   ├── LoginUseCase.kt
│       │   │       │   ├── RegisterUseCase.kt
│       │   │       │   └── GetCurrentUserUseCase.kt
│       │   │       ├── courses/
│       │   │       │   ├── GetCoursesUseCase.kt
│       │   │       │   └── EnrollCourseUseCase.kt
│       │   │       └── ...
│       │   │
│       │   ├── ui/
│       │   │   ├── theme/
│       │   │   │   ├── Color.kt
│       │   │   │   ├── Type.kt
│       │   │   │   └── Theme.kt
│       │   │   ├── navigation/
│       │   │   │   ├── NavGraph.kt
│       │   │   │   └── Screen.kt  ← sealed class with routes
│       │   │   ├── components/
│       │   │   │   ├── NueronixCard.kt
│       │   │   │   ├── NueronixButton.kt
│       │   │   │   ├── NueronixChip.kt
│       │   │   │   ├── NueronixTextField.kt
│       │   │   │   ├── LoadingIndicator.kt
│       │   │   │   ├── ErrorView.kt
│       │   │   │   ├── AvatarImage.kt
│       │   │   │   └── ProgressBar.kt
│       │   │   └── screens/
│       │   │       ├── landing/   LandingScreen.kt
│       │   │       ├── auth/
│       │   │       │   ├── LoginScreen.kt + LoginViewModel.kt
│       │   │       │   ├── RegisterScreen.kt + RegisterViewModel.kt
│       │   │       │   └── OnboardingScreen.kt + OnboardingViewModel.kt
│       │   │       ├── dashboard/ DashboardScreen.kt + DashboardViewModel.kt
│       │   │       ├── courses/
│       │   │       │   ├── CoursesScreen.kt + CoursesViewModel.kt
│       │   │       │   ├── CourseDetailScreen.kt + CourseDetailViewModel.kt
│       │   │       │   └── LearnScreen.kt + LearnViewModel.kt
│       │   │       ├── studyplan/ StudyPlanScreen.kt + StudyPlanViewModel.kt
│       │   │       ├── exams/
│       │   │       │   ├── ExamsScreen.kt + ExamsViewModel.kt
│       │   │       │   └── ExamTakingScreen.kt + ExamTakingViewModel.kt
│       │   │       ├── diary/     DiaryScreen.kt + DiaryViewModel.kt
│       │   │       ├── chatbot/   ChatbotScreen.kt + ChatbotViewModel.kt
│       │   │       ├── profile/   ProfileScreen.kt + ProfileViewModel.kt
│       │   │       ├── teacher/
│       │   │       │   ├── TeacherDashboardScreen.kt
│       │   │       │   ├── CreateCourseScreen.kt
│       │   │       │   ├── CreateExamScreen.kt
│       │   │       │   └── TeacherExamsScreen.kt
│       │   │       └── admin/
│       │   │           ├── AdminLoginScreen.kt
│       │   │           └── AdminPanelScreen.kt
│       │   │
│       │   └── di/
│       │       ├── NetworkModule.kt    ← @Module providing Retrofit instances
│       │       ├── DatabaseModule.kt   ← @Module providing Room database
│       │       └── RepositoryModule.kt ← @Module binding implementations
│       │
│       └── res/
│           ├── font/   ← inter_regular.ttf, inter_medium.ttf, inter_semibold.ttf, inter_bold.ttf
│           ├── drawable/
│           ├── values/
│           │   ├── colors.xml
│           │   └── strings.xml
│           └── xml/
│               └── network_security_config.xml  ← HTTPS-only enforcement
└── build.gradle.kts
```

---

## 14. Navigation Graph

```
Landing (no auth required)
  └── Register (student/teacher)
        └── Onboarding (student only, if !onboardingCompleted)
              └── Main App (Bottom Navigation)

Login
  └── Main App (Bottom Navigation)

AdminLogin
  └── Admin Panel (separate session, no bottom nav)

═══════════════════════════════════════════════════════
MAIN APP — Bottom Navigation (for authenticated users)
═══════════════════════════════════════════════════════

[Student]
Bottom Bar Tabs:
  1. 🏠 Dashboard → DashboardScreen
  2. 📚 Courses → CoursesScreen
                    └── CourseDetail → LearnScreen
  3. 📖 Study Plan → StudyPlanScreen
  4. 🤖 NeuroBot → ChatbotScreen
  5. 👤 Profile → ProfileScreen

Additional via Dashboard/top bar:
  - Diary (FAB or profile menu)
  - Exams

[Teacher]
Bottom Bar Tabs:
  1. 🏠 Teacher Dashboard
  2. ➕ Create Course
  3. 📋 My Exams → TeacherExamsScreen
  4. 👤 Profile

═══════════════════════════════════════════════════════
SCREEN TRANSITIONS
═══════════════════════════════════════════════════════

Landing → Register: slide right
Register → Onboarding: slide right
Onboarding → Dashboard: replace (pop all backstack)
Login → Dashboard: replace (pop all backstack)
Dashboard → CourseDetail: slide up
CourseDetail → Learn: slide right
Bottom tab switch: fade
Logout → Landing: replace (pop all backstack)
```

---

## 15. Key Implementation Notes for Android

1. **Token Refresh**: Implement an `Authenticator` in OkHttp that automatically calls `POST /api/auth/refresh` on 401 responses and retries the original request. This mirrors the Axios interceptor logic.

2. **Image/Avatar Handling**: Convert selected images to base64 before uploading (backend stores as base64 string). Use `BitmapFactory` + `Base64.encode`. Enforce 2MB limit client-side.

3. **PDF Upload**: Use `FileProvider` to get URI, read bytes, convert to base64 or multipart, send to `POST /api/ml/upload-pdf`.

4. **YouTube Video Links**: Backend returns YouTube video URLs. Open them in the YouTube app using an Intent (`Intent.ACTION_VIEW` with YouTube URI) or use `YouTubePlayerView` SDK.

5. **Roadmap Caching**: Cache roadmap data in Room so it works offline after first load. Invalidate when user completes a topic.

6. **Chat Streaming**: The backend's `POST /api/chatbot/chat` returns a full response (not streaming). On Android, show a typing indicator (animated dots composable) while awaiting the response.

7. **Diary Lock**: Implement a `BiometricPrompt` or PIN dialog before showing diary entries. Store the diary unlock state in ViewModel (not persisted — requires unlock every app session).

8. **Gamification**: Display `totalXP`, `level`, and `badges` prominently on Dashboard. Animate XP gain with `animateIntAsState`.

9. **Cognitive Load Visualization**: Use a circular `Canvas` composable to draw a gauge (0-100). Color gradient: Green (0-33) → Orange (34-66) → Red (67-100).

10. **Admin Flow**: Admin uses a completely separate login form (`/admin-login` equivalent screen). Store admin token with a different key. Admin bottom nav has different tabs (Dashboard, Users, Courses, Exams, Analytics).

---

*End of Blueprint — This document contains 100% of the information required to rebuild NueronixLearn as a complete native Android application in Android Studio.*
