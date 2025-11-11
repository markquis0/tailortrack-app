import jwt from "jsonwebtoken";
import env from "../config/env";

export interface AuthTokenPayload {
  userId: string;
  role: "tailor" | "client";
}

const TOKEN_EXPIRY = "7d";

export const signAuthToken = (payload: AuthTokenPayload): string => {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: TOKEN_EXPIRY });
};

export const verifyAuthToken = (token: string): AuthTokenPayload => {
  return jwt.verify(token, env.jwtSecret) as AuthTokenPayload;
};

