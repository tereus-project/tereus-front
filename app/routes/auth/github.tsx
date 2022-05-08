import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import * as api from "~/api";
import { sessionCookie } from "~/cookie";

export const loader: LoaderFunction = async ({ request }) => {
  const queries = new URL(request.url).searchParams;
  const code = queries.get("code");

  if (!code) {
    return redirect("/login");
  }

  const [data, errors] = await api.authGithub({ code });

  if (errors) {
    return redirect("/login");
  }

  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) || {};
  session.token = data.token;

  return redirect("/", {
    headers: {
      "Set-Cookie": await sessionCookie.serialize(session),
    },
  });
};
