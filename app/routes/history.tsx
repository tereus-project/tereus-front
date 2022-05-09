import { Text, Button, Heading, Table, TableContainer, Tbody, Td, Th, Thead, Tr, useToast } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { Fragment, useState } from "react";
import { RiArrowDownSLine } from "react-icons/ri";
import * as api from "~/api";
import { Page } from "~/components/Page";
import { sessionCookie } from "~/cookie";
import type { TereusContext } from "~/root";

interface LoaderResponse {
  response?: api.SubmissionDTO[];
  errors: string[] | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) || {};

  if (!session.token) {
    const url = new URL(request.url);
    return redirect(`/login?to=${url.pathname}${url.search}`);
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
  const [collapsedSources, setCollapsedSources] = useState(
    Object.fromEntries(sources.filter((source) => source.status === "failed").map((source) => [source.id, false]))
  );

  const toggleSourceDetails = (sourceId: string) => {
    setCollapsedSources({
      ...collapsedSources,
      [sourceId]: !collapsedSources[sourceId],
    });
  };

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
        <Table size="sm">
          <Thead>
            <Tr>
              <Th>ID</Th>
              <Th>Created at</Th>
              <Th>Source language</Th>
              <Th>Target language</Th>
              <Th>Download</Th>
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {sources.map((source) => (
              <Fragment key={source.id}>
                <Tr
                  onClick={source.status === "failed" ? () => toggleSourceDetails(source.id) : undefined}
                  _hover={{
                    cursor: source.status === "failed" ? "pointer" : "auto",
                  }}
                >
                  <Td>{source.id}</Td>
                  <Td>{source.created_at}</Td>
                  <Td>{source.source_language}</Td>
                  <Td>{source.target_language}</Td>
                  <Td>
                    {source.status === "done" ? (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

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
                  <Td>
                    {source.status === "failed" && (
                      <RiArrowDownSLine transform={collapsedSources[source.id] ? "rotate(180)" : ""} />
                    )}
                  </Td>
                </Tr>
                {source.status === "failed" && (
                  <Tr hidden={!collapsedSources[source.id]}>
                    <Td colSpan={6}>
                      <Heading mb={4} size="lg">
                        Reason
                      </Heading>
                      <Text mb={2}>{source.reason}</Text>
                    </Td>
                  </Tr>
                )}
              </Fragment>
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Page>
  );
}
