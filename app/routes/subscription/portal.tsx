import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import * as api from "~/api";
import { sessionCookie } from "~/cookie";

export const action: ActionFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) || {};

  if (!session.token) {
    return json({ errors: ["Not logged in"] });
  }

  const values = await request.formData();

  const returnURL = values.get("return_url")?.toString();

  if (!returnURL) {
    return json({ errors: ["Missing return URL"] });
  }

  const [response, errors] = await api.createBillingPortal(session.token, {
    return_url: returnURL,
  });
  return json({ response, errors });
};
