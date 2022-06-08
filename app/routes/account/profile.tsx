import { Button, Group, List } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useOutletContext } from "@remix-run/react";
import { useEffect, useState } from "react";
import { Download, Trash } from "tabler-icons-react";
import * as api from "~/api";
import { Page } from "~/components/Page";
import type { TereusContext } from "~/root";
import { authGuard } from "~/utils/authGuard";

interface LoaderResponse {
  response?: api.GetCurrentUserResponseDTO;
  errors: string[] | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const token = await authGuard(request);

  const [response, errors] = await api.getCurrentUser(token);
  return json<LoaderResponse>({
    response: response ?? undefined,
    errors,
  });
};

export default function History() {
  const context = useOutletContext<TereusContext>();
  const loaderData = useLoaderData<LoaderResponse>();

  const [user] = useState(loaderData.response);

  const deleteUserFetcher = useFetcher<api.ActionFormData<null>>();
  useEffect(() => {
    if (deleteUserFetcher.data?.errors) {
      showNotification({
        color: "red",
        title: "An error occured",
        message: deleteUserFetcher.data.errors.join("\n"),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deleteUserFetcher]);

  const downloadUserExport = async () => {
    const res = await fetch(`/account/export`);

    if (res.ok) {
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tereus-export.zip`;
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

  return (
    <Page title="Your account" user={context.user} containerSize="xs">
      <List>
        <List.Item>ID: {user?.id}</List.Item>
        <List.Item>Email: {user?.email}</List.Item>
      </List>

      <Group>
        <Button
          variant="outline"
          color="red"
          leftIcon={<Trash size={16} />}
          onClick={() => {
            deleteUserFetcher.submit(
              {},
              {
                action: `/account/delete`,
                replace: true,
                method: "post",
              }
            );
          }}
        >
          Delete account
        </Button>
        <Button
          variant="outline"
          leftIcon={<Download />}
          onClick={() => {
            downloadUserExport();
          }}
        >
          Download data export
        </Button>
      </Group>
    </Page>
  );
}
