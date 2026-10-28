# 🎯 QuizTrack — Enterprise Online Quiz Tracker & Telemetry Platform

QuizTrack is a production-quality, full-stack online quiz tracking and technical skill assessment platform built with **Spring Boot 3 (REST API, Spring Security, JWT)** and **React 18 (Vite, Tailwind CSS, Recharts, Framer Motion)**.

---

## ⚡ Key Highlights & Architecture

- **🔒 Strict Anti-Cheat Engine**: Server-side countdown timers (never trusting client clocks), tab-switch & window blur detection with strike limits, automatic lock and auto-submission upon repeated violations, and disabled copy-paste / context menus during exams.
- **📈 Advanced Progress Telemetry (The Unique Part)**:
  - Chronological score progression trendline (Recharts Area gradient)
  - Multi-axis category competency Radar chart
  - Accuracy vs. completion speed correlation analysis
  - GitHub-style 60-day interactive activity heatmaps
  - Study streak tracker with hot flame animations
  - Intelligent "Weak Topics" recommendations suggesting targeted quizzes to retake.
- **🏆 Gamification & Rewards**: Dynamic XP points formula, level ladders, unlocked collector achievement badges (First Quiz, 5-Day Streak, Century Club 100%, Speed Demon, Java Champion, SQL Pro), and global, per-quiz, weekly & monthly competitive leaderboards.
- **📜 Cryptographic PDF Certification**: Official high-resolution PDF certificates generated client-side via jsPDF with unique verification codes (`QT-CERT-xxxx`) and public verification portal.
- **🛡️ Full Admin Hub**: Complete CRUD for Quizzes and Questions, bulk question import via CSV or Excel (`.xlsx`), user moderation (block/unblock, delete), and performance reporting with one-click CSV export.

---

## 🏗️ Folder Structure

```
QuizTrack/
├── database/
│   ├── schema.sql              # Production MySQL 8 schema with views, indexes & FKs
│   └── seed-data.sql           # 5 Categories, 5 Quizzes, 50 detailed questions with explanations
├── backend/
│   ├── pom.xml                 # Maven dependencies (Spring Boot 3.2, JJWT, POI, OpenAPI)
│   ├── Dockerfile              # Multi-stage Eclipse Temurin Java 17 container
│   ├── samples/
│   │   └── questions_sample.csv # Sample CSV import template
│   └── src/
│       ├── main/
│       │   ├── java/com/quiztrack/
│       │   │   ├── QuizTrackApplication.java
│       │   │   ├── config/     # Security, JWT, CORS, OpenAPI, DataInitializer
│       │   │   ├── controller/ # Auth, Quizzes, Questions, Attempts, Leaderboard, Analytics, Admin
│       │   │   ├── dto/        # Request/Response data transfer contracts
│       │   │   ├── entity/     # JPA entities (User, Quiz, Question, Attempt, Badge, etc.)
│       │   │   ├── exception/  # Global REST advice, custom exceptions
│       │   │   ├── repository/ # Spring Data JPA repositories with analytical JPQL
│       │   │   ├── security/   # CustomUserDetailsService, UserPrincipal
│       │   │   └── service/    # Business services, anti-cheat, scoring & badge evaluation
│       │   └── resources/
│       │       └── application.yml
│       └── test/java/com/quiztrack/
│           └── service/AttemptServiceTest.java # JUnit 5 + Mockito test suite
├── frontend/
│   ├── package.json            # React 18, Vite, Tailwind, Recharts, Framer Motion, jsPDF
│   ├── vite.config.js          # Reverse proxy to :8080
│   ├── tailwind.config.js      # Custom theme colors and dark mode
│   ├── Dockerfile              # Multi-stage production Nginx container
│   └── src/
│       ├── api/                # Axios instance & modular endpoint handlers
│       ├── components/
│       │   ├── common/         # Navbar, Footer, ProtectedRoute, Modal, Skeletons
│       │   ├── quiz/           # QuizCard, QuestionNavigator, CountdownTimer, AntiCheatModal
│       │   └── analytics/      # ScoreTrendChart, CategoryRadar, DailyHeatmap, WeakTopics
│       ├── context/            # AuthContext (JWT, roles) & ThemeContext (dark/light)
│       ├── pages/              # 16 complete responsive pages
│       └── tests/              # React Testing Library unit tests
└── docker-compose.yml          # Full multi-container stack (MySQL 8 + Backend + Frontend)
```

---

## 👥 Pre-Seeded Demo Accounts (1-Click Login)

