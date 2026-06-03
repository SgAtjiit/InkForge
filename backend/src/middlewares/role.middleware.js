import { ApiError } from "../utils/ApiError.js";

export const requireRole = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "Authentication required"));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new ApiError(403, "Forbidden: You do not have permission to access this resource"));
        }

        next();
    };
};
