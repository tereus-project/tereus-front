import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { commitSession, getSession } from "~/sessions.server";
import { csrfGuard } from "~/utils/csrfGuard.server";

export const action: ActionFunction = async ({ request }) => {
  const session = await getSession(request);
  await csrfGuard(request, session);

  session.unset("token");

  return json(
    { success: true },
    {
      headers: {
        "Set-Cookie": await commitSession(session),
      },
    }
  );
};
