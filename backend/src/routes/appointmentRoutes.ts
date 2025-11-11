import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import {
  createAppointment,
  getAppointmentsForClient,
  updateAppointment,
} from "../controllers/appointmentController";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  appointmentClientParamSchema,
  appointmentParamSchema,
  createAppointmentSchema,
  updateAppointmentSchema,
} from "../validators/appointmentSchemas";

const router = Router();

router.use(authenticate);

router.post(
  "/",
  requireRole("tailor"),
  validate(createAppointmentSchema),
  asyncHandler(createAppointment)
);

router.get(
  "/:client_id",
  validate(appointmentClientParamSchema, "params"),
  asyncHandler(getAppointmentsForClient)
);

router.put(
  "/:id",
  requireRole("tailor"),
  validate(appointmentParamSchema, "params"),
  validate(updateAppointmentSchema),
  asyncHandler(updateAppointment)
);

export default router;

