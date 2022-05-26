import { redirect } from "@remix-run/node";
import * as api from '~/api';
import { sessionCookie } from "~/cookie";
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
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) || {};

  if (!session.token) {
    throw redirectToLogin(request);
  }

  const [, errors] = await api.validateToken(session.token);
  if (errors) {
    throw redirectToLogin(request, errors);
  }

  return session.token;
}
