import { Table, TableContainer, Tbody, Th, Thead, Tr } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { useState } from "react";
import * as api from "~/api";
import { HistoryEntry } from "~/components/history/HistoryEntry";
import { Page } from "~/components/Page";
import type { TereusContext } from "~/root";
import { authGuard } from "~/utils/authGuard";

interface LoaderResponse {
  response?: api.SubmissionDTO[];
  errors: string[] | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const token = await authGuard(request);

  const [response, errors] = await api.getUserSubmissions(token);
  return json<LoaderResponse>({
    response: response?.submissions,
    errors,
  });
};

export default function History() {
  const context = useOutletContext<TereusContext>();
  const loaderData = useLoaderData<LoaderResponse>();

  const [submissions, setSubmissions] = useState(loaderData.response ?? []);

  return (
    <Page title="Remix history" user={context.user} headingMaxW="full">
      <TableContainer>
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Created at</Th>
              <Th>Source language</Th>
              <Th>Target language</Th>
              <Th>Download</Th>
              <Th>Share</Th>
              <Th>Delete</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {submissions.map((submission) => (
              <HistoryEntry
                key={submission.id}
                submission={submission}
                onChange={(newSubmission) => {
                  setSubmissions(
                    submissions.map((submission) => {
                      if (submission.id === newSubmission.id) {
                        return newSubmission;
                      }

                      return submission;
                    })
                  );
                }}
                onDelete={(submission) => {
                  setSubmissions(submissions.filter((s) => s.id !== submission.id));
                }}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Page>
  );
}
