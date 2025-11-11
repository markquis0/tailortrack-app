import { z } from "zod";

const dateTimeTransformer = z
  .string()
  .datetime()
  .transform((value) => new Date(value));

export const createAppointmentSchema = z.object({
  clientId: z.string().uuid(),
  title: z.string().min(1),
  date: dateTimeTransformer,
  location: z.string().optional(),
  notes: z.string().optional(),
});

export const updateAppointmentSchema = z
  .object({
    title: z.string().min(1).optional(),
    date: dateTimeTransformer.optional(),
    location: z.string().optional(),
    notes: z.string().optional(),
    status: z.enum(["scheduled", "completed", "canceled"]).optional(),
  })
  .refine(
    (data) =>
      Object.values(data).some((value) => value !== undefined),
    "At least one field must be provided"
  );

export const appointmentParamSchema = z.object({
  id: z.string().uuid(),
});

export const appointmentClientParamSchema = z.object({
  client_id: z.string().uuid(),
});

