const jwt = require("jsonwebtoken");
const Membership = require("../models/Membership");
const Admin = require("../models/Admin");

/**
 * @description Core Authentication Middleware (The Gatekeeper)
 * Verifies JWT integrity and handles cross-table identity lookups.
 */
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        try {
            // Extraction: Standardizing the token string
            token = req.headers.authorization.split(" ")[1]?.trim();
            
            if (!token || token === "null" || token === "undefined") {
                throw new Error("Invalid Token Node");
            }

            // Decrypt transmission payload
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            /**
             * IDENTITY SCAN:
             * Cross-checks Admin vs Membership collections to identify the operator.
             */
            let user = await Admin.findById(decoded.id).select("-password");
            let isMembershipRecord = false;
            
            if (!user) {
                user = await Membership.findById(decoded.id).select("-password");
                isMembershipRecord = true;
            }

            if (!user) {
                return res.status(401).json({ 
                    success: false, 
                    message: "Security Breach: Identity unrecognized or node purged." 
                });
            }

            /**
             * SECURITY GUARD: Activation Enforcement
             * Ensures board members are approved and activated before allowing mainframe access.
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
             * PROP-NORMALIZATION: Standardizes req.user
             */
            const userObj = user.toObject();
            userObj.id = userObj._id.toString(); 
            userObj.email = (userObj.email || userObj.gmail || "").toLowerCase().trim();
            
            req.user = userObj;
            next();
        } catch (error) {
            console.error("AUTH_PROTECT_ERROR:", error.message);
            return res.status(401).json({ 
                success: false, 
                message: "Session Expired: Re-authentication required." 
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
 * Implements Level 0 bypass and granular Role-Based Access Control (RBAC).
 */
const authorize = (permissionKey) => {
    return (req, res, next) => {
        // PRODUCTION SYNC: Ensure Master Email is pulled correctly from Render Env
        const MASTER_EMAIL = (process.env.MASTER_ADMIN_EMAIL || "css@gmail.com").toLowerCase().trim();
        const currentUserEmail = (req.user?.email || "").toLowerCase().trim();

        // Level 0 Bypass
        if (currentUserEmail === MASTER_EMAIL) return next();

        /**
         * RBAC VERIFICATION
         */
        const permissions = req.user?.permissions || {};
        const hasAdminAccess = permissions.isAdmin === true;
        
        // Safety check: ensure permissionKey exists in the user's permissions object
        const hasSpecificPower = permissions[permissionKey] === true;

        if (hasAdminAccess && hasSpecificPower) {
            return next();
        }

        res.status(403).json({ 
            success: false, 
            message: `Clearance Denied: Level [${permissionKey}] required.` 
        });
    };
};

module.exports = { protect, authorize };