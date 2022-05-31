import type { ActionFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import * as api from "~/api";
import { authGuard } from "~/utils/authGuard";

export const action: ActionFunction = async ({ request, params }) => {
  const token = await authGuard(request);

  const values = await request.formData();
  const isPublic = values.get("isPublic")?.toString();

  if (!isPublic) {
    return json({ errors: ["Missing is_public"] });
  }

  const [response, errors] = await api.updateSubmissionVisibility(token, params.id!, {
    is_public: isPublic.toLowerCase() === "true",
  });

  return json({ response, errors });
};
