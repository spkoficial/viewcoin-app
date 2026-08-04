import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL não definida. Se estiver rodando o api-server, copie " +
      "artifacts/api-server/.env.example para artifacts/api-server/.env. " +
      "Se estiver rodando comandos do @workspace/db diretamente, copie " +
      "lib/db/.env.example para lib/db/.env.",
  );
}

export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
export const db = drizzle(pool, { schema });

export * from "./schema";
