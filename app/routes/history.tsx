import { Group, Pagination, Table } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate } from "@remix-run/react";
import { useEffect, useState } from "react";
import * as api from "~/api.server";
import { ErrorList } from "~/components/ErrorList";
import { HistoryEntry } from "~/components/history/HistoryEntry";
import { Page } from "~/components/Page";
import { authGuard } from "~/utils/authGuard.server";

interface LoaderResponse {
  response: api.GetUserSubmissionsResponseDTO | null;
  errors: string[] | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const { token } = await authGuard(request);
  const url = new URL(request.url);

  const page = url.searchParams.get("page");

  const [response, errors] = await api.getUserSubmissions(token, page ? Number(page) : 1);
  return json<LoaderResponse>({ response, errors });
};

export default function History() {
  const loaderData = useLoaderData<LoaderResponse>();

  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState(loaderData.response?.items ?? []);

  useEffect(() => {
    setSubmissions(loaderData.response?.items ?? []);
  }, [loaderData.response]);

  return (
    <Page title="Transpilation history" containerSize="xl">
      <ErrorList errors={loaderData.errors} />

      <Table mb={12}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Created at</th>
            <th>Duration</th>
            <th>Source</th>
            <th>Target</th>
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
      {loaderData.response && (
        <Group position="right">
          <Pagination
            page={loaderData.response.meta.current_page}
            onChange={(page) => {
              navigate(`/history?page=${page}`);
            }}
            total={loaderData.response.meta.total_pages}
            withEdges
          />
        </Group>
      )}
    </Page>
  );
}
