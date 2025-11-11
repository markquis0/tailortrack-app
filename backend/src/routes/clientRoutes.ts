import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import {
  createClient,
  getClientById,
  getClients,
  updateClient,
} from "../controllers/clientController";
import { authenticate, requireRole } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  clientIdParamSchema,
  createClientSchema,
  updateClientSchema,
} from "../validators/clientSchemas";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(getClients));

router.post(
  "/",
  requireRole("tailor"),
  validate(createClientSchema),
  asyncHandler(createClient)
);

router.get(
  "/:id",
  validate(clientIdParamSchema, "params"),
  asyncHandler(getClientById)
);

router.put(
  "/:id",
  validate(clientIdParamSchema, "params"),
  validate(updateClientSchema),
  asyncHandler(updateClient)
);

export default router;

