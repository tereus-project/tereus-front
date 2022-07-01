import { Alert, Anchor, Button, Card, Stack } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { AlertCircle, BrandGithub, BrandGitlab } from "tabler-icons-react";
import { Page } from "~/components/Page";

type LoaderData = {
  githubLoginUrl: string;
  gitlabLoginUrl: string;
};

export function getRedirectUri(provider: "github" | "gitlab", origin: URL, to: string | null) {
  const searchParams = new URLSearchParams();

  if (to) {
    searchParams.set("to", to);
  }

  if (process.env.FRONT_URL) {
    return `${process.env.FRONT_URL}/auth/${provider}?${searchParams.toString()}`;
  }

  return `http://127.0.0.1:${origin.port}/auth/${provider}?${searchParams.toString()}`;
}

const AUTHORIZE_URLS = {
  github: "https://github.com/login/oauth/authorize?scope=user:email%20repo%20gist",
  gitlab: "https://gitlab.com/oauth/authorize?scope=read_api%20read_user%20read_repository&response_type=code",
};

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  const to = url.searchParams.get("to");

  let githubLoginUrl = `${AUTHORIZE_URLS.github}&client_id=${
    process.env.GITHUB_OAUTH2_CLIENT_ID
  }&redirect_uri=${getRedirectUri("github", url, to)}`;
  let gitlabLoginUrl = `${AUTHORIZE_URLS.gitlab}&client_id=${
    process.env.GITLAB_OAUTH2_CLIENT_ID
  }&redirect_uri=${getRedirectUri("gitlab", url, to)}`;

  return {
    githubLoginUrl,
    gitlabLoginUrl,
  } as LoaderData;
};

export default function Login() {
  const loaderData = useLoaderData<LoaderData>();
  const [searchParams] = useSearchParams();

  const error = searchParams.get("error");

  return (
    <Page title="Login to Tereus" subtitle="Sign up or create an account in one click!" containerSize="sm">
      {error && (
        <Alert icon={<AlertCircle size={16} />} title="An error occured!" color="red" mb={12}>
          {error}
        </Alert>
      )}

      <Card shadow="sm" withBorder>
        <Stack>
          <Anchor href={loaderData.githubLoginUrl}>
            <Button fullWidth leftIcon={<BrandGithub />} color="blue">
              Continue with GitHub
            </Button>
          </Anchor>

          <Anchor href={loaderData.gitlabLoginUrl}>
            <Button fullWidth leftIcon={<BrandGitlab />} color="blue">
              Continue with GitLab
            </Button>
          </Anchor>
        </Stack>
      </Card>
    </Page>
  );
}
