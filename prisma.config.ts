// Prisma v7 configuration file
// Uses DIRECT_URL (port 5432) for CLI commands (migrate, push, studio, introspect).
// At runtime, PrismaClient should be initialized with DATABASE_URL (pooler, port 6543).
// Environment variables are injected via dotenv-cli (see db:* scripts in package.json).
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["DIRECT_URL"],
  },
});
