import { NextFunction, Request, Response } from "express";
import { ZodSchema } from "zod";
import { AppError } from "../utils/errors";

type RequestLocation = "body" | "query" | "params";

export const validate =
  <T>(schema: ZodSchema<T>, location: RequestLocation = "body") =>
  (req: Request, _res: Response, next: NextFunction) => {
    try {
      const parsed = schema.parse(req[location]);
      (req as Record<RequestLocation, unknown>)[location] = parsed;
      return next();
    } catch (error) {
      return next(new AppError("Validation failed", 422, error));
    }
  };

