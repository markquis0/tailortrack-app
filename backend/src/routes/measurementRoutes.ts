import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import {
  getMeasurements,
  upsertMeasurements,
} from "../controllers/measurementController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  measurementClientParamSchema,
  upsertMeasurementSchema,
} from "../validators/measurementSchemas";

const router = Router();

router.use(authenticate);

router.post("/", validate(upsertMeasurementSchema), asyncHandler(upsertMeasurements));

// Route for anonymous users to get their own measurements
router.get("/me", asyncHandler(getMeasurements));

// Route for authenticated users to get client measurements
router.get(
  "/:client_id",
  validate(measurementClientParamSchema, "params"),
  asyncHandler(getMeasurements)
);

export default router;

