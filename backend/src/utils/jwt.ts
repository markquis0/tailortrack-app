import jwt from "jsonwebtoken";
import env from "../config/env";

export interface AuthTokenPayload {
  userId: string;
  role?: "tailor" | "client";
  isAnonymous?: boolean;
}

const TOKEN_EXPIRY = "7d";
const ANONYMOUS_TOKEN_EXPIRY = "365d";

export const signAuthToken = (payload: AuthTokenPayload, isAnonymous = false): string => {
  const expiry = isAnonymous ? ANONYMOUS_TOKEN_EXPIRY : TOKEN_EXPIRY;
  return jwt.sign(payload, env.jwtSecret, { expiresIn: expiry });
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
};

