import { Role } from "@prisma/client";
import prisma from "../prisma";
import { AppError } from "../utils/errors";

interface AuthContext {
  userId: string;
  role?: "tailor" | "client";
}

export const getClientForUser = async (
  auth: AuthContext,
  clientId: string
) => {
  if (!auth.role) {
    throw new AppError("This action requires authentication", 401);
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client) {
    throw new AppError("Client not found", 404);
  }

  const isTailorOwner =
    auth.role === Role.tailor && client.tailorId === auth.userId;
  const isClientOwner =
    auth.role === Role.client && client.clientUserId === auth.userId;

  if (!isTailorOwner && !isClientOwner) {
    throw new AppError("You do not have access to this client", 403);
  }

  return client;
};

export const ensureTailorOwnsClient = async (
  auth: AuthContext,
  clientId: string
) => {
  if (auth.role !== Role.tailor) {
    throw new AppError("This action is restricted to tailors", 403);
  }

  const client = await prisma.client.findUnique({
    where: { id: clientId },
  });

  if (!client || client.tailorId !== auth.userId) {
    throw new AppError("Client not found or not assigned to this tailor", 404);
  }

  return client;
};

