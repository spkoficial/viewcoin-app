import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL nao definida. Copie lib/db/.env.example para lib/db/.env " +
      "(ou defina DATABASE_URL no ambiente) e preencha a conexao do PostgreSQL.",
  );
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts").split(path.sep).join("/"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
