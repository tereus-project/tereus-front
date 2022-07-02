import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import * as api from "~/api.server";
import { getSession } from "~/sessions.server";

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request);

  if (!session.has("token")) {
    return json({ errors: ["Not logged in"] });
  }

  const values = await request.formData();

  const tier = values.get("tier")?.toString();

  if (!tier) {
    return json({ errors: ["Missing tier"] });
  }

  const origin = new URL(request.url).origin;

  const [response, errors] = await api.createSubscriptionCheckout(session.get("token"), {
    tier,
    success_url: `${origin}/pricing?success=true&checkout_session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/pricing`,
  });
  return json({ response, errors });
};
