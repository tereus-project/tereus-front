import { createCookie } from "@remix-run/node";

export const sessionCookie = createCookie("crumble", {
  maxAge: 31_449_600, // one year
});
