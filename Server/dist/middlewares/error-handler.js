import { ZodError } from "zod";
import { AppError } from "../utils/app-error";
import { logger } from "../utils/logger";
export const errorHandler = (err, _req, res, _next) => {
    if (err instanceof ZodError) {
        res.status(400).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid request payload",
                details: err.issues
            }
        });
        return;
    }
    if (err instanceof AppError) {
        res.status(err.statusCode).json({
            success: false,
            error: {
                code: err.code,
                message: err.message
            }
        });
        return;
    }
    logger.error({ err }, "Unhandled error");
    res.status(500).json({
        success: false,
        error: {
            code: "INTERNAL_ERROR",
            message: "Internal server error"
        }
    });
};
