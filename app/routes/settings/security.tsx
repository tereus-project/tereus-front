import { Button, Group, Stack, Title } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Settings } from "tabler-icons-react";

export interface LoaderResponse {
  githubOauth2SettingsUrl: string;
}

export const loader: LoaderFunction = async () => {
  return json<LoaderResponse>({
    githubOauth2SettingsUrl: `https://github.com/settings/connections/applications/${process.env.GITHUB_OAUTH2_CLIENT_ID}`,
  });
};

export default function AccountSettingsSecurity() {
  const loaderData = useLoaderData<LoaderResponse>();

  return (
    <Stack spacing={64}>
      <Stack>
        <Title order={4}>GitHub OAuth2 settings</Title>
        <Group>
          <Button
            component={"a"}
            href={loaderData.githubOauth2SettingsUrl}
            target="_blank"
            variant="light"
            color="blue"
            leftIcon={<Settings />}
          >
            Configure access
          </Button>
        </Group>
      </Stack>
    </Stack>
  );
}
