import type { Session } from "@remix-run/node";
import { json } from "@remix-run/node";
import { verifyAuthenticityToken } from "remix-utils";
import type { Guard } from "./guard";

export const csrfGuard: Guard<void, [Session]> = async (request: Request, session: Session) => {
  try {
    await verifyAuthenticityToken(request, session);
  } catch (e) {
    throw json({ response: null, errors: ["Invalid CSRF token"] });
  }
};
