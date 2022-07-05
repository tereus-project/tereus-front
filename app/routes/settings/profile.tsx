import { Anchor, Button, Group, Input, InputWrapper, Stack, Text, Title } from "@mantine/core";
import type { MetaFunction } from "@remix-run/node";
import { Link, useOutletContext } from "@remix-run/react";
import { At } from "tabler-icons-react";
import { UserAvatar } from "~/components/UserAvatar";
import type { TereusContext } from "~/root";

export const meta: MetaFunction = () => ({
  title: "Profile | Settings | Tereus",
});

export default function AccountSettingsProfile() {
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
            <Title order={4}>User ID</Title>
            <Text>{user.id}</Text>
          </Stack>
          <Stack>
            <Title order={4}>Details</Title>
            <InputWrapper label="Email">
              <Input icon={<At size={16} />} placeholder="Your email" value={user.email} disabled />
            </InputWrapper>
          </Stack>
        </Stack>

        <Stack align="center">
          <UserAvatar email={user.email} size={128} />
          <Button component="a" href="https://gravatar.com/emails/" variant="light">
            Edit your avatar
          </Button>
        </Stack>
      </Group>

      <Stack spacing={64}>
        <Stack>
          <Title order={4}>Subscription</Title>
          {user.subscription ? (
            <Text>
              Currently subscribed to the {user.subscription.tier} tier.{" "}
              <Anchor component={Link} to="/pricing">
                Click here
              </Anchor>{" "}
              to review your perks.
            </Text>
          ) : (
            <Text>
              You currently have no subscription.{" "}
              <Anchor component={Link} to="/pricing">
                Click here
              </Anchor>{" "}
              to review our pricing.
            </Text>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
}
