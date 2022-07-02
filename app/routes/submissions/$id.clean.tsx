import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import * as api from "~/api.server";
import { authGuard } from "~/utils/authGuard.server";

export const action: ActionFunction = async ({ request, params }) => {
  const { token } = await authGuard(request);

  const [response, errors] = await api.cleanSubmission(token, params.id!);

  return json({ response, errors });
};
