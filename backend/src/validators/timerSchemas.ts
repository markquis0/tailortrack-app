import { z } from "zod";

export const startTimerSchema = z.object({
  clientId: z.string().uuid(),
  description: z.string().optional(),
});

export const stopTimerSchema = z.object({
  timerId: z.string().uuid(),
  endTime: z
    .string()
    .datetime()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
});

export const timerClientParamSchema = z.object({
  client_id: z.string().uuid(),
});

