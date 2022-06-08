import { Alert, Card, Group, List } from "@mantine/core";
import Editor from "@monaco-editor/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { AlertCircle } from "tabler-icons-react";
import type { ActionFormData } from "~/api";
import * as api from "~/api";
import { Page } from "~/components/Page";
import type { TereusContext } from "~/root";
import { authGuard } from "~/utils/authGuard";

export type SharedSubmissionLoaderResponse = ActionFormData<{
  submissionId: string;
  input: api.DownloadInlineSubmissionDataResponseDTO;
  output: api.DownloadInlineSubmissionDataResponseDTO | null;
}>;

export const loader: LoaderFunction = async ({ request, params }) => {
  const token = await authGuard(request).catch(() => null);

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
  const context = useOutletContext<TereusContext>();
  const loaderData = useLoaderData<SharedSubmissionLoaderResponse>();

  const ErrorsDisplayComposition = () => (
    <Alert icon={<AlertCircle size={16} />} title="An error occured!" color="red" mb={12}>
      <List>
        {loaderData.errors!.map((error) => (
          <List.Item key={error}>{error}</List.Item>
        ))}
      </List>
    </Alert>
  );

  return (
    <Page
      title="Shared submission"
      subtitle={
        loaderData.response
          ? `${loaderData.response.submissionId} - ${loaderData.response.input.source_language} to ${loaderData.response.input.target_language}`
          : undefined
      }
      user={context.user}
      containerFluid
      headerFluid
    >
      {!loaderData.response && loaderData.errors && <ErrorsDisplayComposition />}

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
                <ErrorsDisplayComposition />
              )}
            </Card>
          </Group>
        </>
      )}
    </Page>
  );
}
