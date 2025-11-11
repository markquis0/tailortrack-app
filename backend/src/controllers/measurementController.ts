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
    dateTaken,
    ...measurementData
  } = req.body as Record<string, unknown> & { clientId: string; dateTaken?: Date };

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

  const { client_id } = req.params as { client_id: string };

  await getClientForUser(req.user, client_id);

  const measurement = await prisma.measurement.findUnique({
    where: { clientId: client_id },
  });

  if (!measurement) {
    return res.status(204).send();
  }

  return res.json(measurement);
};

