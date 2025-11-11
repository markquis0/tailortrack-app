import { z } from "zod";

export const clientIdParamSchema = z.object({
  id: z.string().uuid(),
});

export const clientIdParamByClientSchema = z.object({
  client_id: z.string().uuid(),
});

export const createClientSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8).optional(),
  storeName: z.string().optional(),
  notes: z.string().optional(),
});

export const updateClientSchema = z.object({
  storeName: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

