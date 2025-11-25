import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  engine: "classic",
  datasource: {
    // Use process.env directly to ensure environment variables are read correctly
    url: process.env.DATABASE_URL || "",
    // SHADOW_DATABASE_URL is optional - only needed for migrate dev
    // For production (migrate deploy), it's not required
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL || undefined,
  },
});
