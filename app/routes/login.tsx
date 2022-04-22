import React from "react";
import { LoaderFunction, useLoaderData } from "remix";
import { Page } from "~/components/Page";

export const loader: LoaderFunction = async ({ request }) => {
  let githubLoginUrl = `https://github.com/login/oauth/authorize?scope=user:email%20repo%20gist&client_id=${process.env.GITHUB_OAUTH2_CLIENT_ID}`;

  if (process.env.NODE_ENV === "development") {
    const url = new URL(request.url);
    githubLoginUrl += `&redirect_uri=http://127.0.0.1:${url.port}/auth/github`;
  }

  return {
    githubLoginUrl,
  };
}

export default function Login() {
  const loaderData = useLoaderData<Awaited<ReturnType<typeof loader>>>();

  return (
    <Page title="Login" icon="lock">
      <a href={loaderData.githubLoginUrl}>Login with GitHub</a>
    </Page>
  );
}
