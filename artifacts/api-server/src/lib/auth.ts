import { createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response } from "express";
import type { AdminUser } from "@workspace/db";

export const SESSION_COOKIE_NAME = "ajn_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 8;

export type AuthRole = "owner" | "admin" | "staff" | "delivery";

export interface AuthSession {
  id: number;
  name: string;
  username: string;
  role: AuthRole;
  permissions: string[];
  exp: number;
}

function getSessionSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (secret) return secret;

  if (process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET must be set in production.");
  }

  return "development-only-change-me";
}

function encodeBase64Url(value: unknown): string {
  return Buffer.from(JSON.stringify(value)).toString("base64url");
}

function decodeBase64Url<T>(value: string): T | null {
  try {
    return JSON.parse(Buffer.from(value, "base64url").toString("utf8")) as T;
  } catch {
    return null;
  }
}

function sign(value: string): string {
  return createHmac("sha256", getSessionSecret()).update(value).digest("base64url");
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

export function createSessionToken(
  user: Pick<AdminUser, "id" | "fullName" | "username" | "role">,
  permissions: string[],
): string {
  const header = encodeBase64Url({ alg: "HS256", typ: "JWT" });
  const payload = encodeBase64Url({
    id: user.id,
    name: user.fullName,
    username: user.username,
    role: user.role,
    permissions,
    exp: Math.floor(Date.now() / 1000) + SESSION_MAX_AGE_SECONDS,
  });
  const unsigned = `${header}.${payload}`;

  return `${unsigned}.${sign(unsigned)}`;
}

export function verifySessionToken(token: string | undefined): AuthSession | null {
  if (!token) return null;

  const [header, payload, signature] = token.split(".");
  if (!header || !payload || !signature) return null;

  const unsigned = `${header}.${payload}`;
  if (!safeEqual(signature, sign(unsigned))) return null;

  const session = decodeBase64Url<AuthSession>(payload);
  if (!session || typeof session.exp !== "number") return null;
  if (session.exp <= Math.floor(Date.now() / 1000)) return null;

  return session;
}

export function getSessionFromRequest(req: Request): AuthSession | null {
  const cookieToken = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  const authHeader = req.headers.authorization;
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  return verifySessionToken(cookieToken ?? bearerToken);
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_MAX_AGE_SECONDS * 1000,
    path: "/",
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}
