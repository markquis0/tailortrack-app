import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import {
  getTimersForClient,
  startTimer,
  stopTimer,
} from "../controllers/timerController";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  startTimerSchema,
  stopTimerSchema,
  timerClientParamSchema,
} from "../validators/timerSchemas";

const router = Router();

router.use(authenticate);

router.post(
  "/start",
  requireRole("tailor"),
  validate(startTimerSchema),
  asyncHandler(startTimer)
);

router.post(
  "/stop",
  requireRole("tailor"),
  validate(stopTimerSchema),
  asyncHandler(stopTimer)
);

router.get(
  "/:client_id",
  validate(timerClientParamSchema, "params"),
  asyncHandler(getTimersForClient)
);

export default router;

