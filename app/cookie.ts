import { createCookie } from "remix";

export const sessionCookie = createCookie("crumble", {
  maxAge: 31_449_600, // one year
});
