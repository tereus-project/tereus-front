import { Button, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useToast } from "@chakra-ui/react";
import { useState } from "react";
import { json, LoaderFunction, redirect, useLoaderData, useOutletContext } from "remix";
import * as api from "~/api";
import { Page } from "~/components/Page";
import { sessionCookie } from "~/cookie";
import { TereusContext } from "~/root";

interface LoaderResponse {
  response?: api.SubmissionDTO[];
  errors: string[] | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) || {};

  if (!session.token) {
    return redirect("/login");
  }

  const [response, errors] = await api.getUserSubmissions(session.token);
  return json<LoaderResponse>({
    response: response?.submissions,
    errors,
  });
};

export default function History() {
  const context = useOutletContext<TereusContext>();
  const loaderData = useLoaderData<LoaderResponse>();

  const toast = useToast();

  const [sources] = useState(loaderData.response ?? []);

  const download = async (id: string) => {
    const res = await fetch(`/download/${id}`);

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${id}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
    } else {
      const data = await res.json();

      toast({
        title: "Failed to download files",
        status: "error",
        description: data?.errors?.join("\n"),
      });
    }
  };

  return (
    <Page title="Remix history" user={context.user}>
      <TableContainer>
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Created at</Th>
              <Th>Source language</Th>
              <Th>Target language</Th>
              <Th>Download</Th>
            </Tr>
          </Thead>
          <Tbody>
            {sources.map((source) => (
              <Tr key={source.id}>
                <Td>{source.id}</Td>
                <Td>{source.created_at}</Td>
                <Td>{source.source_language}</Td>
                <Td>{source.target_language}</Td>
                <Td>
                  {source.status === "done" ? (
                    <Button
                      onClick={() => {
                        download(source.id);
                      }}
                    >
                      Download
                    </Button>
                  ) : (
                    <Button disabled>
                      {source.status[0].toUpperCase()}
                      {source.status.slice(1)}
                    </Button>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Page>
  );
}
