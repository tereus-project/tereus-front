import { Button, Code, createStyles, Group, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useFetcher } from "@remix-run/react";
import { formatDistance, parseJSON } from "date-fns";
import debounce from "lodash/debounce";
import prettyBytes from "pretty-bytes";
import { useEffect, useState } from "react";
import { ChevronDown, Copy, Share, ShareOff, Trash } from "tabler-icons-react";
import type * as api from "~/api.server";

export type HistoryEntryProps = {
  submission: api.SubmissionDTO;
  onChange: (submission: api.SubmissionDTO) => void;
  onClean: (submission: api.SubmissionDTO) => void;
};

const useStyles = createStyles((theme, _params, getRef) => ({
  error: {
    padding: "1em 2em !important",
  },
}));

export function HistoryEntry({ submission, onChange, onClean }: HistoryEntryProps) {
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

      showNotification({
        color: "red",
        title: "Failed to download files",
        message: data?.errors?.join("\n"),
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
        copyShareUrl(updateVisibilityFetcher.data.response.share_id);
        onChange({
          ...submission,
          is_public: updateVisibilityFetcher.data.response!.is_public,
        });
      } else if (updateVisibilityFetcher.data?.errors) {
        showNotification({
          color: "red",
          title: "An error occured",
          message: updateVisibilityFetcher.data.errors.join("\n"),
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateVisibilityFetcher]);

  const cleanFetcher = useFetcher<api.ActionFormData<null>>();
  useEffect(() => {
    if (cleanFetcher.type === "done") {
      onClean(submission);
    } else if (cleanFetcher.data?.errors) {
      showNotification({
        color: "red",
        title: "An error occured",
        message: cleanFetcher.data.errors.join("\n"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cleanFetcher]);

  const { classes } = useStyles();

  return (
    <>
      <tr
        onClick={submission.status === "failed" ? () => setCollapsed(!collapsed) : undefined}
        style={{
          cursor: submission.status === "failed" ? "pointer" : undefined,
        }}
      >
        <td>{submission.id}</td>
        <td>{formatDistance(parseJSON(submission.created_at), new Date(), { addSuffix: true })}</td>
        <td>
          {submission.status === "pending" ? "-" : Math.ceil((submission.duration / 1000000000) * 1000) / 1000 + "s"}
        </td>
        <td>
          {submission.source_language} ({prettyBytes(submission.source_size_bytes)})
        </td>
        <td>
          {submission.target_language} ({prettyBytes(submission.target_size_bytes)})
        </td>
        <td>
          {submission.status === "done" ? (
            <Button
              onClick={() => {
                // e.preventDefault();
                // e.stopPropagation();

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
        </td>
        <td>
          {submission.is_inline &&
            submission.status === "done" &&
            (submission.is_public ? (
              <Group spacing={4}>
                <Button
                  leftIcon={<Copy size={16} />}
                  onClick={() => {
                    // e.preventDefault();
                    // e.stopPropagation();
                    copyShareUrl(submission.share_id);
                  }}
                >
                  {hasBeenCopied ? "Copied!" : "Copy link"}
                </Button>
                <Button
                  aria-label="Unshare"
                  loading={updateVisibilityFetcher.state !== "idle"}
                  onClick={() => {
                    // e.preventDefault();
                    // e.stopPropagation();

                    updateVisibilityFetcher.submit(
                      { isPublic: "false" },
                      {
                        action: `/submissions/${submission.id}/visibility`,
                        replace: true,
                        method: "post",
                      }
                    );
                  }}
                >
                  <ShareOff size={16} />
                </Button>
              </Group>
            ) : (
              <Button
                variant="outline"
                leftIcon={<Share />}
                loading={updateVisibilityFetcher.state !== "idle"}
                onClick={() => {
                  // e.preventDefault();
                  // e.stopPropagation();

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
          {(!submission.is_inline || submission.status !== "done") && (
            <Button disabled variant="outline" leftIcon={<ShareOff size={16} />}>
              Share
            </Button>
          )}
        </td>
        <td>
          {submission.status === "done" ? (
            <Button
              variant="outline"
              color="red"
              loading={cleanFetcher.state !== "idle"}
              leftIcon={<Trash size={16} />}
              onClick={() => {
                // e.preventDefault();
                // e.stopPropagation();

                cleanFetcher.submit(
                  {},
                  {
                    action: `/submissions/${submission.id}/clean`,
                    replace: true,
                    method: "post",
                  }
                );
              }}
            >
              Clean
            </Button>
          ) : (
            <Button disabled variant="outline" leftIcon={<Trash size={16} />}>
              Clean
            </Button>
          )}
        </td>
        <td>
          {submission.status === "failed" && <ChevronDown size={16} transform={collapsed ? "rotate(180)" : ""} />}
        </td>
      </tr>

      {submission.status === "failed" && (
        <tr hidden={!collapsed}>
          <td className={classes.toto} colSpan={6}>
            <Title pb={"sm"} order={4}>
              Error
            </Title>
            <Code block>{submission.reason}</Code>
          </td>
        </tr>
      )}
    </>
  );
}
