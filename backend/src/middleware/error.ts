import { Request, Response, NextFunction } from "express";
import env from "../config/env";
import { AppError, isAppError } from "../utils/errors";

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  next(new AppError(`Route ${req.originalUrl} not found`, 404));
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (!isAppError(err)) {
    console.error(err);
    return res.status(500).json({
      message: "Unexpected server error",
    });
  }

  if (env.nodeEnv !== "production") {
    console.error(err);
  }

  return res.status(err.statusCode).json({
    message: err.message,
    ...(err.details ? { details: err.details } : {}),
  });
};

