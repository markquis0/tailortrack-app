import { Router } from "express";
import asyncHandler from "../utils/asyncHandler";
import { register, login, createAnonymous, updateProfile } from "../controllers/authController";
import { validate } from "../middleware/validate";
import { loginSchema, registerSchema, updateProfileSchema } from "../validators/authSchemas";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/register", validate(registerSchema), asyncHandler(register));
router.post("/login", validate(loginSchema), asyncHandler(login));
router.post("/anonymous", asyncHandler(createAnonymous));
router.patch("/update-profile", authenticate, validate(updateProfileSchema), asyncHandler(updateProfile));

export default router;

