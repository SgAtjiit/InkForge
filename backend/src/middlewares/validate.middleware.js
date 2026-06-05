import { ApiError } from "../utils/ApiError.js";

export const validate = (schema, target = "body") => {
    return (req, res, next) => {
        const result = schema.safeParse(req[target]);

        if (!result.success) {
            const formattedErrors = result.error.errors.map((err) => ({
                field: err.path.join("."),
                message: err.message,
            }));
            return next(new ApiError(400, "Validation failed", formattedErrors));
        }

        req[target] = result.data;
        next();
    };
};
