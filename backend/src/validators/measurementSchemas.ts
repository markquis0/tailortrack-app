import { z } from "zod";

const measurementValue = z.coerce.number().positive().optional();

export const upsertMeasurementSchema = z.object({
  clientId: z.string().uuid().optional(),
  userId: z.string().uuid().optional(),
  chest: measurementValue,
  overarm: measurementValue,
  waist: measurementValue,
  hipSeat: measurementValue,
  neck: measurementValue,
  arm: measurementValue,
  pantOutseam: measurementValue,
  pantInseam: measurementValue,
  coatInseam: measurementValue,
  height: measurementValue,
  weight: measurementValue,
  coatSize: z.string().optional(),
  pantSize: z.string().optional(),
  dressShirtSize: z.string().optional(),
  shoeSize: z.string().optional(),
  materialPreference: z.string().optional(),
  dateTaken: z
    .string()
    .datetime()
    .optional()
    .transform((value) => (value ? new Date(value) : undefined)),
});

export const measurementClientParamSchema = z.object({
  client_id: z.string().uuid(),
});

