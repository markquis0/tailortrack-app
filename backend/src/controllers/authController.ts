import { Request, Response } from "express";
import prisma from "../prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { signAuthToken } from "../utils/jwt";
import { AppError } from "../utils/errors";

const sanitizeUser = (user: { id: string; name: string; email: string; role: "tailor" | "client" }) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const register = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body as {
    name: string;
    email: string;
    password: string;
    role: "tailor" | "client";
  };

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    throw new AppError("Email already registered", 409);
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role,
      ...(role === "client"
        ? {
            clientProfile: {
              create: {},
            },
          }
        : {}),
    },
    include: {
      clientProfile: true,
    },
  });

  const token = signAuthToken({ userId: user.id, role: user.role });

  return res.status(201).json({
    token,
    user: sanitizeUser(user),
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body as { email: string; password: string };

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await comparePassword(password, user.passwordHash);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signAuthToken({ userId: user.id, role: user.role });

  return res.json({
    token,
    user: sanitizeUser(user),
  });
};

