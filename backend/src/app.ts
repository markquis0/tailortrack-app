import express from "express";
import cors from "cors";
import env from "./config/env";
import authRoutes from "./routes/authRoutes";
import clientRoutes from "./routes/clientRoutes";
import measurementRoutes from "./routes/measurementRoutes";
import appointmentRoutes from "./routes/appointmentRoutes";
import timerRoutes from "./routes/timerRoutes";
import { errorHandler, notFoundHandler } from "./middleware/error";

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
  });
});

app.use("/auth", authRoutes);
app.use("/clients", clientRoutes);
app.use("/measurements", measurementRoutes);
app.use("/appointments", appointmentRoutes);
app.use("/timers", timerRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;

