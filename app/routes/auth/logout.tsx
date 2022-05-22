import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import * as api from "~/api";
import { sessionCookie } from "~/cookie";

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = { token: "" };

  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionCookie.serialize(session),
    },
  });
};
