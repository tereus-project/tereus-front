import type { ActionFunction } from "@remix-run/node";
import { json } from "remix-utils";
import type { ActionFormData, LoginResponseDTO } from "~/api.server";
import { authRevokeGithub } from "~/api.server";
import { authGuard } from "~/utils/authGuard.server";

export type RevokeGithubResponse = ActionFormData<{
  response: LoginResponseDTO;
}>;

export const action: ActionFunction = async ({ request }) => {
  const { token } = await authGuard(request);

  const [response, errors] = await authRevokeGithub(token);
  return json({ response, errors });
};
