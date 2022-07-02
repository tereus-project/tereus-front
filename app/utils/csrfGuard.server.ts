import type { Session } from "@remix-run/node";
import { json } from "@remix-run/node";
import { verifyAuthenticityToken } from "remix-utils";
import type { Guard } from "./guard";

export const csrfGuard: Guard<void, [Session, (string | null)?]> = async (request: Request, session: Session, value?: string | null) => {
  try {
    if (value) {
      const token = session.get("csrf");
      if (token !== value) {
        throw new Error("Invalid CSRF token");
      }
    } else {
      await verifyAuthenticityToken(request, session);
    }
  } catch (e) {
    throw json({ response: null, errors: ["Invalid CSRF token"] });
  }
};
