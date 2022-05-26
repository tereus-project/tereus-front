import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import * as api from "~/api";
import { getSession } from "~/sessions.server";

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request);

  if (!session.has("token")) {
    return json({ errors: ["Not logged in"] });
  }

  const values = await request.formData();

  const returnURL = values.get("return_url")?.toString();

  if (!returnURL) {
    return json({ errors: ["Missing return URL"] });
  }

  const [response, errors] = await api.createBillingPortal(session.get("token"), {
    return_url: returnURL,
  });
  return json({ response, errors });
};
