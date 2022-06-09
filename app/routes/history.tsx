import { Alert, Group, List, Pagination, Table } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useNavigate, useOutletContext } from "@remix-run/react";
import { useEffect, useState } from "react";
import { AlertCircle } from "tabler-icons-react";
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
  const url = new URL(request.url);

  const page = url.searchParams.get("page");

  const [response, errors] = await api.getUserSubmissions(token, page ? Number(page) : 1);
  return json<LoaderResponse>({ response, errors });
};

export default function History() {
  const context = useOutletContext<TereusContext>();
  const loaderData = useLoaderData<LoaderResponse>();

  const navigate = useNavigate();

  const [submissions, setSubmissions] = useState(loaderData.response?.items ?? []);

  useEffect(() => {
    setSubmissions(loaderData.response?.items ?? []);
  }, [loaderData.response]);

  return (
    <Page title="Remix history" user={context.user} containerSize="xl">
      {loaderData.errors && (
        <Alert icon={<AlertCircle size={16} />} title="An error occured!" color="red" mb={12}>
          <List>
            {loaderData.errors!.map((error) => (
              <List.Item key={error}>{error}</List.Item>
            ))}
          </List>
        </Alert>
      )}

      <Table mb={12}>
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
