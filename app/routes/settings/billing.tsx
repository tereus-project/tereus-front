import { Button, Group, Stack, Text, Title } from "@mantine/core";
import { useOutletContext } from "@remix-run/react";
import prettyBytes from "pretty-bytes";
import { ReportMoney, Settings } from "tabler-icons-react";
import type { TereusContext } from "~/root";

export default function AccountSettingsBilling() {
  const context = useOutletContext<TereusContext>();
  const user = context.user!;

  return (
    <Stack>
      <Group
        align="start"
        sx={() => ({
          justifyContent: "space-between",
        })}
      >
        <Stack spacing={32}>
          <Stack>
            <Title order={4}>Current usage</Title>
            <Text>Your current usage is {prettyBytes(user.current_usage_bytes)}.</Text>
          </Stack>
        </Stack>
      </Group>
      <Group>
        <Button component={"a"} href="" target="_blank" variant="light" color="blue" leftIcon={<Settings />}>
          Manage subscription
        </Button>
        <Button component={"a"} href="" target="_blank" variant="light" color="blue" leftIcon={<ReportMoney />}>
          View current bill
        </Button>
      </Group>
    </Stack>
  );
}
