# AutoNear — Nearby Auto-Rickshaw Finder

> **Your Ride. Just Around the Corner.**

A complete, real GPS-based auto-rickshaw tracking web application built as a Computer Science / IT college mini-project. AutoNear uses actual device GPS coordinates from real registered drivers — no simulated locations, no demo data.

---

## Table of Contents

1. [Project Abstract](#project-abstract)
2. [Problem Statement](#problem-statement)
3. [Objectives](#objectives)
4. [Proposed Solution](#proposed-solution)
5. [Feature List](#feature-list)
6. [Technology Stack](#technology-stack)
7. [System Architecture](#system-architecture)
8. [Database Structure](#database-structure)
9. [Installation Instructions](#installation-instructions)
10. [Firebase Configuration](#firebase-configuration)
11. [Running Locally](#running-locally)
12. [How to Register Drivers](#how-to-register-drivers)
13. [How Location Sharing Works](#how-location-sharing-works)
14. [Admin Setup](#admin-setup)
15. [Live Demo Sequence](#live-demo-sequence)
16. [Security and Privacy](#security-and-privacy)
17. [Known Limitations](#known-limitations)
18. [Future Improvements](#future-improvements)
19. [Test Results](#test-results)

---

## Project Abstract

AutoNear is a real-time auto-rickshaw discovery platform that connects passengers with nearby available drivers using genuine GPS technology. Unlike map applications that display fictional sample data, AutoNear only shows drivers who have registered real accounts, received admin approval, and explicitly enabled location sharing on their actual devices. The application is designed to function as a real prototype that can be demonstrated with live participants.

---

## Problem Statement

Passengers waiting for auto-rickshaws in Indian cities often have no way to know whether any autos are nearby without walking around or waiting. Existing solutions either require paid APIs, show fake demo data, or are too complex to set up for a college demonstration. There is a need for a lightweight, honest, real-GPS-based solution that respects privacy, requires minimal cost, and can be demonstrated with real devices.

---

## Objectives

- Allow real auto-rickshaw drivers to register with their actual vehicle details
- Require admin review before a driver appears in passenger searches
- Enable drivers to share their actual GPS location with explicit consent
- Allow passengers to find available drivers within a chosen radius using Haversine distance
- Display only real, live, recently updated driver locations on an interactive map
- Clearly communicate when no drivers are available rather than fabricating results
- Enforce access control through Firebase security rules

---

## Proposed Solution

AutoNear implements a three-role system (passenger, driver, admin) backed by Firebase Authentication and Firebase Realtime Database.

- **Drivers** register through the web form, wait for admin approval, then enable location sharing from their Driver Dashboard. The browser's `navigator.geolocation.watchPosition` API continuously sends their real GPS coordinates to Firebase.
- **Passengers** sign in, grant location permission, and search for available drivers. The Haversine formula calculates the actual distance from the passenger to each driver, filtered by a chosen radius.
- **Admins** review registrations and approve, reject, or suspend driver accounts. Only approved drivers can appear in search results.

---

## Feature List

### Core
- [x] Real GPS tracking using `navigator.geolocation.watchPosition`
- [x] Firebase Realtime Database for live location storage and retrieval
- [x] Haversine distance calculation (no pre-computed or fake distances)
- [x] 1 km, 3 km, 5 km, 10 km radius filters
- [x] Location staleness detection (default: 60 seconds)
- [x] Sort by distance or driver name
- [x] Interactive Leaflet + OpenStreetMap map

### Authentication & Accounts
- [x] Passenger sign-up, login, logout
- [x] Driver registration with vehicle details
- [x] Email verification (via Firebase Auth)
- [x] Admin approval workflow
- [x] Firebase Realtime Database security rules

### Driver Dashboard
- [x] Go Online / Go Offline controls
- [x] Live GPS coordinates and accuracy display
- [x] Location publish count and last-update time
- [x] Approval status display
- [x] Distance-threshold throttle (avoids unnecessary writes when stationary)

### Map & Results
- [x] OpenStreetMap tiles (free, attribution-compliant)
- [x] Distinct passenger and driver markers
- [x] Driver popups with real name, vehicle, distance, update time
- [x] Stale location visual indicator
- [x] Recenter-on-passenger button
- [x] "No available autos" honest empty state

### Admin Dashboard
- [x] Pending / approved / all driver tabs
- [x] Approve, reject, suspend with optional reason
- [x] Driver search
- [x] Registration statistics

### Design
- [x] Black-and-grey premium design system
- [x] Inter font, Tailwind CSS
- [x] Fully responsive (mobile + desktop)
- [x] Accessible labels, focus states, ARIA attributes
- [x] Smooth animations and transitions

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React 18 + TypeScript |
| Build Tool | Vite 5 |
| CSS | Tailwind CSS 3 |
| Routing | React Router 6 |
| Map | Leaflet 1.9 + React-Leaflet 4 |
| Map Tiles | OpenStreetMap (free) |
| Authentication | Firebase Authentication |
| Database | Firebase Realtime Database |
| Icons | Lucide React |
| Testing | Vitest |
| GPS | Browser Geolocation API |

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Browser (React SPA)                     │
│                                                                 │
│  ┌──────────────┐  ┌─────────────────┐  ┌───────────────────┐  │
│  │  Auth Pages  │  │ Driver Dashboard │  │  Find Nearby Page │  │
│  │  (login/reg) │  │  (GPS tracking) │  │  (passenger view) │  │
│  └──────────────┘  └────────┬────────┘  └────────┬──────────┘  │
│                             │                    │             │
│  ┌──────────────────────────▼────────────────────▼──────────┐  │
│  │                    Services Layer                        │  │
│  │  authService.ts · driverService.ts                       │  │
│  └──────────────────────────┬─────────────────────────────┘  │
│                             │                               │  │
│  ┌──────────────────────────▼─────────────────────────────┐  │  │
│  │              Firebase SDK (client-side)                │  │  │
│  └──────────────────────────┬─────────────────────────────┘  │
└─────────────────────────────┼───────────────────────────────┘
                              │
              ┌───────────────▼────────────────┐
              │         Firebase Cloud          │
              │                                │
              │  ┌──────────────────────────┐  │
              │  │  Firebase Authentication  │  │
              │  └──────────────────────────┘  │
              │  ┌──────────────────────────┐  │
              │  │  Realtime Database       │  │
              │  │  (with security rules)   │  │
              │  └──────────────────────────┘  │
              └────────────────────────────────┘
```

**Data flow for Go Online:**
1. Driver presses Go Online → browser calls `navigator.geolocation.watchPosition`
2. On each GPS update → `publishDriverLocation()` writes to `/locations/{uid}`
3. Passenger subscribes to `/locations` via `onValue` listener
4. Haversine distance calculated client-side for each eligible driver
5. Approved, online, non-stale drivers shown on map and in results panel

---

## Database Structure

```
Firebase Realtime Database root
│
├── admins/
│   └── {uid}: true                        # admin UID → boolean
│
├── users/
│   └── {uid}/
│       ├── uid: string
│       ├── email: string
│       ├── role: "passenger" | "driver"
│       └── createdAt: number (Unix ms)
│
├── drivers/
│   └── {uid}/
│       ├── uid: string
│       ├── fullName: string
│       ├── email: string
│       ├── phone: string
│       ├── vehicleRegNumber: string
│       ├── approvalStatus: "pending"|"approved"|"rejected"|"suspended"
│       ├── createdAt: number
│       ├── updatedAt: number
│       ├── approvedAt?: number
│       ├── approvedBy?: string (admin uid)
│       ├── rejectionReason?: string
│       └── suspensionReason?: string
│
└── locations/
    └── {uid}/
        ├── uid: string
        ├── latitude: number   (-90 to 90)
        ├── longitude: number  (-180 to 180)
        ├── accuracy: number   (metres)
        ├── timestamp: number  (Unix ms)
        └── isOnline: boolean
```

**Staleness threshold:** A location is marked stale if `(Date.now() - timestamp) / 1000 > 60`. This constant is defined in `src/types/index.ts` as `LOCATION_STALE_THRESHOLD_SECONDS = 60`.

---

## Installation Instructions

### Prerequisites

- **Node.js** v18 or later — download from https://nodejs.org
- **npm** v9 or later (included with Node.js)
- A **Firebase project** (free Spark plan is sufficient)
- A modern browser with GPS support (Chrome, Firefox, Safari, Edge)

### Steps

```bash
# 1. Navigate into the project directory
cd autonear

# 2. Install all dependencies
npm install

# 3. Copy the environment template
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux

# 4. Fill in your Firebase config (see Firebase Configuration below)
# Edit .env with your real values

# 5. Start the development server
npm run dev
```

The application opens at `http://localhost:5173`.

---

## Firebase Configuration

### Step 1: Create a Firebase Project

1. Go to https://console.firebase.google.com
2. Click **Add project**
3. Enter a project name (e.g., `autonear`)
4. Disable Google Analytics if not needed → Click **Create project**

### Step 2: Enable Authentication

1. In the Firebase console → **Authentication** → **Get started**
2. Click **Email/Password** → Enable → **Save**

### Step 3: Create a Realtime Database

1. In the console → **Realtime Database** → **Create database**
2. Choose your region (e.g., `asia-southeast1`)
3. Start in **locked mode** (the security rules will be set below)
4. Note the `databaseURL` shown (e.g., `https://your-project-default-rtdb.asia-southeast1.firebasedatabase.app`)

### Step 4: Apply Security Rules

1. In **Realtime Database** → **Rules** tab
2. Replace the default rules with the contents of `firebase/database.rules.json`
3. Click **Publish**

### Step 5: Get Your App Config

1. In the console → **Project settings** (gear icon) → **General**
2. Under **Your apps** → click the web icon `</>`
3. Register the app with a nickname → copy the `firebaseConfig` object
4. Fill in your `.env` file:

```env
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your-project-default-rtdb.region.firebasedatabase.app
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=1234567890
VITE_FIREBASE_APP_ID=1:123...
```

### Step 6: Set Up an Admin Account

Admin privileges **cannot** be set through the app UI (by design). You must use the Firebase console:

1. Create an account through the app (register as a passenger with your admin email)
2. In the Firebase console → **Realtime Database** → manually add:
   ```
   admins → {your-uid} → true
   ```
3. Find your UID: **Authentication** → Users → click your email → copy the UID

---

## Running Locally

```bash
# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Run unit tests
npm run test

# Lint check
npm run lint
```

---

## How to Register Drivers

1. Open the app at `http://localhost:5173`
2. Click **Register as a Driver** in the navigation
3. Fill in all required fields:
   - Full name (real name of the driver)
   - Email address
   - Phone number (10-digit Indian mobile)
   - Vehicle registration number (e.g., `MH12AB1234`)
   - Password (min 8 chars, 1 uppercase, 1 number)
   - Check the location-sharing consent box
4. Click **Submit Registration**
5. Check email for verification link and verify
6. Admin must log in at `/admin` and approve the account
7. Driver can then sign in, go to **Driver Dashboard**, and press **Go Online**

> **Note:** Submitting a vehicle registration number does not verify it against official government records. An admin reviews the application manually.

---

## How Location Sharing Works

### Driver Side
1. Driver presses **Go Online** on the Driver Dashboard
2. Browser calls `navigator.geolocation.watchPosition` with:
   - `enableHighAccuracy: true`
   - `maximumAge: 5000` (accept positions up to 5s old)
   - `timeout: 15000` (fail if no fix within 15s)
3. On each GPS update, coordinates are validated (`isValidCoordinate`)
4. A distance check prevents publishing if the driver has moved less than 10 metres (reduces database writes when stationary)
5. Valid coordinates are written to `/locations/{uid}` in Firebase

### Passenger Side
1. Passenger clicks **Use My Current Location**
2. Browser calls `navigator.geolocation.getCurrentPosition` once
3. App subscribes to `/locations` via Firebase `onValue` listener (real-time updates)
4. For each online location: Haversine distance is computed
5. Drivers outside the chosen radius, without approved status, or with stale locations are excluded
6. Remaining drivers appear on the map and in the results panel

---

## Admin Setup

The first admin must be set manually via the Firebase console (see Firebase Configuration → Step 6). This is intentional — no user should be able to make themselves an admin through the app.

Once an admin is configured:
- Log in with the admin email at `/login`
- You are automatically redirected to `/admin`
- Review pending driver registrations
- Approve, reject (with optional reason), or suspend drivers
- Re-approve previously rejected/suspended accounts

---

## Live Demo Sequence

For the college presentation, follow this sequence:

1. **Setup**: Ensure Firebase is configured, admin account created, and the app is accessible (use `npm run dev` or deploy to a free host like Vercel/Netlify).

2. **Open passenger view**: On the presentation laptop/phone, sign in as a passenger and open the **Find Nearby Autos** page.

3. **Register a driver**: On a participating driver's phone, open the site, go to **Register as a Driver**, and complete the form with real information.

4. **Approve the driver**: On the admin account, go to the Admin Dashboard, find the new registration, and press **Approve**.

5. **Driver goes online**: On the driver's phone, sign in, open **Driver Dashboard**, press **Go Online**, and grant location permission.

6. **Search**: On the passenger device, click **Use My Current Location** → **Search**. The driver should appear on the map with their actual calculated distance.

7. **Movement test**: Ask the driver to walk or drive while their tracking page remains open. Observe the map marker updating to their new position.

8. **Go offline**: Ask the driver to press **Go Offline**. Refresh the passenger search. The driver disappears from results.

9. **Empty state**: With no drivers online, demonstrate the honest "No available autos found nearby" message.

> **For the demo to work:** Each device needs a stable internet connection, location permission granted in the browser, and the browser tab must remain active.

---

## Security and Privacy

### What is secured
- **Authentication**: All database reads require a valid Firebase Authentication token
- **Location writes**: Only the authenticated driver can write their own `/locations/{uid}` record
- **Approval status**: Non-admins cannot change `approvalStatus` to anything other than `pending`
- **Admin list**: Not readable by ordinary users; not writable by the browser
- **Data validation**: Firebase rules validate coordinate ranges, data types, and required fields

### What is NOT done in this prototype
- **Phone verification**: Phone numbers are stored but not verified via OTP
- **Vehicle verification**: Registration numbers are not cross-checked with government databases
- **Rate limiting**: Firebase's built-in rate limiting applies; no custom rate limiter is implemented
- **Admin SDK operations**: The admin approval is done client-side by users whose UID is in the `admins` node. For production, these operations should go through a Cloud Function using the Admin SDK.

### Privacy
- Drivers explicitly consent to location sharing before registration
- Drivers can stop sharing at any time by pressing **Go Offline**
- Passenger location is obtained with browser permission and never stored in Firebase
- Driver contact information (phone) is stored but not displayed to passengers in this version

---

## Known Limitations

### Browser GPS Tracking
- The browser **cannot guarantee continuous tracking** when:
  - The phone screen is locked
  - The browser tab is switched or minimised on mobile
  - The app is closed or the browser is terminated
  - The device enters battery-saver mode
- This is a fundamental browser security limitation, not a bug in AutoNear
- Drivers must keep the browser tab active and the screen on while online

### Offline/Network
- Location updates require a working internet connection
- If the network drops, the last known location remains in Firebase until the driver goes offline or the location becomes stale

### Scale
- This application is designed for a college project demonstration with a small number of users
- Firebase Realtime Database on the Spark (free) plan supports up to 100 simultaneous connections and 1 GB of stored data

---

## Future Improvements

- [ ] Push notifications when a passenger is nearby
- [ ] In-app messaging between passenger and driver
- [ ] Trip booking and acceptance workflow
- [ ] Server-side driver approval via Firebase Cloud Functions (removes trust from client)
- [ ] OTP phone number verification
- [ ] Government vehicle registration number API integration
- [ ] PWA support for better mobile experience
- [ ] Background geolocation via a Service Worker (experimental)
- [ ] Driver earnings tracking
- [ ] Passenger rating system

---

## Test Results

Run the tests with:

```bash
npm run test
```

The test suite covers:
- Haversine distance calculation (including edge cases)
- Coordinate validation
- Location staleness detection
- Distance and time formatting
- Form validation (name, email, phone, vehicle number, password)
- Radius filter logic (1, 3, 5, 10 km)

All tests use real mathematical calculations. No mocked GPS coordinates are used in production code. Any GPS mocks that might be added for future integration tests must be confined to the `src/tests/` directory and clearly labelled.

---

## License

This project was created as a college mini-project and is not intended for commercial use.

Map data © [OpenStreetMap](https://www.openstreetmap.org/copyright) contributors, available under the Open Database Licence.
