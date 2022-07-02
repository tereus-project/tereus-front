import { Button, Group, Stack, Title } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useAuthenticityToken } from "remix-utils";
import { Settings } from "tabler-icons-react";
import type { ActionFormData, GetCurrentUserLinkedAccountsResponseDTO } from "~/api";
import { getCurrentUserLinkedAccounts } from "~/api";
import { ErrorList } from "~/components/ErrorList";
import { authGuard } from "~/utils/authGuard.server";
import { getAuthorizeUrl } from "~/utils/oauth2.server";

export type LoaderResponse = ActionFormData<{
  githubOauth2SettingsUrl: string;
  githubLoginUrl: string;
  gitlabLoginUrl: string;
  linkedAccounts: GetCurrentUserLinkedAccountsResponseDTO;
}>;

export const loader: LoaderFunction = async ({ request }) => {
  const { token } = await authGuard(request);

  const [linkedAccounts, errors] = await getCurrentUserLinkedAccounts(token);
  if (errors) {
    return json({ response: null, errors });
  }

  const url = new URL(request.url);

  return json<LoaderResponse>({
    response: {
      githubOauth2SettingsUrl: `https://github.com/settings/connections/applications/${process.env.GITHUB_OAUTH2_CLIENT_ID}`,
      githubLoginUrl: `${getAuthorizeUrl("github", url, url.pathname)}`,
      gitlabLoginUrl: getAuthorizeUrl("gitlab", url, url.pathname),
      linkedAccounts,
    },
    errors: null,
  });
};

export default function AccountSettingsSecurity() {
  const loaderData = useLoaderData<LoaderResponse>();
  const csrf = useAuthenticityToken();

  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  if (loaderData.errors) {
    return <ErrorList errors={loaderData.errors} />;
  }

  const response = loaderData.response!;

  return (
    <Stack>
      <ErrorList errors={error ? [error] : null} />

      <Stack spacing={64}>
        <Stack>
          <Title order={4}>GitHub OAuth2 settings</Title>
          <Group>
            {response.linkedAccounts.github ? (
              <Button
                component={"a"}
                href={response.githubOauth2SettingsUrl}
                target="_blank"
                variant="light"
                color="blue"
                leftIcon={<Settings />}
              >
                Configure access
              </Button>
            ) : (
              <Button
                component={"a"}
                href={`${response.githubLoginUrl}&state=${csrf}`}
                color="blue"
                leftIcon={<Settings />}
              >
                Link account
              </Button>
            )}
          </Group>
        </Stack>
        <Stack>
          <Title order={4}>GitLab OAuth2 settings</Title>
          <Group>
            {response.linkedAccounts.gitlab ? (
              <Button
                component={"a"}
                href="https://gitlab.com/-/profile/applications"
                target="_blank"
                variant="light"
                color="blue"
                leftIcon={<Settings />}
              >
                Configure access
              </Button>
            ) : (
              <Button
                component={"a"}
                href={`${response.gitlabLoginUrl}&state=${csrf}`}
                color="blue"
                leftIcon={<Settings />}
              >
                Link account
              </Button>
            )}
          </Group>
        </Stack>
      </Stack>
    </Stack>
  );
}
