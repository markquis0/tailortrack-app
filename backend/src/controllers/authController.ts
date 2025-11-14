import { Request, Response } from "express";
import prisma from "../prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { signAuthToken } from "../utils/jwt";
import { AppError } from "../utils/errors";

const sanitizeUser = (user: { 
  id: string; 
  name: string | null; 
  email: string | null; 
  role: "tailor" | "client" | null;
  isAnonymous: boolean;
  firstName: string | null;
  lastName: string | null;
}) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  isAnonymous: user.isAnonymous,
  firstName: user.firstName,
  lastName: user.lastName,
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
      isAnonymous: false,
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

  const token = signAuthToken({ userId: user.id, role: user.role! }, false);

  return res.status(201).json({
    token,
    user: sanitizeUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAnonymous: user.isAnonymous,
      firstName: user.firstName,
      lastName: user.lastName,
    }),
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

  if (!user.passwordHash) {
    throw new AppError("Invalid credentials", 401);
  }

  const isMatch = await comparePassword(password, user.passwordHash);

  if (!isMatch) {
    throw new AppError("Invalid credentials", 401);
  }

  if (!user.role) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = signAuthToken({ userId: user.id, role: user.role }, false);

  return res.json({
    token,
    user: sanitizeUser({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      isAnonymous: user.isAnonymous,
      firstName: user.firstName,
      lastName: user.lastName,
    }),
  });
};

export const createAnonymous = async (req: Request, res: Response) => {
  const user = await prisma.user.create({
    data: {
      isAnonymous: true,
    },
  });

  const token = signAuthToken({ userId: user.id, isAnonymous: true }, true);

  return res.status(201).json({
    token,
    user: {
      id: user.id,
      isAnonymous: true,
      name: null,
      email: null,
      role: null,
      firstName: null,
      lastName: null,
    },
  });
};

export const updateProfile = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { firstName, lastName, email } = req.body as {
    firstName?: string;
    lastName?: string;
    email?: string;
  };

  // Check if email is already taken by another user
  if (email) {
    const existing = await prisma.user.findUnique({
      where: { email },
    });
    if (existing && existing.id !== req.user.userId) {
      throw new AppError("Email already registered", 409);
    }
  }

  const updateData: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    name?: string;
    isAnonymous?: boolean;
  } = {};

  if (firstName !== undefined) updateData.firstName = firstName || null;
  if (lastName !== undefined) updateData.lastName = lastName || null;
  if (email !== undefined) updateData.email = email || null;
  
  // Generate name from firstName and lastName if provided
  if (firstName || lastName) {
    const generatedName = [firstName, lastName].filter(Boolean).join(" ");
    updateData.name = generatedName || undefined;
  }

  // Mark as no longer anonymous if email or name is provided
  if (email || firstName || lastName) {
    updateData.isAnonymous = false;
  }

  const user = await prisma.user.update({
    where: { id: req.user.userId },
    data: updateData,
  });

  return res.json({
    user: sanitizeUser(user),
  });
};

