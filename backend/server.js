require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const connectDB = require("./config/db");

const app = express();

/**
 * @section INFRASTRUCTURE
 * LIVE FIX: Trust Render/Vercel proxies for accurate IP/Rate-limiting.
 * This ensures 'req.ip' and 'x-forwarded-for' headers are handled correctly.
 */
app.set("trust proxy", 1);

// Establish Database Uplink
connectDB();

// ==========================================
// 1. DATA PARSING & CORS (HARDENED)
// ==========================================

/**
 * @description Dynamic Origin Validation
 * Hardened to handle trailing slashes and production subdomains.
 */
const allowedOrigins = [
    "http://localhost:5173", 
    "http://localhost:3000",
    "https://css-website-puce.vercel.app" // Your production frequency
].filter(Boolean);

// Sync with environment variable if present
if (process.env.FRONTEND_URL) {
    const envUrl = process.env.FRONTEND_URL.replace(/\/$/, "");
    if (!allowedOrigins.includes(envUrl)) {
        allowedOrigins.push(envUrl);
    }
}

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl)
        if (!origin) return callback(null, true);
        
        // Normalize origin string by removing trailing slash for comparison
        const normalizedOrigin = origin.replace(/\/$/, "");
        
        if (allowedOrigins.indexOf(normalizedOrigin) !== -1) {
            callback(null, true);
        } else {
            console.error(`🛑 CORS REJECTION: Origin [${origin}] not authorized in registry.`);
            callback(new Error("CORS Protocol Violation: Origin Not Authorized"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"] 
}));

// Standard JSON/URL-encoded parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ==========================================
// 2. SECURITY & PERFORMANCE
// ==========================================

/**
 * @description Security Middleware
 * Helmet protects against common headers. CSP is disabled to allow 
 * external assets (images/fonts) if needed.
 */
app.use(helmet({ contentSecurityPolicy: false }));
app.use(mongoSanitize());
app.use(compression());

// Global Rate Limiter: General traffic protection
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 1000, 
    message: { success: false, message: "Traffic Threshold Exceeded. Cooling down." }
});
app.use("/api/", globalLimiter);

// Login Shield: Brute-force protection for Auth nodes
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15, 
    message: { success: false, message: "Security Protocol: Brute-force Shield Active." }
});

// ==========================================
// 3. ROUTE UPLINKS
// ==========================================

// Production Health Check (Used by Render for uptime monitoring)
app.get("/health", (req, res) => res.status(200).send("Mainframe Operational"));

// Apply specific limiter to login route
app.use("/api/admin/login", loginLimiter); 

// Route Hubs
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

const PORT = process.env.PORT || 10000;
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