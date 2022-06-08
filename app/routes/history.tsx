import { Table } from "@mantine/core";
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
  response: api.GetUserSubmissionsResponseDTO | null;
  errors: string[] | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const token = await authGuard(request);

  const [response, errors] = await api.getUserSubmissions(token);
  return json<LoaderResponse>({ response, errors });
};

export default function History() {
  const context = useOutletContext<TereusContext>();
  const loaderData = useLoaderData<LoaderResponse>();

  const [submissions, setSubmissions] = useState(loaderData.response?.items ?? []);

  return (
    <Page title="Remix history" user={context.user} containerSize="xl">
      <Table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Created at</th>
            <th>Source language</th>
            <th>Target language</th>
            <th>Download</th>
            <th>Share</th>
            <th>Delete</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
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
              onClean={(submission) => {
                setSubmissions(submissions.filter((s) => s.id !== submission.id));
              }}
            />
          ))}
        </tbody>
      </Table>
    </Page>
  );
}
