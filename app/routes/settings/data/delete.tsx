import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import * as api from "~/api";
import { authGuard } from "~/utils/authGuard";

export const action: ActionFunction = async ({ request, params }) => {
  const { token } = await authGuard(request);

  const [response, errors] = await api.deleteCrrentUser(token);

  return json({ response, errors });
};
