import { Request, Response } from "express";
import { Role } from "@prisma/client";
import prisma from "../prisma";
import { AppError } from "../utils/errors";
import { ensureTailorOwnsClient, getClientForUser } from "../services/clientAccess";

export const createAppointment = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  if (req.user.role !== Role.tailor) {
    throw new AppError("Only tailors can schedule appointments", 403);
  }

  const { clientId, title, date, location, notes } = req.body as {
    clientId: string;
    title: string;
    date: Date;
    location?: string;
    notes?: string;
  };

  await ensureTailorOwnsClient(req.user, clientId);

  const appointment = await prisma.appointment.create({
    data: {
      clientId,
      title,
      date,
      location,
      notes,
      status: "scheduled",
    },
  });

  return res.status(201).json(appointment);
};

export const getAppointmentsForClient = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  const { client_id } = req.params as { client_id: string };

  await getClientForUser(req.user, client_id);

  const appointments = await prisma.appointment.findMany({
    where: { clientId: client_id },
    orderBy: { date: "asc" },
  });

  return res.json(appointments);
};

export const updateAppointment = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  if (req.user.role !== Role.tailor) {
    throw new AppError("Only tailors can update appointments", 403);
  }

  const { id } = req.params as { id: string };
  const payload = req.body as Partial<{
    title: string;
    date: Date;
    location: string;
    notes: string;
    status: "scheduled" | "completed" | "canceled";
  }>;

  const appointment = await prisma.appointment.findUnique({
    where: { id },
  });

  if (!appointment) {
    throw new AppError("Appointment not found", 404);
  }

  await ensureTailorOwnsClient(req.user, appointment.clientId);

  const updated = await prisma.appointment.update({
    where: { id },
    data: {
      ...payload,
    },
  });

  return res.json(updated);
};

