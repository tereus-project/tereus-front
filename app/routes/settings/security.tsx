import { Alert, Button, Group, Modal, Stack, Title } from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import type { LoaderFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useFetcher, useLoaderData, useSearchParams } from "@remix-run/react";
import { useEffect, useMemo, useState } from "react";
import { useAuthenticityToken } from "remix-utils";
import { AlertCircle, Settings, Unlink } from "tabler-icons-react";
import type { ActionFormData, GetCurrentUserLinkedAccountsResponseDTO } from "~/api.server";
import { getCurrentUserLinkedAccounts } from "~/api.server";
import { ErrorList } from "~/components/ErrorList";
import { authGuard } from "~/utils/authGuard.server";
import { getAuthorizeUrl } from "~/utils/oauth2.server";
import type { RevokeGithubResponse } from "../auth/revoke/github";
import type { RevokeGitlabResponse } from "../auth/revoke/gitlab";

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
      githubLoginUrl: getAuthorizeUrl("github", url, url.pathname),
      gitlabLoginUrl: getAuthorizeUrl("gitlab", url, url.pathname),
      linkedAccounts,
    },
    errors: null,
  });
};

interface ProviderProps {
  type: "github" | "gitlab";
  linked: boolean;
  linkUrl: string;
  configureUrl: string;
}

function Provider({ type, linked, linkUrl, configureUrl }: ProviderProps) {
  const csrf = useAuthenticityToken();

  const title = useMemo(() => {
    switch (type) {
      case "github":
        return "GitHub";
      case "gitlab":
        return "GitLab";
    }
  }, [type]);

  const [revokeModalOpened, setRevokeModalOpened] = useState(false);
  const revokeFetcher = useFetcher<RevokeGithubResponse | RevokeGitlabResponse>();
  const revoke = () => revokeFetcher.submit({}, { method: "post", action: `/auth/revoke/${type}` });
  useEffect(() => {
    if (revokeFetcher.type === "done") {
      if (revokeFetcher.data.errors) {
        showNotification({
          color: "red",
          title: `Failed to revoke ${title} token`,
          message: revokeFetcher.data.errors.join("\n"),
        });
      } else {
        showNotification({
          color: "green",
          message: `Successfully revoked ${title} token`,
        });

        setRevokeModalOpened(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revokeFetcher]);

  return (
    <Stack>
      <Title order={4}>{title} OAuth2 settings</Title>
      <Group>
        {linked ? (
          <>
            <Button
              component={"a"}
              href={configureUrl}
              target="_blank"
              variant="light"
              color="blue"
              leftIcon={<Settings />}
            >
              Configure access
            </Button>

            <Button onClick={() => setRevokeModalOpened(true)} variant="light" color="red" leftIcon={<Unlink />}>
              Revoke access
            </Button>
          </>
        ) : (
          <Button component={"a"} href={`${linkUrl}&state=${csrf}`} color="blue" leftIcon={<Settings />}>
            Link account
          </Button>
        )}
      </Group>

      <Modal
        opened={revokeModalOpened}
        onClose={() => setRevokeModalOpened(false)}
        title={`Revoke ${title} token`}
        size="lg"
      >
        <Stack>
          <Alert icon={<AlertCircle size={16} />} color="orange">
            Revoking your {title} token will prevent access to your Tereus account from your {title} account until you
            re-link your {title} account. You still will have access to your Tereus account from other linked providers.
          </Alert>

          <Group position="right">
            <Button
              variant="light"
              color="red"
              leftIcon={<Unlink size={16} />}
              onClick={revoke}
              loading={revokeFetcher.state !== "idle"}
            >
              Yes, I want to revoke my {title} token
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  );
}

export default function AccountSettingsSecurity() {
  const loaderData = useLoaderData<LoaderResponse>();

  const [searchParams] = useSearchParams();
  const error = searchParams.get("error");

  return (
    <Stack>
      <ErrorList errors={error ? [error] : null} />
      <ErrorList errors={loaderData.errors} />

      {loaderData.response && (
        <Stack spacing={64}>
          <Provider
            type="github"
            linked={loaderData.response.linkedAccounts.github}
            linkUrl={loaderData.response.githubLoginUrl}
            configureUrl={loaderData.response.githubOauth2SettingsUrl}
          />
          <Provider
            type="gitlab"
            linked={loaderData.response.linkedAccounts.gitlab}
            linkUrl={loaderData.response.gitlabLoginUrl}
            configureUrl="https://gitlab.com/-/profile/applications"
          />
        </Stack>
      )}
    </Stack>
  );
}
