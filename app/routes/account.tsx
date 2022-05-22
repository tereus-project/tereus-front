import { Container, ListItem, UnorderedList } from "@chakra-ui/react";
import type { LoaderFunction } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { useLoaderData, useOutletContext } from "@remix-run/react";
import { useState } from "react";
import * as api from "~/api";
import { Page } from "~/components/Page";
import { sessionCookie } from "~/cookie";
import type { TereusContext } from "~/root";

interface LoaderResponse {
  response?: api.GetCurrentUserResponseDTO;
  errors: string[] | null;
}

export const loader: LoaderFunction = async ({ request }) => {
  const cookieHeader = request.headers.get("Cookie");
  const session = (await sessionCookie.parse(cookieHeader)) || {};

  if (!session.token) {
    const url = new URL(request.url);
    return redirect(`/login?to=${url.pathname}${url.search}`);
  }

  const [response, errors] = await api.getCurrentUser(session.token);
  return json<LoaderResponse>({
    response: response ?? undefined,
    errors,
  });
};

export default function History() {
  const context = useOutletContext<TereusContext>();
  const loaderData = useLoaderData<LoaderResponse>();

  const [user] = useState(loaderData.response);

  return (
    <Page title="Your account" user={context.user}>
      <Container>
        <UnorderedList>
          <ListItem>ID: {user?.id}</ListItem>
          <ListItem>Email: {user?.email}</ListItem>
        </UnorderedList>
      </Container>
    </Page>
  );
}
