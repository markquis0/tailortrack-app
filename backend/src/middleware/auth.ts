import { Request, Response, NextFunction } from "express";
import { verifyAuthToken, AuthTokenPayload } from "../utils/jwt";
import { AppError } from "../utils/errors";

const parseAuthHeader = (header: string | undefined): string | null => {
  if (!header) {
    return null;
  }
  const [scheme, token] = header.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }
  return token;
};

export const authenticate = (req: Request, _res: Response, next: NextFunction) => {
  const token = parseAuthHeader(req.headers.authorization);
  if (!token) {
    return next(new AppError("Authentication required", 401));
  }

  try {
    const payload = verifyAuthToken(token);
    req.user = payload;
    return next();
  } catch (error) {
    return next(new AppError("Invalid or expired token", 401));
  }
};

export const requireRole =
  (roles: AuthTokenPayload["role"] | AuthTokenPayload["role"][]) =>
  (req: Request, _res: Response, next: NextFunction) => {
    const allowedRoles = Array.isArray(roles) ? roles : [roles];
    if (!req.user) {
      return next(new AppError("Authentication required", 401));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new AppError("Insufficient permissions", 403));
    }
    return next();
  };

