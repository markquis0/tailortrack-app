import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import { register, login } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema } from "../validators/authSchemas";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));

export default router;

