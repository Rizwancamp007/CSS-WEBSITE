require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const connectDB = require("./config/db");

const app = express();

// LIVE FIX: Trust Render/Vercel proxies for accurate IP/Rate-limiting
app.set("trust proxy", 1);

// Establish Database Uplink
connectDB();

// ==========================================
// 1. DATA PARSING & CORS (REFINED)
// ==========================================

const allowedOrigins = [
    "http://localhost:5173", 
    "http://localhost:3000",
    process.env.FRONTEND_URL?.replace(/\/$/, "") 
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error(`🛑 CORS REJECTION: Origin [${origin}] not authorized.`);
            callback(new Error("CORS Protocol Violation: Origin Not Authorized"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"] 
}));

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ==========================================
// 2. SECURITY & PERFORMANCE
// ==========================================

app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());
app.use(compression());

const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 500, 
    message: { success: false, message: "Traffic Threshold Exceeded." }
});
app.use("/api/", globalLimiter);

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15, 
    message: { success: false, message: "Security Protocol: Brute-force Shield Active." }
});

// ==========================================
// 3. ROUTE UPLINKS
// ==========================================

// Production Health Check (Used by Render to monitor uptime)
app.get("/health", (req, res) => res.status(200).send("Mainframe Operational"));

app.use("/api/admin/login", loginLimiter); 

app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/team", require("./routes/teamRoutes"));
app.use("/api/memberships", require("./routes/membershipRoutes"));
app.use("/api/register", require("./routes/registrationRoutes"));

// ==========================================
// 4. FAILSAFE ERROR HANDLING
// ==========================================

app.use((err, req, res, next) => {
    if (err.message === "CORS Protocol Violation: Origin Not Authorized") {
        return res.status(403).json({ success: false, message: err.message });
    }
    console.error(`❌ CRITICAL EXCEPTION: ${err.stack}`);
    res.status(err.status || 500).json({ 
        success: false, 
        message: "Internal Systems Error: Integrity Check Required." 
    });
});

const PORT = process.env.PORT || 10000; // Render expects port 10000
app.listen(PORT, () => {
    console.log(`
    🚀 CORE ONLINE | MAINFRAME ACTIVE
    ==================================
    Port: ${PORT}
    Mode: ${process.env.NODE_ENV || 'production'}
    Security: IRONCLAD
    CORS: AUTHORIZED FOR VITE & VERCEL
    ==================================
    `);
});