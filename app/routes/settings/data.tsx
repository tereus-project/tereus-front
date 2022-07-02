import { Alert, Button, Group, Modal, Stack, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { useFetcher } from "@remix-run/react";
import { useEffect, useState } from "react";
import { AlertCircle, Download, InfoCircle, Trash } from "tabler-icons-react";
import type { ActionFormData } from "~/api.server";

export default function AccountSettingsProfile() {
  const deleteUserFetcher = useFetcher<ActionFormData<null>>();
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
    const res = await fetch(`/settings/data/export`);

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

  const [modalOpened, setModalOpened] = useState(false);

  return (
    <Stack spacing={64}>
      <Stack>
        <Title order={4}>Data export</Title>
        <Alert icon={<InfoCircle size={16} />} color="blue">
          Exported data contains everything we store about you.
        </Alert>

        <Group>
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
      </Stack>

      <Modal opened={modalOpened} onClose={() => setModalOpened(false)} title="Delete account confirmation">
        <Stack>
          <Alert icon={<AlertCircle size={16} />} color="red">
            Deleting your account is permanent and cannot be undone. Make sure you have a backup of your data before
            proceeding!
          </Alert>

          <Group>
            <Button
              variant="outline"
              color="red"
              leftIcon={<Trash size={16} />}
              onClick={() => {
                deleteUserFetcher.submit(
                  {},
                  {
                    action: `/settings/data/delete`,
                    replace: true,
                    method: "post",
                  }
                );
              }}
            >
              Yes, I want to delete my account
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Stack>
        <Title order={4}>Delete account</Title>
        <Alert icon={<AlertCircle size={16} />} color="red">
          Deleting your account is permanent and cannot be undone. Be sure to backup your data before deleting your
          account.
        </Alert>

        <Group>
          <Button variant="outline" color="red" leftIcon={<Trash size={16} />} onClick={() => setModalOpened(true)}>
            Delete account
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}
