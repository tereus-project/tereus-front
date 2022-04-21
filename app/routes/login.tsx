import React from "react";
import { LoaderFunction, useLoaderData } from "remix";
import { Page } from "~/components/Page";

export const loader: LoaderFunction = async () => {
  return {
    githubLoginUrl: `https://github.com/login/oauth/authorize?scope=user:email%20repo%20gist&client_id=${process.env.GITHUB_OAUTH2_CLIENT_ID}`,
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
