import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { Request, Response, NextFunction } from "express";

const ADMIN_SESSION_COOKIE = "barbie_fun_admin";
const SESSION_TTL_SECONDS = 8 * 60 * 60;

function requiredSecret(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }
  return value;
}

function signatureFor(timestamp: string): string {
  return createHmac("sha256", requiredSecret("SESSION_SECRET"))
    .update(`admin:${timestamp}`)
    .digest("base64url");
}

function passwordDigest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

function readCookie(request: Request, name: string): string | null {
  const header = request.headers.cookie;
  if (!header) return null;

  for (const part of header.split(";")) {
    const separator = part.indexOf("=");
    if (separator < 0) continue;
    const key = part.slice(0, separator).trim();
    if (key === name) return decodeURIComponent(part.slice(separator + 1).trim());
  }
  return null;
}

function hasValidSession(request: Request): boolean {
  const value = readCookie(request, ADMIN_SESSION_COOKIE);
  if (!value) return false;

  const separator = value.indexOf(".");
  if (separator <= 0) return false;
  const timestamp = value.slice(0, separator);
  const signature = value.slice(separator + 1);
  const issuedAt = Number(timestamp);
  if (!Number.isSafeInteger(issuedAt)) return false;
  const now = Math.floor(Date.now() / 1000);
  if (issuedAt > now || now - issuedAt > SESSION_TTL_SECONDS) return false;

  const expected = signatureFor(timestamp);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expected);
  return (
    providedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(providedBuffer, expectedBuffer)
  );
}

export function setAdminSession(response: Response): void {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const value = `${timestamp}.${signatureFor(timestamp)}`;
  response.cookie(ADMIN_SESSION_COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: SESSION_TTL_SECONDS * 1000,
    path: "/",
  });
}

export function clearAdminSession(response: Response): void {
  response.clearCookie(ADMIN_SESSION_COOKIE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}

export function isAdminPassword(value: unknown): boolean {
  const configuredPassword = process.env.ADMIN_PASSWORD;
  if (typeof value !== "string" || !configuredPassword) return false;

  const provided = passwordDigest(value);
  const expected = passwordDigest(configuredPassword);
  return timingSafeEqual(provided, expected);
}

export function requireAdmin(
  request: Request,
  response: Response,
  next: NextFunction,
): void {
  try {
    if (hasValidSession(request)) {
      next();
      return;
    }
  } catch (error) {
    request.log.error({ err: error }, "Admin session validation failed");
  }

  response.status(401).json({ error: "Admin authentication required" });
}

export function adminSessionIsConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD && process.env.SESSION_SECRET);
}

export function hasAdminSession(request: Request): boolean {
  try {
    return hasValidSession(request);
  } catch (error) {
    request.log.error({ err: error }, "Admin session validation failed");
    return false;
  }
}