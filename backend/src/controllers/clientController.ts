import { Request, Response } from "express";
import { Role } from "@prisma/client";
import prisma from "../prisma";
import { AppError } from "../utils/errors";
import { hashPassword } from "../utils/password";
import { getClientForUser } from "../services/clientAccess";

const sanitizeUser = (user: { id: string; name: string | null; email: string | null }) => ({
  id: user.id,
  name: user.name ?? "",
  email: user.email ?? "",
});

const formatClientResponse = (client: {
  id: string;
  storeName: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
  clientUser: { id: string; name: string | null; email: string | null } | null;
  measurements: { updatedAt: Date }[];
  appointments: { id: string; date: Date; status: string }[];
}) => {
  const upcomingAppointment = client.appointments
    .filter((appointment) => appointment.date > new Date())
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];

  return {
    id: client.id,
    storeName: client.storeName,
    notes: client.notes,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
    clientUser: client.clientUser ? sanitizeUser(client.clientUser) : null,
    lastMeasurementUpdate: client.measurements[0]?.updatedAt ?? null,
    nextAppointment: upcomingAppointment
      ? {
          id: upcomingAppointment.id,
          date: upcomingAppointment.date,
          status: upcomingAppointment.status,
        }
      : null,
  };
};

export const getClients = async (req: Request, res: Response) => {
  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  if (req.user.role === Role.tailor) {
    const clients = await prisma.client.findMany({
      where: { tailorId: req.user.userId },
      include: {
        clientUser: true,
        measurements: {
          orderBy: { updatedAt: "desc" },
          take: 1,
        },
        appointments: {
          where: {
            status: "scheduled",
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.json(clients.map(formatClientResponse));
  }

  // Anonymous users don't have client profiles
  if (req.user.isAnonymous) {
    throw new AppError("Client profile not found", 404);
  }

  const client = await prisma.client.findFirst({
    where: { clientUserId: req.user.userId },
    include: {
      clientUser: true,
      measurements: {
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
      appointments: {
        where: {
          status: "scheduled",
        },
      },
    },
  });

  if (!client) {
    throw new AppError("Client profile not found", 404);
  }

  return res.json(formatClientResponse(client));
};

const generateTemporaryPassword = () => {
  const random = Math.random().toString(36).slice(-10);
  return random.padEnd(12, "a");
};

export const createClient = async (req: Request, res: Response) => {
  if (!req.user || req.user.role !== Role.tailor) {
    throw new AppError("Only tailors can create clients", 403);
  }

  const { name, email, password, storeName, notes } = req.body as {
    name: string;
    email: string;
    password?: string;
    storeName?: string | null;
    notes?: string | null;
  };

  let temporaryPassword: string | undefined;

  let user = await prisma.user.findUnique({ where: { email } });

  if (user && user.role !== Role.client) {
    throw new AppError("Email belongs to a non-client user", 409);
  }

  if (!user) {
    const passwordToUse = password ?? generateTemporaryPassword();
    const passwordHash = await hashPassword(passwordToUse);
    temporaryPassword = password ? undefined : passwordToUse;

    user = await prisma.user.create({
      data: {
        name,
        email,
        passwordHash,
        role: Role.client,
        clientProfile: {
          create: {
            tailorId: req.user.userId,
            storeName,
            notes,
          },
        },
      },
      include: {
        clientProfile: true,
      },
    });
  } else {
    const existingClientProfile = await prisma.client.findUnique({
      where: { clientUserId: user.id },
    });

    if (existingClientProfile && existingClientProfile.tailorId && existingClientProfile.tailorId !== req.user.userId) {
      throw new AppError("Client is already assigned to a different tailor", 409);
    }

    await prisma.client.upsert({
      where: { clientUserId: user.id },
      create: {
        clientUserId: user.id,
        tailorId: req.user.userId,
        storeName,
        notes,
      },
      update: {
        tailorId: req.user.userId,
        storeName: storeName ?? null,
        notes: notes ?? null,
      },
    });
  }

  const clientProfile = await prisma.client.findUniqueOrThrow({
    where: { clientUserId: user.id },
    include: {
      clientUser: true,
      measurements: {
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
      appointments: {
        where: { status: "scheduled" },
      },
    },
  });

  return res.status(201).json({
    client: formatClientResponse(clientProfile),
    temporaryPassword,
  });
};

export const getClientById = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };

  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  await getClientForUser(req.user, id);

  const client = await prisma.client.findUniqueOrThrow({
    where: { id },
    include: {
      clientUser: true,
      measurements: {
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
      appointments: true,
    },
  });

  return res.json(formatClientResponse(client));
};

export const updateClient = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { storeName, notes } = req.body as {
    storeName?: string | null;
    notes?: string | null;
  };

  if (!req.user) {
    throw new AppError("Authentication required", 401);
  }

  await getClientForUser(req.user, id);

  const client = await prisma.client.update({
    where: { id },
    data: {
      storeName: storeName ?? null,
      notes: notes ?? null,
    },
    include: {
      clientUser: true,
      measurements: {
        orderBy: { updatedAt: "desc" },
        take: 1,
      },
      appointments: true,
    },
  });

  return res.json(formatClientResponse(client));
};

