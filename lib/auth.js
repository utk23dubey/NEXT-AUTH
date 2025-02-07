import { Lucia } from "lucia";
import { BetterSqlite3Adapter } from "@lucia-auth/adapter-sqlite";
import db from "./db";
import { cookies } from "next/headers";

const adapter = new BetterSqlite3Adapter(db, {
  user: "users",
  session: "sessions",
});

const lucia = new Lucia(adapter, {
  sessionCookie: {
    expires: false,
    attributes: {
      secure: process.env.NODE_ENV == "production",
    },
  },
});

export async function createAuthSession(userId) {
  const session = await lucia.createSession(userId, {});
  const session_cookie = lucia.createSessionCookie(session.id);
  await cookies().set(
    session_cookie.name,
    session_cookie.value,
    session_cookie.attributes
  );
}

export async function verifyAuthUser() {
  const session_cookie = cookies().get(lucia.sessionCookieName);

  if (!session_cookie) {
    return {
      user: null,
      session: null,
    };
  }

  const session_id = session_cookie.value;

  if (!session_id) {
    return {
      user: null,
      session: null,
    };
  }

  const result = lucia.validateSession(session_id);
  try {
    if (result.session && result.session.fresh) {
      const sessionCookie = lucia.createSessionCookie(result.session.id);
      cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
      );
    }

    if (!result.session) {
      const cookieBlanck = lucia.createBlankSessionCookie();
      cookies().set(
        cookieBlanck.name,
        cookieBlanck.value,
        cookieBlanck.attributes
      );
    }
  } catch {}

  return result;
}

export async function removeSession() {
  const { session } = await verifyAuthUser();

  if (!session) {
    return {
      error: "UNAUTHORIZED",
    };
  }

  await lucia.invalidateSession(session.id);

  const cookieBlanck = lucia.createBlankSessionCookie();
  cookies().set(cookieBlanck.name, cookieBlanck.value, cookieBlanck.attributes);
}
