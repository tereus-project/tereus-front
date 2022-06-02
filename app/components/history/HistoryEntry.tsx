import { Button, ButtonGroup, Heading, IconButton, Td, Tr, Text, useToast } from "@chakra-ui/react";
import { useFetcher } from "@remix-run/react";
import { debounce } from "lodash";
import { useEffect, useState } from "react";
import { RiArrowDownSLine, RiFileCopyFill } from "react-icons/ri";
import { TbShare, TbShareOff } from "react-icons/tb";
import type * as api from "~/api";

export type HistoryEntryProps = {
  submission: api.SubmissionDTO;
  onChange: (submission: api.SubmissionDTO) => void;
};

export function HistoryEntry({ submission, onChange }: HistoryEntryProps) {
  const toast = useToast();

  const [collapsed, setCollapsed] = useState(false);
  const [hasBeenCopied, setHasBeenCopied] = useState(false);

  const disableHasBeenCopied = debounce(() => setHasBeenCopied(false), 1400);

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

  function copyShareUrl(submissionId: string) {
    navigator.clipboard.writeText(`${location.origin}/s/${submissionId}`);

    disableHasBeenCopied();
    setHasBeenCopied(true);
  }

  const updateVisibilityFetcher = useFetcher<api.ActionFormData<api.UpdateSubmissionVisibilityResponseDTO>>();
  useEffect(() => {
    if (updateVisibilityFetcher.type === "done") {
      if (updateVisibilityFetcher.data?.response) {
        copyShareUrl(updateVisibilityFetcher.data.response.id);
        onChange({
          ...submission,
          is_public: updateVisibilityFetcher.data.response!.is_public,
        });
      } else if (updateVisibilityFetcher.data?.errors) {
        toast({
          isClosable: true,
          title: "An error occured",
          status: "error",
          description: updateVisibilityFetcher.data.errors.join("\n"),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateVisibilityFetcher]);

  return (
    <>
      <Tr
        onClick={submission.status === "failed" ? () => setCollapsed(!collapsed) : undefined}
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
                  {hasBeenCopied ? "Copied!" : "Copy link"}
                </Button>
                <IconButton
                  aria-label="Copy"
                  icon={<TbShareOff />}
                  disabled={updateVisibilityFetcher.state !== "idle"}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    updateVisibilityFetcher.submit(
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
                disabled={updateVisibilityFetcher.state !== "idle"}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();

                  updateVisibilityFetcher.submit(
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
        <Td>{submission.status === "failed" && <RiArrowDownSLine transform={collapsed ? "rotate(180)" : ""} />}</Td>
      </Tr>
      {submission.status === "failed" && (
        <Tr hidden={!collapsed}>
          <Td colSpan={6}>
            <Heading mb={4} size="lg">
              Reason
            </Heading>
            <Text mb={2}>{submission.reason}</Text>
          </Td>
        </Tr>
      )}
    </>
  );
}