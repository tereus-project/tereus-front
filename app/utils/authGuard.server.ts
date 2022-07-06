import type { Session } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import * as api from "~/api.server";
import { getSession } from "~/sessions.server";
import type { Guard } from "./guard";

function redirectToLogin(request: Request, errors?: string[]) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  searchParams.set("to", `${url.pathname}${url.search}`);

  if (errors) {
    searchParams.set("errors", JSON.stringify(errors));
  }

  return redirect(`/login?${searchParams.toString()}`);
}

export interface AuthGuardResult {
  token: string;
  session: Session;
}

export const authGuard: Guard<AuthGuardResult> = async (request: Request) => {
  const session = await getSession(request);

  if (!session.has("token")) {
    throw redirectToLogin(request);
  }

  const [, errors] = await api.authCheck(session.get("token"));
  console.log(errors);
  if (errors) {
    throw redirectToLogin(request, errors);
  }

  return {
    token: session.get("token"),
    session,
  };
};

export const authGuardMaybe: Guard<AuthGuardResult | Record<keyof AuthGuardResult, null>> = async (
  request: Request
) => {
  return authGuard(request).catch(() => ({
    token: null,
    session: null,
  }));
};
