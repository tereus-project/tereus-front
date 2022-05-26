import { redirect } from "@remix-run/node";
import * as api from '~/api';
import { getSession } from "~/sessions.server";
import type { Guard } from "./guard";

function redirectToLogin(request: Request, errors?: string[]) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  searchParams.set('to', `${url.pathname}${url.search}`);

  if (errors) {
    searchParams.set('errors', JSON.stringify(errors));
  }

  return redirect(`/login?${searchParams.toString()}`);
}

export const authGuard: Guard<string> = async (request: Request) => {
  const session = await getSession(request);

  if (!session.has("token")) {
    throw redirectToLogin(request);
  }

  const [, errors] = await api.validateToken(session.get("token"));
  if (errors) {
    throw redirectToLogin(request, errors);
  }

  return session.get("token");
}
