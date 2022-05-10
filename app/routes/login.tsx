import { Alert, AlertDescription, AlertIcon, AlertTitle, Button, Container } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData, useSearchParams } from "@remix-run/react";
import { RiGithubFill } from "react-icons/ri";
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
    <Page title="Login">
      {error && (
        <Container maxW="4xl" mb={4}>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>An error occured!</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </Container>
      )}

      <Container>
        <a href={loaderData.githubLoginUrl}>
          <Button leftIcon={<RiGithubFill />} colorScheme="blackAlpha" variant="solid">
            Login with GitHub
          </Button>
        </a>
      </Container>
    </Page>
  );
}
