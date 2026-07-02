import "dotenv/config";
import { defineConfig } from "prisma/config";

const PLACEHOLDER_URL = "postgresql://localhost:5432/postgres";

export default defineConfig({
  schema: "prisma/schema.postgres-export.prisma",
  datasource: {
    url: process.env.DIRECT_DATABASE_URL ?? PLACEHOLDER_URL,
  },
});
