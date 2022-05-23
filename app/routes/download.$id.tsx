import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import * as api from "~/api";
import { sessionCookie } from "~/cookie";

export const loader: LoaderFunction = async ({ request, params }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) || {};

  if (!session.token) {
    const url = new URL(request.url);
    return redirect(`/login?to=${url.pathname}${url.search}`);
  }

  const [, errors, res] = await api.downloadSubmission(session.token, params.id!);

  if (errors) {
    return json(
      {
        errors,
      },
      {
        status: res?.status,
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );
  }

  return res;
};