import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import * as api from "~/api";
import { commitSession, getSession } from "~/sessions.server";
import { getRedirectUri } from "../login";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);

  const queries = url.searchParams;
  const code = queries.get("code");
  const to = queries.get("to");

  const searchParams = new URLSearchParams();

  if (to) {
    searchParams.append("to", to);
  }

  if (!code) {
    return redirect(`/login?${searchParams.toString()}`);
  }

  const [data, errors] = await api.authGitlab({
    code,
    redirect_uri: getRedirectUri("gitlab", url, to),
  });

  if (errors) {
    searchParams.append("error", errors[0]);
    return redirect(`/login?${searchParams.toString()}`);
  }

  const session = await getSession(request);
  session.set("token", data.token);

  return redirect(to ?? "/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
