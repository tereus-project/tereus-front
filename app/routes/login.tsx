import { Button } from "@chakra-ui/react";
import { RiGithubFill } from "react-icons/ri";
import type { LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Page } from "~/components/Page";

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
  };
};

export default function Login() {
  const loaderData = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  return (
    <Page title="Login">
      <a href={loaderData.githubLoginUrl}>
        <Button leftIcon={<RiGithubFill />} colorScheme="blackAlpha" variant="solid">
          Login with GitHub
        </Button>
      </a>
    </Page>
  );
}
