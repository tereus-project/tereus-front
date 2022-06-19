import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import * as api from "~/api";
import type { ActionFormDataEnsured } from "~/api";
import { authGuard } from "~/utils/authGuard";

export type DownloadSubmissionMainOutputLoaderResponse = ActionFormDataEnsured<{
  submissionId: string;
  isTerminal: boolean;
  submissionData: api.DownloadInlineSubmissionDataResponseDTO | null;
}>;

export const loader: LoaderFunction = async ({ request, params }) => {
  const token = await authGuard(request);

  const [submissionData, errors, res] = await api.downloadInlineSubmissionOutput(token, params.id!);
  return json<DownloadSubmissionMainOutputLoaderResponse>(
    {
      response: {
        submissionId: params.id!,
        isTerminal: !!res && res.ok && (submissionData?.status === "done" || submissionData?.status === "failed"),
        submissionData,
      },
      errors,
    },
    {
      status: res?.status,
    }
  );
};
