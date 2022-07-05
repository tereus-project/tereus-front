import { Alert, Anchor, Button, Card, Stack } from "@mantine/core";
import type { LoaderFunction, MetaFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { useAuthenticityToken } from "remix-utils";
import { AlertCircle, BrandGithub, BrandGitlab } from "tabler-icons-react";
import { Page } from "~/components/Page";
import { authGuardMaybe } from "~/utils/authGuard.server";
import { getAuthorizeUrl } from "~/utils/oauth2.server";

export const meta: MetaFunction = () => ({
  title: "Login | Tereus",
});

type LoaderData = {
  githubLoginUrl: string;
  gitlabLoginUrl: string;
};

export const loader: LoaderFunction = async ({ request }) => {
  const { token } = await authGuardMaybe(request);

  if (token) {
    return redirect("/");
  }

  const url = new URL(request.url);
  const to = url.searchParams.get("to");

  return {
    githubLoginUrl: getAuthorizeUrl("github", url, to),
    gitlabLoginUrl: getAuthorizeUrl("gitlab", url, to),
  } as LoaderData;
};

export default function Login() {
  const csrf = useAuthenticityToken();

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
          <Anchor href={`${loaderData.githubLoginUrl}&state=${csrf}`}>
            <Button fullWidth leftIcon={<BrandGithub />} color="blue">
              Continue with GitHub
            </Button>
          </Anchor>

          <Anchor href={`${loaderData.gitlabLoginUrl}&state=${csrf}`}>
            <Button fullWidth leftIcon={<BrandGitlab />} color="blue">
              Continue with GitLab
            </Button>
          </Anchor>
        </Stack>
      </Card>
    </Page>
  );
}
