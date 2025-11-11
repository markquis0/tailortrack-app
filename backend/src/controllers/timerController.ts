import { Request, Response } from "express";
import { Role } from "@prisma/client";
import prisma from "../prisma";
import { AppError } from "../utils/errors";
import { ensureTailorOwnsClient, getClientForUser } from "../services/clientAccess";

export const startTimer = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  if (req.user.role !== Role.tailor) {
    throw new AppError("Only tailors can start timers", 403);
  }

  const { clientId, description } = req.body as {
    clientId: string;
    description?: string;
  };

  await ensureTailorOwnsClient(req.user, clientId);

  const activeTimer = await prisma.timer.findFirst({
    where: {
      clientId,
      tailorId: req.user.userId,
      endTime: null,
    },
  });

  if (activeTimer) {
    throw new AppError("An active timer already exists for this client", 409);
  }

  const timer = await prisma.timer.create({
    data: {
      clientId,
      tailorId: req.user.userId,
      startTime: new Date(),
      description,
    },
  });

  return res.status(201).json(timer);
};

export const stopTimer = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  if (req.user.role !== Role.tailor) {
    throw new AppError("Only tailors can stop timers", 403);
  }

  const { timerId, endTime } = req.body as {
    timerId: string;
    endTime?: Date;
  };

  const timer = await prisma.timer.findUnique({
    where: { id: timerId },
  });

  if (!timer) {
    throw new AppError("Timer not found", 404);
  }

  if (timer.tailorId !== req.user.userId) {
    throw new AppError("You do not have access to this timer", 403);
  }

  if (timer.endTime) {
    throw new AppError("Timer is already stopped", 409);
  }

  const resolvedEndTime = endTime ?? new Date();
  const durationMinutes = Math.max(
    1,
    Math.round(
      (resolvedEndTime.getTime() - timer.startTime.getTime()) / 60000
    )
  );

  const updated = await prisma.timer.update({
    where: { id: timerId },
    data: {
      endTime: resolvedEndTime,
      duration: durationMinutes,
    },
  });

  return res.json(updated);
};

export const getTimersForClient = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { client_id } = req.params as { client_id: string };

  await getClientForUser(req.user, client_id);

  const timers = await prisma.timer.findMany({
    where: {
      clientId: client_id,
      ...(req.user.role === Role.tailor
        ? { tailorId: req.user.userId }
        : {}),
    },
    orderBy: { startTime: "desc" },
  });

  return res.json(timers);
};

