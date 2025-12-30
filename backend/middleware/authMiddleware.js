const jwt = require("jsonwebtoken");
const Membership = require("../models/Membership");
const Admin = require("../models/Admin");

/**
 * @description Core Authentication Middleware (The Gatekeeper)
 * Verifies JWT integrity and normalizes user data for the entire mainframe.
 * Hardened to handle cross-table identity lookups and strict activation checks.
 */
const protect = async (req, res, next) => {
    let token;

    // Detect Bearer token within the authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extraction Protocol: Remove 'Bearer' prefix and any accidental whitespace
            token = req.headers.authorization.split(" ")[1].trim();
            
            // Decrypt transmission payload using the System Secret
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            /**
             * IDENTITY SCAN:
             * Priority 1: Primary Admin Table (Master/Static Admins)
             * Priority 2: Membership Table (Society Executive Board)
             */
            let user = await Admin.findById(decoded.id).select("-password");
            let isMembershipRecord = false;
            
            if (!user) {
                user = await Membership.findById(decoded.id).select("-password");
                isMembershipRecord = true;
            }

            // Identity Validation: Exit if no record matches the decrypted ID
            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Security Breach: Identity unrecognized or node purged." 
                });
            }

            /**
             * SECURITY GUARD: Activation & Approval Enforcement
             * For board members, we require both 'approved' and 'isActivated' to be true.
             */
            if (isMembershipRecord) {
                if (!user.approved || !user.isActivated) {
                    return res.status(401).json({ 
                        success: false, 
                        message: "Security Protocol: Node pending board approval or activation." 
                    });
                }
            }

            /**
             * PROP-NORMALIZATION:
             * Fuses different model structures (Admin/Membership) into a standardized 
             * request object. Ensures 'id' and 'email' are always lowercase and trimmed.
             */
            const userObj = user.toObject();
            userObj.id = userObj._id.toString(); 
            // Normalize email across both models (handles 'email' vs 'gmail' keys)
            userObj.email = (userObj.email || userObj.gmail || "").toLowerCase().trim();
            
            req.user = userObj;
            next();
        } catch (error) {
            // Forensic catch for tampered, malformed, or expired tokens
            return res.status(401).json({ 
                success: false, 
                message: "Session Expired: Re-authentication protocol required." 
            });
        }
    } else {
        return res.status(401).json({ 
            success: false, 
            message: "Security Alert: No transmission token detected." 
        });
    }
};

/**
 * @description Permission-Based Authorization (The Warden)
 * Implements Level 0 (Master) bypass and granular RBAC verification.
 */
const authorize = (permissionKey) => {
    return (req, res, next) => {
        /**
         * LEVEL 0 BYPASS PROTOCOL:
         * Normalizes the Master Email from environment to prevent bypass attempts 
         * via case variation or trailing whitespace.
         */
        const MASTER_EMAIL = (process.env.MASTER_ADMIN_EMAIL || "css@gmail.com").toLowerCase().trim();
        const currentUserEmail = (req.user?.email || "").toLowerCase().trim();

        // If current identity is the Master Admin, bypass all further checks
        if (currentUserEmail === MASTER_EMAIL) return next();

        /**
         * RBAC VERIFICATION:
         * Ensures user has 'isAdmin' flag AND the specific clearance code requested.
         */
        const permissions = req.user?.permissions || {};
        const hasAdminAccess = permissions.isAdmin === true;
        const hasSpecificPower = permissions[permissionKey] === true;

        if (hasAdminAccess && hasSpecificPower) {
            return next();
        }

        // Access Logging: Return 403 Forbidden for unauthorized clearance attempts
        res.status(403).json({ 
            success: false, 
            message: `Clearance Denied: Level [${permissionKey}] required for this node.` 
        });
    };
};

module.exports = { protect, authorize };