import { Card, Group } from "@mantine/core";
import Editor from "@monaco-editor/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import type { ActionFormData } from "~/api";
import * as api from "~/api";
import { ErrorList } from "~/components/ErrorList";
import { Page } from "~/components/Page";
import { authGuardMaybe } from "~/utils/authGuard.server";

export type SharedSubmissionLoaderResponse = ActionFormData<{
  submissionId: string;
  input: api.DownloadInlineSubmissionDataResponseDTO;
  output: api.DownloadInlineSubmissionDataResponseDTO | null;
}>;

export const loader: LoaderFunction = async ({ request, params }) => {
  const { token } = await authGuardMaybe(request);

  const [inputResponse, inputErrors] = await api.downloadInlineSubmissionInput(token, params.id!);
  if (inputErrors) {
    return json({ response: null, errors: inputErrors });
  }

  const [outputResponse, outputErrors] = await api.downloadInlineSubmissionOutput(token, params.id!);

  return json<SharedSubmissionLoaderResponse>({
    response: {
      submissionId: params.id!,
      input: inputResponse,
      output: outputResponse,
    },
    errors: outputErrors,
  });
};

export default function Remixer() {
  const loaderData = useLoaderData<SharedSubmissionLoaderResponse>();

  return (
    <Page
      title="Shared submission"
      subtitle={
        loaderData.response
          ? `${loaderData.response.submissionId} - ${loaderData.response.input.source_language} to ${loaderData.response.input.target_language}`
          : undefined
      }
      containerFluid
      headerFluid
    >
      {!loaderData.response && <ErrorList errors={loaderData.errors} />}

      {loaderData.response && (
        <>
          <Group>
            <Card shadow="sm" withBorder style={{ flex: 1 }}>
              <Editor
                language={loaderData.response.input.source_language}
                height="500px"
                options={{
                  readOnly: true,
                }}
                value={atob(loaderData.response.input.data)}
              />
            </Card>

            <Card shadow="sm" withBorder style={{ flex: 1 }}>
              {loaderData.response.output ? (
                <Editor
                  language={loaderData.response.output.target_language}
                  height="500px"
                  options={{
                    readOnly: true,
                  }}
                  value={atob(loaderData.response.output.data)}
                />
              ) : (
                <ErrorList errors={loaderData.errors} />
              )}
            </Card>
          </Group>
        </>
      )}
    </Page>
  );
}
