import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { commitSession, getSession } from "~/sessions.server";

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSession(request);
  session.unset("token");

  return redirect("/login", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
