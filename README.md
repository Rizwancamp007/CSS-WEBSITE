🚀 GCU Computer Science Society (CSS) Institutional Platform

A high-security, full-stack ecosystem designed for the Computer Science Society of GCU Lahore.
This platform manages public engagement, event registrations, and society governance through a hardened administrative mainframe.

🛡️ The "Ironclad" Architecture
The platform is built on a MERN stack (MongoDB, Express, React, Node.js) with a focus on "Institutional Tech" aesthetics and security.

Frontend: React 19 + Vite for lightning-fast rendering.

Styling: Tailwind CSS with custom glassmorphism and institutional branding.

Animations: Framer Motion for cinematic UI transitions.

Backend: Node.js & Express.js with a hardened security layer.

Database: MongoDB for scalable membership and event telemetry.

✨ Key Features
🌐 Public Terminal
Cinematic Hero Sector: Dynamic slider with institutional grid overlays.

Mission Telemetry: Real-time fetching of upcoming society events.

Enrollment Pipeline: Multi-stage membership application system.


🔐 Administrative Mainframe
RBAC (Role-Based Access Control): Granular permissions for board members (Events, Announcements, Teams).

Security Handshake: JWT-based authentication with brute-force shielding and session restoration.

Forensic Auditing: Every admin action is logged with IP and user-agent data for integrity checks.

Node Activation: Secure one-time token system for board member account setup.


🚀 Local Deployment Sequence
To run this platform locally on your system, follow these steps:

1. Prerequisites
Node.js (v18+)

MongoDB Community Server (running on port 27017)

2. Environment Setup
Create a .env file in the backend folder:
PORT=3001
MONGO_URI=mongodb://localhost:27017/techtakra
JWT_SECRET=your_secret_key
MASTER_ADMIN_EMAIL=css@gmail.com
TOKEN_EXPIRE=3h

Create a .env file in the frontend folder:
VITE_API_URL=http://localhost:3001/api
VITE_MASTER_ADMIN_EMAIL=css@gmail.com


3. Installation
Backend Initiation:
cd backend
npm install
npm run dev

Frontend Uplink:
cd frontend
npm install
npm run dev

🛠️ API Infrastructure
Endpoint                  Method    Access    Description
/api/admin/login          POST      Public    Authenticate operator credentials
./api/events              GET       Public     Fetch all active mission telemetry
./api/admin/logs          GET       Level 0    Retrieve forensic activity ledger
./api/admin/permissions   PATCH     Level 0    Sync clearance levels for board members.

🎨 Design Standards
The UI follows a strict "Institutional Tech" aesthetic:

Primary Background: #020617 (Deep Space Blue).

Accents: Gold (#FFD700) for Authority; Blue (#2563eb) for Communication.

Glassmorphism: backdrop-blur-2xl for high-clearance UI cards.

This project is developed for the Computer Science Society, GCU Lahore.
