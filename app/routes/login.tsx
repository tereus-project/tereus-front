import { Alert, Anchor, Button, Card, Stack } from "@mantine/core";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { AlertCircle, BrandGithub, BrandGitlab } from "tabler-icons-react";
import { Page } from "~/components/Page";

type LoaderData = {
  githubLoginUrl: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  let githubLoginUrl = `https://github.com/login/oauth/authorize?scope=user:email%20repo%20gist&client_id=${process.env.GITHUB_OAUTH2_CLIENT_ID}`;

  const queries = new URL(request.url).searchParams;
  const to = queries.get("to");

  const searchParams = new URLSearchParams();

  if (to) {
    searchParams.append("to", to);
  }

  if (process.env.FRONT_URL) {
    githubLoginUrl += `&redirect_uri=${process.env.FRONT_URL}/auth/github?${searchParams.toString()}`;
  } else if (process.env.NODE_ENV === "development") {
    const url = new URL(request.url);
    githubLoginUrl += `&redirect_uri=http://127.0.0.1:${url.port}/auth/github?${searchParams.toString()}`;
  }

  return {
    githubLoginUrl,
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

          <Anchor href={loaderData.githubLoginUrl}>
            <Button fullWidth leftIcon={<BrandGitlab />} color="blue">
              Continue with GitLab
            </Button>
          </Anchor>
        </Stack>
      </Card>
    </Page>
  );
}