The platform comes pre-seeded with sample users, test attempts, streaks, and unlocked badges:

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@quiztrack.io` | `Admin@123` | System Administrator (Full CRUD, CSV Import, User Moderation) |
| **Candidate 1** | `alice@quiztrack.io` | `User@123` | Level 4, 1450 XP, 5-Day Streak, 3 historical attempts |
| **Candidate 2** | `bob@quiztrack.io` | `User@123` | Level 2, 820 XP, Cloud/DevOps specialist |
| **Candidate 3** | `charlie@quiztrack.io` | `User@123` | Level 6, 2150 XP, High achiever, 100% Century Club badge |

*(Note: The login page features 1-click quick login buttons for all 4 profiles for frictionless evaluation!)*

---

## 🗄️ Database Design

### Core Tables & Views
1. `roles`: Role definitions (`ROLE_USER`, `ROLE_ADMIN`).
2. `users`: Candidates and administrators with BCrypt hashes, level, XP points, and active study streaks.
3. `categories`: Quiz taxonomies (Web Development, Java & Spring, Database & SQL, Cloud DevOps, DSA).
4. `quizzes`: Exam configurations including duration, pass percentage, negative marking penalty, timer limits, and maximum anti-cheat violation strikes.
5. `questions`: Questions supporting `SINGLE` and `MULTI` choice types, fractional marks, and educational explanations.
6. `question_options`: 4 options per question with server-validated correctness flags.
7. `attempts`: Individual test sessions tracking score obtained, total marks, percentage, correct/wrong/skipped counts, time spent, anti-cheat violations, and certificate codes.
8. `attempt_answers`: Per-question candidate choices, marked for review flags, and individual time spent.
9. `badges` & `user_badges`: Gamified achievement milestones.
10. `activity_log`: Audit trail for timeline tracking.
11. `leaderboard_view`: Dynamic ranking view computing dense rank across XP and average score.

---

## 📡 REST API Specification

### Authentication (`/api/v1/auth`)
- `POST /register`: Register candidate (First Name, Last Name, Email, Password).
- `POST /login`: Authenticate and receive signed JWT Bearer token.
- `POST /forgot-password`: Generate password reset verification token.
- `POST /reset-password`: Update password using valid reset token.
- `GET /me`: Fetch authenticated user profile and roles.

### Quizzes & Catalog (`/api/v1/quizzes`, `/api/v1/categories`)
- `GET /quizzes`: Filter published quizzes by `categoryId`, `difficulty`, `search`, and pagination.
- `GET /quizzes/{slug}`: Detailed quiz specifications and guidelines.
- `GET /categories`: All quiz categories.

### Exam Attempts & Anti-Cheat (`/api/v1/attempts`)
- `POST /attempts/start/{quizId}`: Initiate or resume active exam session. Returns randomized questions **WITHOUT answer keys**.
- `POST /attempts/{attemptId}/answer`: Auto-save current question choice and review bookmark.
- `POST /attempts/{attemptId}/violation`: Register anti-cheat strike (tab switch, window blur). Auto-submits on strike limit.
- `POST /attempts/{attemptId}/submit`: Server-side evaluation, score calculation, badge unlocking, and certificate generation.
- `GET /attempts/{attemptId}/result`: Final percentage, correct/wrong metrics, and certificate verification code.
- `GET /attempts/{attemptId}/review`: Detailed review showing candidate choice vs. correct answer with explanation.
- `GET /attempts/history`: Paginated attempt history.
- `GET /attempts/verify/{certificateCode}`: Public certificate verification endpoint.

### Analytics & Progress (`/api/v1/analytics`)
- `GET /analytics/dashboard`: Progress analytics payload (score trends, radar chart, speed vs accuracy, 60-day heatmap, weak topic recommendations).

### Leaderboards (`/api/v1/leaderboard`)
- `GET /leaderboard`: Global XP rankings.
- `GET /leaderboard/quiz/{quizId}`: Per-quiz high scores and fastest completion times.
- `GET /leaderboard/scoped?period=weekly|monthly`: Time-bound rankings.

### Admin Operations (`/api/v1/admin`)
- `GET /admin/dashboard`: Platform overview KPIs, attempt counts, platform average.
- `POST /admin/quizzes`: Create new quiz.
- `PUT /admin/quizzes/{id}`: Update quiz configuration.
- `DELETE /admin/quizzes/{id}`: Remove quiz.
- `PATCH /admin/quizzes/{id}/publish`: Toggle publish status.
- `POST /admin/quizzes/{id}/import`: Bulk CSV/Excel question upload.
- `GET /admin/reports/quizzes`: Quiz performance statistics.
- `GET /admin/reports/export-csv`: Downloadable platform performance CSV.
- `GET /admin/users`: Searchable candidate list with pagination.
- `PATCH /admin/users/{userId}/status`: Block or unblock accounts.
- `DELETE /admin/users/{userId}`: Delete user account.

---

## 🚀 Local Setup & Run Guide

### Option 1: Docker Compose (Fastest & Simplest)
Run the entire stack (MySQL 8, Spring Boot Backend, React Frontend) in 1 command:
```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8080/api/v1`
- Swagger UI: `http://localhost:8080/api/v1/swagger-ui.html`

---

### Option 2: Running Locally from Source

#### Step 1: Database Setup
1. Ensure MySQL is running on port 3306.
2. Run the provided SQL scripts:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p < database/seed-data.sql
```

#### Step 2: Backend (Spring Boot 3)
```bash
cd backend
mvn clean spring-boot:run
```
*(The backend automatically creates tables and seeds any missing initial data on boot if run without the SQL scripts).*

#### Step 3: Frontend (React Vite)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing Guide

### Backend Tests (JUnit 5 + Mockito)
Run the unit tests verifying scoring calculations, negative marking, and pass/fail thresholds:
```bash
cd backend
mvn test
```

### Frontend Tests (React Testing Library)
```bash
cd frontend
npm test
```

---

## 🚢 Production Deployment

### Frontend (Vercel / Netlify / Cloudflare Pages)
1. Push repository to GitHub.
2. Link the `frontend/` directory as root directory.
3. Build command: `npm run build`
4. Output directory: `dist`
5. Environment variable: `VITE_API_URL=https://your-backend-api.onrender.com/api/v1`

### Backend (Render / Railway / AWS ECS)
1. Connect GitHub repository and select `backend/Dockerfile` as build environment.
2. Set environment variables:
   - `SPRING_DATASOURCE_URL`: `jdbc:mysql://<host>:3306/quiztrack_db`
   - `SPRING_DATASOURCE_USERNAME`: `<db_user>`
   - `SPRING_DATASOURCE_PASSWORD`: `<db_password>`
   - `ALLOWED_ORIGINS`: `https://your-frontend-domain.vercel.app`
