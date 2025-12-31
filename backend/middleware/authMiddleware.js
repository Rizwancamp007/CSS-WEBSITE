const jwt = require("jsonwebtoken");
const Membership = require("../models/Membership");
const Admin = require("../models/Admin");

/**
 * @description Core Authentication Middleware (The Gatekeeper)
 * Verifies JWT integrity and handles cross-table identity lookups.
 * Hardened for production environments with Admin & Membership distinction.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // ---------------------------
      // Token Extraction
      // ---------------------------
      token = req.headers.authorization.split(" ")[1]?.trim();

      if (!token || token === "null" || token === "undefined") {
        throw new Error("Invalid Token Node");
      }

      // ---------------------------
      // Token Verification
      // ---------------------------
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      if (!decoded?.id) {
        throw new Error("Malformed Token Payload");
      }

      // ---------------------------
      // Cross-Collection Identity Scan
      // ---------------------------
      let user = await Admin.findById(decoded.id).select("-password");
      let isMembershipRecord = false;

      if (user) {
        // ---------------------------
        // TOKEN VERSION GUARD (Admin)
        // Invalidates old tokens after password resets.
        // ---------------------------
        if (decoded.tokenVersion !== user.tokenVersion) {
          return res.status(401).json({
            success: false,
            message: "Session Invalidated: Credential rotation detected."
          });
        }

        // ---------------------------
        // ADMIN STATUS GUARD
        // Prevents inactive admins from using system.
        // ---------------------------
        if (!user.isActive) {
          return res.status(403).json({
            success: false,
            message: "Access Revoked: Administrative node disabled."
          });
        }
      }

      // If not Admin, check Membership collection
      if (!user) {
        user = await Membership.findById(decoded.id).select("-password");
        isMembershipRecord = true;
      }

      // ---------------------------
      // Identity not found
      // ---------------------------
      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Security Breach: Identity unrecognized or node purged."
        });
      }

      // ---------------------------
      // Security Guard: Activation Enforcement (Membership)
      // Ensures board members are approved and activated
      // ---------------------------
      if (isMembershipRecord) {
        if (!user.approved || !user.isActivated) {
          return res.status(401).json({
            success: false,
            message: "Security Protocol: Node pending board approval or activation."
          });
        }
      }

      // ---------------------------
      // PROP-NORMALIZATION: Standardizes req.user
      // ---------------------------
      const userObj = user.toObject();
      userObj.id = userObj._id.toString();
      userObj.email = (userObj.email || userObj.gmail || "").toLowerCase().trim();
      userObj.permissions = userObj.permissions || {};

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
 * Implements Level 0 bypass (Master Admin) and granular Role-Based Access Control (RBAC).
 */
const authorize = (permissionKey) => {
  return (req, res, next) => {
    // ---------------------------
    // Master Admin Bypass
    // ---------------------------
    const MASTER_EMAIL = (process.env.MASTER_ADMIN_EMAIL || "css@gmail.com")
      .toLowerCase()
      .trim();
    const currentUserEmail = (req.user?.email || "").toLowerCase().trim();

    if (currentUserEmail === MASTER_EMAIL) return next();

    // ---------------------------
    // RBAC VERIFICATION
    // ---------------------------
    const permissions = req.user?.permissions || {};
    const hasAdminAccess = permissions.isAdmin === true;
    const hasSpecificPower = permissionKey && permissions[permissionKey] === true;

    if (hasAdminAccess && hasSpecificPower) {
      return next();
    }

    // ---------------------------
    // Clearance Denied
    // ---------------------------
    return res.status(403).json({
      success: false,
      message: `Clearance Denied: Level [${permissionKey}] required.`
    });
  };
};

module.exports = { protect, authorize };
