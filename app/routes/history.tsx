import {
  Button,
  ButtonGroup,
  Heading,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useToast,
} from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import { debounce } from "lodash";
import { Fragment, useEffect, useState } from "react";
import { RiArrowDownSLine, RiFileCopyFill } from "react-icons/ri";
import { TbShare, TbShareOff } from "react-icons/tb";
import * as api from "~/api";
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

  const toast = useToast();

  const [submissions, setSubmissions] = useState(loaderData.response ?? []);
  const [collapsedSubmissions, setCollapsedSubmissions] = useState(
    Object.fromEntries(
      submissions.filter((submission) => submission.status === "failed").map((submission) => [submission.id, false])
    )
  );

  const [copiedSubmissions, setCopiedSubmissions] = useState<
    Record<
      string,
      {
        active: boolean;
        timedDeactivate: () => void;
      }
    >
  >({});

  function copyShareUrl(submissionId: string) {
    navigator.clipboard.writeText(`${location.origin}/s/${submissionId}`);

    const timedDeactivate =
      copiedSubmissions[submissionId]?.timedDeactivate ??
      debounce(() => {
        setCopiedSubmissions((copiedSubmissions) => ({
          ...copiedSubmissions,
          [submissionId]: {
            ...copiedSubmissions[submissionId],
            active: false,
          },
        }));
      }, 1400);

    setCopiedSubmissions({
      ...copiedSubmissions,
      [submissionId]: {
        active: true,
        timedDeactivate,
      },
    });

    timedDeactivate();
  }

  const visibilityFetcher = useFetcher<api.ActionFormData<api.UpdateSubmissionVisibilityResponseDTO>>();
  useEffect(() => {
    if (visibilityFetcher.type === "done") {
      if (visibilityFetcher.data?.response) {
        copyShareUrl(visibilityFetcher.data.response.id);

        setSubmissions((submissions) => {
          return submissions.map((submission) => {
            if (submission.id === visibilityFetcher.data.response.id) {
              return {
                ...submission,
                is_public: visibilityFetcher.data.response.is_public,
              };
            }

            return submission;
          });
        });
      } else if (visibilityFetcher.data?.errors) {
        toast({
          isClosable: true,
          title: "An error occured",
          status: "error",
          description: visibilityFetcher.data.errors.join("\n"),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visibilityFetcher]);

  const toggleSubmissionDetails = (submissionId: string) => {
    setCollapsedSubmissions({
      ...collapsedSubmissions,
      [submissionId]: !collapsedSubmissions[submissionId],
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
              <Th></Th>
            </Tr>
          </Thead>
          <Tbody>
            {submissions.map((submission) => (
              <Fragment key={submission.id}>
                <Tr
                  onClick={submission.status === "failed" ? () => toggleSubmissionDetails(submission.id) : undefined}
                  _hover={{
                    cursor: submission.status === "failed" ? "pointer" : "auto",
                  }}
                >
                  <Td>{submission.id}</Td>
                  <Td>{submission.created_at}</Td>
                  <Td>{submission.source_language}</Td>
                  <Td>{submission.target_language}</Td>
                  <Td>
                    {submission.status === "done" ? (
                      <Button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();

                          download(submission.id);
                        }}
                      >
                        Download
                      </Button>
                    ) : (
                      <Button disabled>
                        {submission.status[0].toUpperCase()}
                        {submission.status.slice(1)}
                      </Button>
                    )}
                  </Td>
                  <Td>
                    {submission.is_inline &&
                      (submission.is_public ? (
                        <ButtonGroup isAttached variant="outline">
                          <Button
                            leftIcon={<RiFileCopyFill />}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              copyShareUrl(submission.id);
                            }}
                          >
                            {copiedSubmissions[submission.id]?.active ? "Copied!" : "Copy link"}
                          </Button>
                          <IconButton
                            aria-label="Copy"
                            icon={<TbShareOff />}
                            disabled={visibilityFetcher.state !== "idle"}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();

                              visibilityFetcher.submit(
                                { isPublic: "false" },
                                {
                                  action: `/submissions/${submission.id}/visibility`,
                                  replace: true,
                                  method: "post",
                                }
                              );
                            }}
                          />
                        </ButtonGroup>
                      ) : (
                        <Button
                          variant="outline"
                          leftIcon={<TbShare />}
                          disabled={visibilityFetcher.state !== "idle"}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();

                            visibilityFetcher.submit(
                              { isPublic: "true" },
                              {
                                action: `/submissions/${submission.id}/visibility`,
                                replace: true,
                                method: "post",
                              }
                            );
                          }}
                        >
                          Share and copy link
                        </Button>
                      ))}
                  </Td>
                  <Td>
                    {submission.status === "failed" && (
                      <RiArrowDownSLine transform={collapsedSubmissions[submission.id] ? "rotate(180)" : ""} />
                    )}
                  </Td>
                </Tr>
                {submission.status === "failed" && (
                  <Tr hidden={!collapsedSubmissions[submission.id]}>
                    <Td colSpan={6}>
                      <Heading mb={4} size="lg">
                        Reason
                      </Heading>
                      <Text mb={2}>{submission.reason}</Text>
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
