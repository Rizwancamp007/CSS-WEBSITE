const mongoose = require("mongoose");

/**
 * @description Database Uplink Configuration
 * Hardened for high-availability and anti-hang protection.
 */
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI, {
            // Anti-crash settings
            serverSelectionTimeoutMS: 5000, 
            socketTimeoutMS: 45000,
            family: 4 // Use IPv4 to avoid local resolution delays
        });

        console.log(`
        ✅ MAINFRAME UPLINK ESTABLISHED
        ====================================
        Host: ${conn.connection.host}
        Database: ${conn.connection.name}
        Status: ONLINE
        ====================================
        `);
    } catch (err) {
        console.error(`❌ CRITICAL SYSTEM FAILURE: ${err.message}`);
        // Exit process with failure to prevent ghost connections
        process.exit(1);
    }
};

module.exports = connectDB;