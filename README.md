# Easwari Engineering College - Academic Event & Resource Booking Portal
### MERN Full-Stack Institutional Resource & Event Reservation System

A production-grade institutional reservation platform built for Easwari Engineering College to manage seminar halls, laboratories, auditoriums, classrooms, and audio-visual assets with real-time mathematical conflict prevention and role-based access control.

---

## Key Features

- **Mathematical Conflict Prevention Engine**: Implements the half-open interval rule ($start_A < end_B \land end_A > start_B$) with configurable turnaround buffers and atomic concurrency checks to completely prevent double-bookings.
- **Separate User & Admin Modules**: Role-based access control (RBAC) separating student scholars, faculty members, facilities staff, and administrative deans.
- **Comprehensive Campus Resource Registry**: 11+ detailed institutional venues with seating capacities, building locations, installed equipment, operating hours, and maintenance scheduling.
- **Real-Time Booking Workflows**: Submission with live conflict warnings, unique reference code generation (`BK-2026-XXXX`), administrative approval/rejection workflows, and slot release cancellations.
- **Interactive Availability Calendar**: Visual month and week schedules with distinct indicators for approved, pending, and event slots.
- **Analytical Dashboards & CSV Export**: Interactive charts powered by Recharts (departmental utilization, monthly trends, peak booking hours) and on-demand CSV report exports.
- **Persistent In-App Notifications**: Alerts for submission, approval, rejection, and cancellation.
- **Security & Audit Logs**: Bcrypt password hashing, JWT stateless authentication, role middleware, and immutable system audit logging.
- **Automated Vitest Test Suite**: 8 automated tests covering boundary conditions, overlapping bookings, buffer periods, operating hours, capacity limits, and concurrent approvals.

---

## Technology Stack

- **Frontend**: React 19, Vite, TypeScript, Tailwind CSS, React Router, Lucide Icons, Recharts.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB with Mongoose ODM (supports both external MongoDB Atlas and managed in-memory MongoDB).
- **Authentication**: JSON Web Tokens (JWT) with bcrypt password hashing.
- **Testing**: Vitest with in-memory MongoDB runner.

---

## Pre-Configured Demo Accounts for Project Review

| Role | Name | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- | :--- |
| **Administrator (Dean)** | Dr. Arthur Vance | `admin@academic.edu` | `Admin@123` | Full admin suite, user management, approvals, reports, audit logs |
| **Faculty Member** | Prof. Rajesh Sharma | `prof.sharma@academic.edu` | `Faculty@123` | Book resources, publish departmental events, view my bookings |
| **Faculty Member** | Dr. Elena Rostova | `dr.elena@academic.edu` | `Faculty@123` | Book labs, manage requests |
| **Student Scholar** | Alex Rivera | `student.alex@academic.edu` | `Student@123` | Request bookings, browse catalog, view personal bookings |
| **Facilities Staff** | Robert Hastings | `staff.robert@academic.edu` | `Staff@123` | Manage AV equipment, request bookings |

> **Evaluation Tip**: Use the **"Demo Switcher"** button in the top navigation bar or the 1-click preset cards on `/login` to switch between roles instantly during project presentation.

---

## Installation and Local Setup

### 1. Prerequisites
- Node.js $\ge 18$
- npm $\ge 9$
- MongoDB (Optional: The application automatically boots a high-speed managed MongoDB engine if no external database URI is supplied)

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run Development Server
```bash
npm run dev
```
The application will launch on **http://localhost:3000** with both backend API endpoints (`/api/*`) and React frontend attached.

### 5. Run Automated Tests
```bash
npm test
```
Executes the Vitest conflict prevention engine test suite.

### 6. Reset / Re-Seed Database
```bash
npm run seed
```
Re-populates the database with fresh demo accounts, 11 academic resources, sample approved/pending bookings, events, and audit logs.

### 7. Production Build
```bash
npm run build
npm start
```

---

## Project Documentation
Full architectural diagrams, ER diagrams, DFDs, mathematical proofs, and viva questions are available in [`docs/PROJECT_REPORT.md`](docs/PROJECT_REPORT.md).
