import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import * as api from "~/api";
import { sessionCookie } from "~/cookie";

export const loader: LoaderFunction = async ({ request }) => {
  const queries = new URL(request.url).searchParams;
  const code = queries.get("code");
  const to = queries.get("to");

  const searchParams = new URLSearchParams();
  
  if (to) {
    searchParams.append("to", to);
  }

  if (!code) {
    return redirect(`/login?${searchParams.toString()}`);
  }

  const [data, errors] = await api.authGithub({ code });

  if (errors) {
    searchParams.append("error", errors[0]);
    return redirect(`/login?${searchParams.toString()}`);
  }

  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) || {};
  session.token = data.token;

  return redirect(to ?? "/", {
    headers: {
      "Set-Cookie": await sessionCookie.serialize(session),
    },
  });
};
