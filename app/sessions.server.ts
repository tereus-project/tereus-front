import { createCookie, createCookieSessionStorage } from "@remix-run/node";

const sessionCookie = createCookie("crumble", {
  secrets: [process.env.SESSION_COOKIE_SECRET ?? "I'm a default secret :>"],
  maxAge: 31_449_600, // one year
});

const { commitSession, destroySession, ...session } = createCookieSessionStorage({
  cookie: sessionCookie,
});

export { commitSession, destroySession };

export function getSession(request: Request) {
  return session.getSession(request.headers.get("cookie"));
}
