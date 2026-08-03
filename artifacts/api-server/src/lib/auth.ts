import crypto from "crypto";

// Simple token-based auth using crypto random tokens
// Tokens are stored in memory (not persistent across restarts)
// For production use a proper session store

const tokens = new Map<string, number>(); // token -> userId

export function generateToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function storeToken(token: string, userId: number): void {
  tokens.set(token, userId);
}

export function getUserIdFromToken(token: string): number | null {
  return tokens.get(token) ?? null;
}

export function removeToken(token: string): void {
  tokens.delete(token);
}

export function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "viewcoin-salt-2024").digest("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  return hashPassword(password) === hash;
}
