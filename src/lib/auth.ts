import "server-only";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { query, queryOne } from "@/lib/db";
import type { Profile } from "@/lib/types";
import { defaultAvatarUrl } from "@/lib/utils";

const COOKIE = "moxn_session";
const secret = new TextEncoder().encode(
  process.env.AUTH_SECRET || "moxn-dev-secret-change-me-in-production-please"
);

export async function hashPassword(pw: string) {
  return bcrypt.hash(pw, 10);
}

export async function verifyPassword(pw: string, hash: string) {
  return bcrypt.compare(pw, hash);
}

export async function createSessionToken(userId: string) {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(secret);
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(userId: string) {
  const token = await createSessionToken(userId);
  cookies().set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}

export function clearSessionCookie() {
  cookies().delete(COOKIE);
}

export async function getCurrentUserId(): Promise<string | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}

export async function getCurrentProfile(): Promise<Profile | null> {
  const id = await getCurrentUserId();
  if (!id) return null;
  return queryOne<Profile>(
    `select id, username, display_name, bio, avatar_url, role, is_private,
            notify_email, notify_new_follower, notify_new_review, created_at
     from users where id = $1`,
    [id]
  );
}

function baseUsername(email: string) {
  const raw = email.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, "");
  return raw || "cook";
}

export async function createUser(opts: {
  email: string;
  password: string;
  displayName: string;
}): Promise<{ id: string } | { error: string }> {
  const existing = await queryOne<{ id: string }>(
    "select id from users where lower(email) = lower($1)",
    [opts.email]
  );
  if (existing) return { error: "An account with this email already exists." };

  // unique username
  let username = baseUsername(opts.email);
  let n = 0;
  while (
    await queryOne("select 1 from users where username = $1", [username])
  ) {
    n += 1;
    username = `${baseUsername(opts.email)}${n}`;
  }

  const hash = await hashPassword(opts.password);
  const avatar = defaultAvatarUrl(username);
  const row = await queryOne<{ id: string }>(
    `insert into users (email, password_hash, username, display_name, avatar_url)
     values ($1, $2, $3, $4, $5) returning id`,
    [opts.email.toLowerCase(), hash, username, opts.displayName, avatar]
  );
  return { id: row!.id };
}

export const CONST = { COOKIE };
