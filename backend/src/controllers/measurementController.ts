import { Request, Response } from "express";
import prisma from "../prisma";
import { AppError } from "../utils/errors";
import { getClientForUser } from "../services/clientAccess";

export const upsertMeasurements = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const {
    clientId,
    userId,
    dateTaken,
    ...measurementData
  } = req.body as Record<string, unknown> & { 
    clientId?: string; 
    userId?: string;
    dateTaken?: Date 
  };

  // For anonymous users, use userId directly
  if (req.user.isAnonymous || userId) {
    const targetUserId = userId || req.user.userId;
    
    // Verify the userId matches the authenticated user
    if (targetUserId !== req.user.userId) {
      throw new AppError("Unauthorized", 403);
    }

    const sanitizedData = Object.fromEntries(
      Object.entries(measurementData).filter(([, value]) => value !== undefined)
    );

    const existing = await prisma.measurement.findFirst({
      where: { userId: targetUserId },
    });

    const measurement = existing
      ? await prisma.measurement.update({
          where: { id: existing.id },
          data: {
            ...(dateTaken ? { dateTaken } : {}),
            ...sanitizedData,
            updatedById: req.user.userId,
          },
        })
      : await prisma.measurement.create({
          data: {
            userId: targetUserId,
            ...(dateTaken ? { dateTaken } : {}),
            ...sanitizedData,
            updatedById: req.user.userId,
          },
        });

    return res.status(201).json(measurement);
  }

  // For authenticated users with clients
  if (!clientId) {
    throw new AppError("clientId or userId required", 400);
  }

  await getClientForUser(req.user, clientId);

  const sanitizedData = Object.fromEntries(
    Object.entries(measurementData).filter(([, value]) => value !== undefined)
  );

  const measurement = await prisma.measurement.upsert({
    where: { clientId },
    create: {
      clientId,
      ...(dateTaken ? { dateTaken } : {}),
      ...sanitizedData,
      updatedById: req.user.userId,
    },
    update: {
      ...(dateTaken ? { dateTaken } : {}),
      ...sanitizedData,
      updatedById: req.user.userId,
    },
  });

  return res.status(201).json(measurement);
};

export const getMeasurements = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { client_id } = req.params as { client_id?: string };

  // For anonymous users, get measurements by userId
  if (req.user.isAnonymous) {
    const measurement = await prisma.measurement.findUnique({
      where: { userId: req.user.userId },
    });

    if (!measurement) {
      return res.status(204).send();
    }

    return res.json(measurement);
  }

  // For authenticated users with clients
  if (!client_id) {
    throw new AppError("client_id required", 400);
  }

  await getClientForUser(req.user, client_id);

  const measurement = await prisma.measurement.findUnique({
    where: { clientId: client_id },
  });

  if (!measurement) {
    return res.status(204).send();
  }

  return res.json(measurement);
};

