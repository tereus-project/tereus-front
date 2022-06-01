import {
  Alert,
  AlertDescription,
  AlertIcon,
  AlertTitle,
  Box,
  Container,
  Heading,
  ListItem,
  Stack,
  UnorderedList,
} from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
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
  const token = await authGuard(request);

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
    <Alert status="error">
      <AlertIcon />
      <AlertTitle>An error occured!</AlertTitle>
      <AlertDescription>
        <UnorderedList>
          {loaderData.errors!.map((error) => (
            <ListItem key={error}>{error}</ListItem>
          ))}
        </UnorderedList>
      </AlertDescription>
    </Alert>
  );

  return (
    <Page user={context.user}>
      {!loaderData.response && loaderData.errors && (
        <Container maxW="4xl" mb={4}>
          <ErrorsDisplayComposition />
        </Container>
      )}

      {loaderData.response && (
        <>
          <Heading as="h4" size="md" mb={4}>
            Submission {loaderData.response.submissionId} - {loaderData.response.input.source_language} to{" "}
            {loaderData.response.input.target_language}
          </Heading>

          <Stack direction={["column", "column", "column", "row"]}>
            <Box borderWidth="1px" borderRadius="lg" p={4} shadow="md" width="full">
              <Editor
                language={loaderData.response.input.source_language}
                height="500px"
                options={{
                  readOnly: true,
                }}
                value={atob(loaderData.response.input.data)}
              />
            </Box>

            <Box borderWidth="1px" borderRadius="lg" p={4} shadow="md" width="full">
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
            </Box>
          </Stack>
        </>
      )}
    </Page>
  );
}
