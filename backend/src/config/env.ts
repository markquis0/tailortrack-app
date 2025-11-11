import dotenv from "dotenv";

dotenv.config();

const numberFromEnv = (value: string | undefined, fallback: number): number => {
  if (!value) {
    return fallback;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: numberFromEnv(process.env.PORT, 4000),
  databaseUrl: process.env.DATABASE_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "change-me",
};

if (!env.databaseUrl) {
  console.warn(
    "DATABASE_URL is not set. Prisma will not be able to connect until this is configured."
  );
}

if (!process.env.JWT_SECRET) {
  console.warn(
    "JWT_SECRET is not set. Using a default value is not secure. Update your environment configuration."
  );
}

export default env;

