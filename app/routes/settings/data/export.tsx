import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import * as api from "~/api";
import { authGuard } from "~/utils/authGuard.server";

export const loader: LoaderFunction = async ({ request, params }) => {
  const { token } = await authGuard(request);

  const [, errors, res] = await api.downloadUserExport(token);

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
