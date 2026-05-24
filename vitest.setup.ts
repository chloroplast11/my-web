import "@testing-library/jest-dom/vitest";
import { config } from "dotenv";
import path from "node:path";

// Load .env.local for tests that need DB access (e.g., featured-db.test.ts)
config({ path: path.resolve(process.cwd(), ".env.local") });
