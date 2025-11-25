import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    url: env("DATABASE_URL"),
    // SHADOW_DATABASE_URL is optional - only needed for migrate dev
    // For production (migrate deploy), it's not required
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL || undefined,
  },
});
