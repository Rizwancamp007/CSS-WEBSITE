require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const connectDB = require("./config/db");

/**
 * @description Core System Node
 * Initializes the express engine and establishes the database connection.
 */
const app = express();

// Establish Database Uplink
connectDB();

// ==========================================
// 1. DATA PARSING & CORS (CRITICAL UPLINK)
// ==========================================

/**
 * CORS PROTOCOL: Hardened for Admin Uplink
 * Explicitly allows the Vite frontend (localhost:5173) to transmit 
 * Authorization headers for JWT-based administrative sessions.
 */
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "http://localhost:3000", 
        process.env.FRONTEND_URL
    ].filter(Boolean),
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"] 
}));

// Payload Guard: Prevents buffer overflow attacks by limiting incoming JSON/Form data
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// ==========================================
// 2. SECURITY & PERFORMANCE MIDDLEWARE
// ==========================================

// Helmet: Hardens HTTP headers to mitigate common web vulnerabilities
app.use(helmet({
    contentSecurityPolicy: false, // Set to false to support external assets (Cloudinary/Images)
}));

// MongoSanitize: Automatically scrubs incoming requests to prevent NoSQL Injection
app.use(mongoSanitize());

// Compression: Minimizes transmission payload size for faster UI rendering
app.use(compression());

// Global Rate Limiting: Prevents DDoS/Spamming across general API nodes
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Minute Window
    max: 500, // Balanced for data-heavy dashboard loading
    message: { success: false, message: "Traffic Threshold Exceeded. Please wait." }
});
app.use("/api/", globalLimiter);

// Login Limiter: Specialized brute-force shielding for the Admin gateway
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 15, // Maximum 15 attempts per window
    message: { success: false, message: "Security Protocol: Too many attempts. Access locked for 15m." }
});

// ==========================================
// 3. ROUTE UPLINKS
// ==========================================

// Apply brute-force protection specifically to the login route
app.use("/api/admin/login", loginLimiter); 

// Mainframe API Routing Tree
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/team", require("./routes/teamRoutes"));
app.use("/api/memberships", require("./routes/membershipRoutes"));
app.use("/api/register", require("./routes/registrationRoutes"));

// ==========================================
// 4. FAILSAFE ERROR HANDLING
// ==========================================

/**
 * Global Exception Handler: Prevents server crashes and masks 
 * technical stack traces from end-users.
 */
app.use((err, req, res, next) => {
    console.error(`❌ CRITICAL EXCEPTION: ${err.stack}`);
    res.status(err.status || 500).json({ 
        success: false, 
        message: "Internal Systems Error: Integrity Check Required." 
    });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`
    🚀 CORE ONLINE | MAINFRAME ACTIVE
    ==================================
    Port: ${PORT}
    Mode: ${process.env.NODE_ENV || 'development'}
    Security: IRONCLAD
    CORS: AUTHORIZED FOR VITE
    ==================================
    `);
});