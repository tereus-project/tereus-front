import type { LoaderFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import * as api from "~/api.server";
import { commitSession, getSession } from "~/sessions.server";
import { authGuardMaybe } from "~/utils/authGuard.server";
import { csrfGuard } from "~/utils/csrfGuard.server";

export const loader: LoaderFunction = async ({ request }) => {
  const { token } = await authGuardMaybe(request);

  const queries = new URL(request.url).searchParams;
  const code = queries.get("code");
  const to = queries.get("to");

  const searchParams = new URLSearchParams();

  if (to && !token) {
    searchParams.append("to", to);
  }

  if (!code) {
    if (token) {
      return redirect(`/settings/security`);
    }

    return redirect(`/login?${searchParams.toString()}`);
  }

  const session = await getSession(request);

  try {
    await csrfGuard(request, session, queries.get("state"));
  } catch (e) {
    searchParams.append("error", "Invalid CSRF token");

    if (token) {
      return redirect(`/settings/security?${searchParams.toString()}`);
    }

    return redirect(`/login?${searchParams.toString()}`);
  }

  const [data, errors] = await api.authLoginGithub(token, { code });

  if (errors) {
    searchParams.append("error", errors[0]);

    if (token) {
      return redirect(`/settings/security?${searchParams.toString()}`);
    }

    return redirect(`/login?${searchParams.toString()}`);
  }

  session.set("token", data.token);

  return redirect(to ?? "/", {
    headers: {
      "Set-Cookie": await commitSession(session),
    },
  });
};
